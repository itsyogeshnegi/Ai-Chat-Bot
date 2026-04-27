import {
  createContext,
  useEffect,
  useMemo,
  useRef,
  useState
} from "react";
import { api } from "../lib/api.js";
import { streamChatResponse } from "../lib/chatStream.js";
import { useAuth } from "../hooks/useAuth.js";
import { createMessage, DEFAULT_MODEL } from "../utils/chat.js";
import { transcriptStorage } from "../utils/storage.js";

export const ChatContext = createContext(null);

const normalizeModel = (model) =>
  model === "llama3" || model === "qwen3.5:latest"
    ? DEFAULT_MODEL
    : model || DEFAULT_MODEL;

export const ChatProvider = ({ children }) => {
  const { token, user, isAuthenticated } = useAuth();
  const [history, setHistory] = useState([]);
  const [activeChatId, setActiveChatId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("idle");
  const [streamError, setStreamError] = useState("");
  const [activeModel, setActiveModel] = useState(DEFAULT_MODEL);
  const abortRef = useRef(false);

  const loadHistory = async (query = "") => {
    if (!isAuthenticated) {
      return;
    }

    const { data } = await api.get("/history", {
      params: query ? { q: query } : {}
    });

    const normalizedChats = data.chats.map((chat) => ({
      ...chat,
      model: normalizeModel(chat.model)
    }));

    setHistory(normalizedChats);

    if (!activeChatId && normalizedChats[0]) {
      setActiveChatId(normalizedChats[0].id);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadHistory().catch(() => {});
    } else {
      setHistory([]);
      setActiveChatId(null);
      setMessages([]);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    if (!user?.id || !activeChatId) {
      setMessages([]);
      return;
    }

    const transcript = transcriptStorage.getMessages(user.id, activeChatId);
    setMessages(transcript);

    const current = history.find((chat) => chat.id === activeChatId);
    if (current?.model) {
      const normalizedModel = normalizeModel(current.model);
      setActiveModel(normalizedModel);

      if (current.model !== normalizedModel) {
        api.patch(`/chat/${activeChatId}`, { model: normalizedModel }).catch(() => {});
      }
    }
  }, [activeChatId, history, user?.id]);

  const persistMessages = (chatId, updater) => {
    setMessages((current) => {
      const next =
        typeof updater === "function" ? updater(current) : updater;

      if (user?.id && chatId) {
        transcriptStorage.setMessages(user.id, chatId, next);
      }

      return next;
    });
  };

  const upsertHistory = (chat) => {
    const normalizedChat = {
      ...chat,
      model: normalizeModel(chat.model)
    };

    setHistory((current) => {
      const exists = current.some((entry) => entry.id === normalizedChat.id);
      const next = exists
        ? current.map((entry) => (entry.id === normalizedChat.id ? normalizedChat : entry))
        : [normalizedChat, ...current];

      return [...next].sort((a, b) => {
        if (a.isFavorite !== b.isFavorite) {
          return a.isFavorite ? -1 : 1;
        }

        return new Date(b.updatedAt) - new Date(a.updatedAt);
      });
    });
  };

  const createNewChat = async (model = activeModel) => {
    const selectedModel = normalizeModel(model);
    const { data } = await api.post("/chat/new", { model: selectedModel });
    upsertHistory(data.chat);
    setActiveChatId(data.chat.id);
    setActiveModel(normalizeModel(data.chat.model));
    if (user?.id) {
      transcriptStorage.setMessages(user.id, data.chat.id, []);
    }
    return data.chat;
  };

  const ensureChat = async () => {
    if (activeChatId) {
      return activeChatId;
    }

    const chat = await createNewChat(activeModel);
    return chat.id;
  };

  const sendMessage = async ({ prompt, regenerate = false } = {}) => {
    setStreamError("");
    setStatus("streaming");
    abortRef.current = false;

    const chatId = await ensureChat();
    const transcript = transcriptStorage.getMessages(user.id, chatId);
    const requestModel = normalizeModel(activeModel);

    if (requestModel !== activeModel) {
      setActiveModel(requestModel);
    }

    let workingMessages = [...transcript];
    let requestPrompt = prompt;
    let contextMessages = [...transcript];

    if (regenerate) {
      const lastAssistantIndex = [...workingMessages]
        .reverse()
        .findIndex((message) => message.role === "assistant");

      if (lastAssistantIndex >= 0) {
        const removeIndex = workingMessages.length - 1 - lastAssistantIndex;
        workingMessages = workingMessages.filter((_, index) => index !== removeIndex);
      }

      const lastUser = [...workingMessages]
        .reverse()
        .find((message) => message.role === "user");

      requestPrompt = lastUser?.content || "";
      let lastUserIndex = -1;

      for (let index = workingMessages.length - 1; index >= 0; index -= 1) {
        const message = workingMessages[index];

        if (message.role === "user" && message.content === requestPrompt) {
          lastUserIndex = index;
          break;
        }
      }

      contextMessages =
        lastUserIndex >= 0 ? workingMessages.slice(0, lastUserIndex) : workingMessages;
    } else {
      const userMessage = createMessage({ role: "user", content: prompt });
      workingMessages = [...workingMessages, userMessage];
      contextMessages = transcript;
    }

    const assistantPlaceholder = createMessage({
      role: "assistant",
      content: "",
      pending: true
    });

    workingMessages = [...workingMessages, assistantPlaceholder];
    persistMessages(chatId, workingMessages);
    setActiveChatId(chatId);

    try {
      await streamChatResponse({
        token,
        body: {
          chatId,
          prompt: requestPrompt,
          model: requestModel,
          context: contextMessages.map(({ role, content }) => ({ role, content }))
        },
        onEvent: (event) => {
          if (event.type === "delta") {
            persistMessages(chatId, (current) =>
              current.map((message) =>
                message.id === assistantPlaceholder.id
                  ? {
                      ...message,
                      content: `${message.content}${event.delta}`,
                      pending: false
                    }
                  : message
              )
            );
          }

          if (event.type === "done") {
            persistMessages(chatId, (current) =>
              current.map((message) =>
                message.id === assistantPlaceholder.id
                  ? {
                      ...message,
                      pending: false,
                      metrics: event.metrics
                    }
                  : message
              )
            );

            upsertHistory(event.chat);
            setActiveModel(normalizeModel(event.chat.model));
          }

          if (event.type === "error") {
            setStreamError(event.message);
            persistMessages(chatId, (current) =>
              current.filter((message) => message.id !== assistantPlaceholder.id)
            );
          }
        }
      });
    } catch (error) {
      setStreamError(error.message || "Unable to stream response.");
      persistMessages(chatId, (current) =>
        current.filter((message) => message.id !== assistantPlaceholder.id)
      );
    } finally {
      setStatus("idle");
    }
  };

  const renameChat = async (id, title) => {
    const { data } = await api.patch(`/chat/${id}`, { title });
    upsertHistory(data.chat);
  };

  const toggleFavorite = async (chat) => {
    const { data } = await api.patch(`/chat/${chat.id}`, {
      isFavorite: !chat.isFavorite
    });
    upsertHistory(data.chat);
  };

  const selectChat = (chatId) => {
    setActiveChatId(chatId);
  };

  const deleteChat = async (chatId) => {
    await api.delete(`/chat/${chatId}`);
    transcriptStorage.deleteChat(user.id, chatId);
    setHistory((current) => {
      const nextHistory = current.filter((chat) => chat.id !== chatId);

      if (activeChatId === chatId) {
        const nextChat = nextHistory[0] || null;
        setActiveChatId(nextChat?.id || null);
        setMessages(nextChat ? transcriptStorage.getMessages(user.id, nextChat.id) : []);
      }

      return nextHistory;
    });
  };

  const clearLocalChats = () => {
    transcriptStorage.clearUserChats(user.id);
    setMessages([]);
  };

  const updateSearch = async (value) => {
    setSearch(value);
    await loadHistory(value);
  };

  const updateModel = async (model) => {
    const selectedModel = normalizeModel(model);
    setActiveModel(selectedModel);
    if (activeChatId) {
      const { data } = await api.patch(`/chat/${activeChatId}`, { model: selectedModel });
      upsertHistory(data.chat);
    }
  };

  const value = useMemo(
    () => ({
      history,
      activeChatId,
      messages,
      activeModel,
      search,
      status,
      streamError,
      createNewChat,
      sendMessage,
      renameChat,
      toggleFavorite,
      selectChat,
      deleteChat,
      clearLocalChats,
      updateSearch,
      updateModel,
      reloadHistory: loadHistory
    }),
    [history, activeChatId, messages, activeModel, search, status, streamError]
  );

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};
