import express from 'express';

import {
  getTrades,
  createTrade,
  syncTrade,
  updateTrade,
  deleteTrade
} from '../controllers/tradeController.js';

import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// ==============================
// MT5 AUTO SYNC ROUTE
// ==============================

router.post('/sync', syncTrade);

// ==============================
// USER ROUTES
// ==============================

router.route('/')
  .get(protect, getTrades)
  .post(protect, createTrade);

router.route('/:id')
  .put(protect, updateTrade)
  .delete(protect, deleteTrade);

export default router;