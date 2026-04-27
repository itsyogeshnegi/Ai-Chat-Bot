import dotenv from "dotenv";

dotenv.config();

const toBool = (value, fallback = false) => {
  if (value === undefined) {
    return fallback;
  }

  return value === "true";
};

export const env = {
  nodeEnv: process.env.NODE_ENV || "development",
  port: Number(process.env.PORT || 5000),
  clientUrl: process.env.CLIENT_URL || "http://localhost:5173",
  mongoUri:
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/ollama-chat",
  jwtSecret: process.env.JWT_SECRET || "change-me",
  jwtExpiresIn: process.env.JWT_EXPIRES_IN || "7d",
  ollamaBaseUrl: process.env.OLLAMA_BASE_URL || "http://localhost:11434",
  defaultModel: process.env.DEFAULT_MODEL || "llama3.2:3b",
  enableMetadataTtl: toBool(process.env.ENABLE_METADATA_TTL),
  chatMetadataTtlDays: Number(process.env.CHAT_METADATA_TTL_DAYS || 30)
};
