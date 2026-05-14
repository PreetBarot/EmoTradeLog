import express from "express";
import { receiveMT5Trade } from "../controllers/mt5Controller.js";

const router = express.Router();

// Webhook endpoint for MT5 trade sync
router.post("/trade", receiveMT5Trade);

export default router;
