import express from "express";
import { loginUser, registerUser, sendOtp } from "../controllers/auth.controller.js";

const router = express.Router();

router.post("/send-otp", sendOtp);
router.post("/register", registerUser);
router.post("/login", loginUser);

export default router;