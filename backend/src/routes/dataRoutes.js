import express from 'express';
import { getHistoricalData } from '../controllers/dataController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/klines', protect, getHistoricalData);

export default router;
