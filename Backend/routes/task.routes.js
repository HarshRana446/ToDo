import express from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";
import {
  createTask,
  getTasks,
  updateTaskStatus,
  updateTask,
  deleteTask
} from "../controller/task.controller.js";

const router = express.Router();

router.post("/", AuthMiddleware, createTask);
router.get("/", AuthMiddleware, getTasks);
router.patch("/:id/status", AuthMiddleware, updateTaskStatus);
router.put("/:id", AuthMiddleware, updateTask);
router.delete("/:id", AuthMiddleware, deleteTask);

export default router;
