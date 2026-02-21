import express from "express";
import {
  LoginController,
  SignupController,
} from "../controller/auth.controller.js";

const router = express.Router();

router.post("/signup", SignupController);
router.get("/login", LoginController);

export default router;
