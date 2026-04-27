import mongoose from "mongoose";
import { SUPPORTED_MODELS } from "../utils/constants.js";

const chatMetaSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80
    },
    lastMessagePreview: {
      type: String,
      default: "",
      trim: true,
      maxlength: 160
    },
    model: {
      type: String,
      enum: SUPPORTED_MODELS,
      default: "llama3.2:3b"
    },
    isFavorite: {
      type: Boolean,
      default: false
    },
    lastOpenedAt: {
      type: Date,
      default: Date.now
    },
    expiresAt: {
      type: Date,
      default: null,
      index: {
        expireAfterSeconds: 0
      }
    }
  },
  {
    timestamps: true
  }
);

export const ChatMeta = mongoose.model("ChatMeta", chatMetaSchema);
