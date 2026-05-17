import express from 'express';
import { getNewsCorrelation, getWeeklyReport } from '../controllers/aiController.js';
import { protect } from '../controllers/auth.controller.js'; // Ensure user is authenticated

const router = express.Router();

// Both routes should be protected as they rely on user specific data (trades)
router.get('/news-correlation', protect, getNewsCorrelation);
router.get('/weekly-report', protect, getWeeklyReport);

export default router;
