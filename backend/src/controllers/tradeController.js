import Trade from '../models/Trade.js';

// @desc    Get all trades for user
// @route   GET /api/trades
// @access  Private
const getTrades = async (req, res) => {
  try {
    const trades = await Trade.find({ user: req.user._id }).sort({ date: -1 });
    res.json(trades);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};

// @desc    Create a new trade
// @route   POST /api/trades
// @access  Private
const createTrade = async (req, res) => {
  const { symbol, type, entry, exit, size, pnl, isWinner, emotion, date } = req.body;

  try {
    const trade = new Trade({
      user: req.user._id,
      symbol,
      type,
      entry,
      exit,
      size,
      pnl,
      isWinner,
      emotion,
      date: date || Date.now()
    });

    const createdTrade = await trade.save();
    res.status(201).json(createdTrade);
  } catch (error) {
    res.status(400).json({ message: 'Invalid trade data', error: error.message });
  }
};

// @desc    Update a trade (e.g., adding journal entries)
// @route   PUT /api/trades/:id
// @access  Private
const updateTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (trade) {
      if (trade.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      trade.status = req.body.status || trade.status;
      trade.preTradeAnalysis = req.body.preTradeAnalysis || trade.preTradeAnalysis;
      trade.postTradeReview = req.body.postTradeReview || trade.postTradeReview;
      trade.lessonsLearned = req.body.lessonsLearned || trade.lessonsLearned;
      trade.rating = req.body.rating || trade.rating;
      trade.tags = req.body.tags || trade.tags;
      if (req.body.screenshots) trade.screenshots = req.body.screenshots;
      if (req.body.exit !== undefined) trade.exit = req.body.exit;
      if (req.body.pnl !== undefined) {
        trade.pnl = req.body.pnl;
        trade.isWinner = req.body.pnl > 0;
      }

      const updatedTrade = await trade.save();
      res.json(updatedTrade);
    } else {
      res.status(404).json({ message: 'Trade not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Delete a trade
// @route   DELETE /api/trades/:id
// @access  Private
const deleteTrade = async (req, res) => {
  try {
    const trade = await Trade.findById(req.params.id);

    if (trade) {
      if (trade.user.toString() !== req.user._id.toString()) {
        return res.status(401).json({ message: 'Not authorized' });
      }

      await trade.deleteOne();
      res.json({ message: 'Trade removed' });
    } else {
      res.status(404).json({ message: 'Trade not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

export { getTrades, createTrade, updateTrade, deleteTrade };
