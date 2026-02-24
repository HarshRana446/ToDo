import express from "express";
import {
  getUserByEmail,
  LoginController,
  SignupController,
} from "../controller/auth.controller.js";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/signup", SignupController);
router.post("/login", LoginController);
router.get("/search", AuthMiddleware, getUserByEmail);
export default router;
