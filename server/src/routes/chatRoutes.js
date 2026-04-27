import { Router } from "express";
import {
  createChat,
  deleteChat,
  streamChat,
  updateChat
} from "../controllers/chatController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.post("/", requireAuth, streamChat);
router.post("/new", requireAuth, createChat);
router.patch("/:id", requireAuth, updateChat);
router.delete("/:id", requireAuth, deleteChat);

export default router;
