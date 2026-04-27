import { Router } from "express";
import { getHistory } from "../controllers/chatController.js";
import { requireAuth } from "../middleware/authMiddleware.js";

const router = Router();

router.get("/", requireAuth, getHistory);

export default router;
