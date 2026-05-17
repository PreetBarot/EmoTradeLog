import express from 'express';
import { getMessages, postMessage, deleteMessage } from '../controllers/communityController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/messages', protect, getMessages);
router.post('/messages', protect, postMessage);
router.delete('/messages/:id', protect, deleteMessage);

export default router;
