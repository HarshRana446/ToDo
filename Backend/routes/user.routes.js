import express from "express";
import { AuthMiddleware } from "../middleware/auth.middleware.js";

const router = express.Router();

router.get("/profile", AuthMiddleware, (req, res) => {
  res.status(200).json({ message: "User profile", user: req.user });
});

export default router;
