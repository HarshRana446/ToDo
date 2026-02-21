import express from "express";
import { SendMessageController } from "../controller/message.controller.js";

const router = express.Router();

router.post("/send", SendMessageController);

export default router;