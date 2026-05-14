import express from "express";
import { getInvestorPassword } from "../controllers/investorPassword.controller.js";

const router = express.Router();

// Admin/internal route to get decrypted investor password (protect in production!)
router.get("/:userId", getInvestorPassword);

export default router;
