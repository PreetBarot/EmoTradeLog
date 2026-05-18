import express from 'express';
import { getNewsCorrelation, getWeeklyReport, chatWithData, getChatHistory, clearChatHistory, getTradeCoach, getPatternFinder, getRiskAdvisor } from '../controllers/aiController.js';
import { protect } from '../middleware/authMiddleware.js'; // Ensure user is authenticated

const router = express.Router();

// Both routes should be protected as they rely on user specific data (trades)
router.get('/news-correlation', protect, getNewsCorrelation);
router.get('/weekly-report', protect, getWeeklyReport);
router.post('/chat', protect, chatWithData);
router.get('/chat', protect, getChatHistory);
router.delete('/chat', protect, clearChatHistory);
router.get('/trade-coach', protect, getTradeCoach);
router.get('/pattern-finder', protect, getPatternFinder);
router.get('/risk-advisor', protect, getRiskAdvisor);

export default router;
