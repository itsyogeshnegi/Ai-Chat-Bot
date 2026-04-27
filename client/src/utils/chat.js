export const DEFAULT_MODEL = "llama3.2:3b";

export const MODELS = [DEFAULT_MODEL, "llama3", "mistral", "gemma"];

export const createMessage = ({
  role,
  content,
  pending = false,
  metrics = null
}) => ({
  id: crypto.randomUUID(),
  role,
  content,
  pending,
  metrics,
  copiedAt: null,
  createdAt: new Date().toISOString()
});

export const buildExportText = (messages = []) =>
  messages
    .map(
      (message) =>
        `${message.role === "assistant" ? "Assistant" : "You"}\n${message.content}`
    )
    .join("\n\n");

export const estimateWordsPerMinute = (metrics) => {
  if (!metrics?.durationMs || !metrics?.estimatedTokens) {
    return null;
  }

  const minutes = metrics.durationMs / 60000;
  const words = metrics.estimatedTokens * 0.75;
  return Math.round(words / Math.max(minutes, 0.01));
};
