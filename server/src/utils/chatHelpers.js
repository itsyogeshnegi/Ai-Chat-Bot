import { env } from "../config/env.js";

export const buildChatTitle = (prompt = "") => {
  const clean = prompt.replace(/\s+/g, " ").trim();

  if (!clean) {
    return "Untitled chat";
  }

  return clean.slice(0, 48);
};

export const buildPreview = (text = "") => {
  const clean = text.replace(/\s+/g, " ").trim();
  return clean.slice(0, 140);
};

export const buildExpirationDate = () => {
  if (!env.enableMetadataTtl) {
    return null;
  }

  const expiry = new Date();
  expiry.setDate(expiry.getDate() + env.chatMetadataTtlDays);
  return expiry;
};
