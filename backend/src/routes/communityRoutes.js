import express from 'express';
import { getMessages, postMessage } from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/messages', protect, getMessages);
router.post('/messages', protect, postMessage);

export default router;
