import { ChatMeta } from "../models/ChatMeta.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import {
  buildChatTitle,
  buildExpirationDate,
  buildPreview
} from "../utils/chatHelpers.js";
import { SUPPORTED_MODELS } from "../utils/constants.js";
import { env } from "../config/env.js";
import { streamOllamaResponse } from "../services/ollamaService.js";

const normalizeModel = (model) =>
  model === "llama3" || model === "qwen3.5:latest"
    ? env.defaultModel
    : model || env.defaultModel;

const serializeChat = (chat) => ({
  id: chat._id,
  title: chat.title,
  lastMessagePreview: chat.lastMessagePreview,
  model: chat.model,
  isFavorite: chat.isFavorite,
  lastOpenedAt: chat.lastOpenedAt,
  createdAt: chat.createdAt,
  updatedAt: chat.updatedAt
});

const ensureModel = (model) => {
  if (!SUPPORTED_MODELS.includes(model)) {
    const error = new Error("Unsupported model selected.");
    error.statusCode = 400;
    throw error;
  }
};

export const createChat = asyncHandler(async (req, res) => {
  const { title, model } = req.body;
  const selectedModel = normalizeModel(model);
  ensureModel(selectedModel);

  const chat = await ChatMeta.create({
    user: req.user._id,
    title: title?.trim() || "New chat",
    model: selectedModel,
    expiresAt: buildExpirationDate()
  });

  res.status(201).json({ chat: serializeChat(chat) });
});

export const getHistory = asyncHandler(async (req, res) => {
  const query = req.query.q?.trim();
  const filter = { user: req.user._id };

  if (query) {
    filter.$or = [
      { title: { $regex: query, $options: "i" } },
      { lastMessagePreview: { $regex: query, $options: "i" } }
    ];
  }

  if (req.query.favorite === "true") {
    filter.isFavorite = true;
  }

  const chats = await ChatMeta.find(filter).sort({
    isFavorite: -1,
    updatedAt: -1
  });

  const staleChats = chats.filter(
    (chat) => chat.model === "llama3" || chat.model === "qwen3.5:latest"
  );

  if (staleChats.length > 0) {
    await ChatMeta.updateMany(
      {
        _id: { $in: staleChats.map((chat) => chat._id) },
        user: req.user._id
      },
      {
        $set: {
          model: env.defaultModel
        }
      }
    );

    staleChats.forEach((chat) => {
      chat.model = env.defaultModel;
    });
  }

  res.json({
    chats: chats.map(serializeChat)
  });
});

export const updateChat = asyncHandler(async (req, res) => {
  const chat = await ChatMeta.findOne({
    _id: req.params.id,
    user: req.user._id
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found.");
  }

  const { title, isFavorite, model, lastMessagePreview } = req.body;

  if (model) {
    const selectedModel = normalizeModel(model);
    ensureModel(selectedModel);
    chat.model = selectedModel;
  }

  if (typeof title === "string" && title.trim()) {
    chat.title = title.trim().slice(0, 80);
  }

  if (typeof isFavorite === "boolean") {
    chat.isFavorite = isFavorite;
  }

  if (typeof lastMessagePreview === "string") {
    chat.lastMessagePreview = buildPreview(lastMessagePreview);
  }

  chat.lastOpenedAt = new Date();
  chat.expiresAt = buildExpirationDate();
  await chat.save();

  res.json({ chat: serializeChat(chat) });
});

export const deleteChat = asyncHandler(async (req, res) => {
  const chat = await ChatMeta.findOneAndDelete({
    _id: req.params.id,
    user: req.user._id
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found.");
  }

  res.json({ success: true });
});

export const streamChat = asyncHandler(async (req, res) => {
  const { chatId, prompt, model, context } = req.body;
  const selectedModel = normalizeModel(model);
  ensureModel(selectedModel);

  if (!chatId || !prompt?.trim()) {
    res.status(400);
    throw new Error("chatId and prompt are required.");
  }

  const chat = await ChatMeta.findOne({
    _id: chatId,
    user: req.user._id
  });

  if (!chat) {
    res.status(404);
    throw new Error("Chat not found.");
  }

  if (chat.model === "llama3" || chat.model === "qwen3.5:latest") {
    chat.model = env.defaultModel;
    await chat.save();
  }

  const historyPrefix = Array.isArray(context)
    ? context
        .map((entry) => `${entry.role === "assistant" ? "Assistant" : "User"}: ${entry.content}`)
        .join("\n\n")
    : "";

  const finalPrompt = historyPrefix
    ? `${historyPrefix}\n\nUser: ${prompt}\nAssistant:`
    : prompt;

  const startTime = Date.now();
  const abortController = new AbortController();

  req.on("close", () => {
    abortController.abort();
  });

  res.writeHead(200, {
    "Content-Type": "application/x-ndjson; charset=utf-8",
    "Cache-Control": "no-cache, no-transform",
    Connection: "keep-alive"
  });

  const emit = (payload) => {
    res.write(`${JSON.stringify(payload)}\n`);
  };

  emit({
    type: "start",
    chatId: chat._id.toString(),
    model: selectedModel
  });

  try {
    const result = await streamOllamaResponse({
      prompt: finalPrompt,
      model: selectedModel,
      signal: abortController.signal,
      onChunk: (delta) => emit({ type: "delta", delta })
    });

    const outputText = result.text.trim();
    const now = new Date();

    if (!chat.lastMessagePreview) {
      chat.title = buildChatTitle(prompt);
    }

    chat.model = selectedModel;
    chat.lastMessagePreview = buildPreview(outputText || prompt);
    chat.lastOpenedAt = now;
    chat.expiresAt = buildExpirationDate();
    await chat.save();

    emit({
      type: "done",
      chat: serializeChat(chat),
      metrics: {
        durationMs: Date.now() - startTime,
        estimatedTokens: Math.max(
          1,
          Math.round((prompt.length + outputText.length) / 4)
        ),
        evalCount: result.stats?.eval_count ?? null,
        promptEvalCount: result.stats?.prompt_eval_count ?? null
      }
    });

    res.end();
  } catch (error) {
    const isAbort = error.name === "AbortError";
    emit({
      type: "error",
      message: isAbort
        ? "The request was cancelled."
        : error.message ||
          "Unable to reach Ollama. Make sure it is running locally."
    });
    res.end();
  }
});
