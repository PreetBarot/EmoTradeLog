import express from "express";
import { updateProfile, updatePassword, deleteAccount } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.put("/profile", protect, updateProfile);
router.put("/password", protect, updatePassword);
router.delete("/account", protect, deleteAccount);

export default router;
