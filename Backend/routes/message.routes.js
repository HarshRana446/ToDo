import express from "express";
import {
  EditMessageController,
  GetMessageController,
  MarkAsReadController,
  SendMessageController,
} from "../controller/message.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/send/:id", AuthMiddleware, SendMessageController);
router.get("/get/:conversationId", AuthMiddleware, GetMessageController);
router.get("/unread/:conversationId", AuthMiddleware, MarkAsReadController);
router.patch("/edit/:id", AuthMiddleware, EditMessageController);

export default router;