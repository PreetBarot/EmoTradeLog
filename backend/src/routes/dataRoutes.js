import express from 'express';
import { getHistoricalData, getMarketQuotes } from '../controllers/dataController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/klines', protect, getHistoricalData);
router.get('/quotes', protect, getMarketQuotes);

export default router;
