import express from 'express';
import { getNewsCorrelation, getWeeklyReport, chatWithData, getChatHistory, clearChatHistory } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js'; // Ensure user is authenticated

const router = express.Router();

// Both routes should be protected as they rely on user specific data (trades)
router.get('/news-correlation', protect, getNewsCorrelation);
router.get('/weekly-report', protect, getWeeklyReport);
router.post('/chat', protect, chatWithData);
router.get('/chat', protect, getChatHistory);
router.delete('/chat', protect, clearChatHistory);

export default router;
