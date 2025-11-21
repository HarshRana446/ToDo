import express from "express";
import { createColumn, getColumns } from "../controller/column.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", AuthMiddleware, createColumn);
router.get("/", AuthMiddleware, getColumns);

export default router;

