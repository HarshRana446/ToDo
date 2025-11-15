import express from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import { createTask, getTasks } from "../controller/task.controller.js";

const router = express.Router();

router.post("/", AuthMiddleware, createTask);
router.get("/", AuthMiddleware, getTasks);

export default router;
