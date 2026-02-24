import express from "express";
import {
  createConversation,
  getUserConversations,
} from "../controller/conversation.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/conversation/:receiverId", AuthMiddleware, createConversation);
router.get("/conversation", AuthMiddleware,  getUserConversations);

export default router;
