import mongoose from 'mongoose';

const tradeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User'
  },
  symbol: { type: String, required: true },
  type: { type: String, required: true, enum: ['Long', 'Short'] },
  entry: { type: Number, required: true },
  exit: { type: Number },
  size: { type: Number, default: 0.01 },
  pnl: { type: Number },
  date: { type: Date, default: Date.now },
  status: { type: String, default: 'Pending', enum: ['Pending', 'Journaled'] },
  isWinner: { type: Boolean },
  emotion: { type: String, default: 'Neutral' },
  preTradeAnalysis: { type: String },
  postTradeReview: { type: String },
  lessonsLearned: { type: String },
  rating: { type: Number, min: 1, max: 10, default: 5 },
  tags: [{ type: String }],
  screenshots: [{ type: String }]
}, {
  timestamps: true
});

const Trade = mongoose.model('Trade', tradeSchema);
export default Trade;
