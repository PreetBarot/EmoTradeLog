import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';

import authRoutes from './routes/auth.routes.js';
import tradeRoutes from './routes/tradeRoutes.js';
import mt5Routes from './routes/mt5Routes.js';
import investorPasswordRoutes from './routes/investorPasswordRoutes.js';
import uploadRoutes from './routes/uploadRoutes.js';
import aiRoutes from './routes/aiRoutes.js';
import leaderboardRoutes from './routes/leaderboardRoutes.js';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure public/uploads directory exists
const uploadDir = path.join(__dirname, '..', 'public', 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes

app.use('/api/auth', authRoutes);
app.use('/api/trades', tradeRoutes);
app.use('/api/mt5', mt5Routes);
app.use('/api/investor-password', investorPasswordRoutes); // Protect this route in production!
app.use('/api/upload', uploadRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/leaderboard', leaderboardRoutes);
app.use('/uploads', express.static(path.join(__dirname, '..', 'public', 'uploads')));

app.get('/', (req, res) => {
  res.send('EmoTradeLog API is running...');
});

const PORT = process.env.PORT || 5000;

// Only start the server if MONGO_URI is set, else warn the user
if (process.env.MONGO_URI === 'your_mongodb_connection_string_here' || !process.env.MONGO_URI) {
  console.warn('⚠️ WARNING: MONGO_URI is not set in .env file. Please set up MongoDB Atlas and add your connection string.');
} else {
  connectDB().then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  });
}