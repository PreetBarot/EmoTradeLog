import Trade from '../models/Trade.js';

// ==============================
// Get all trades
// ==============================
const getTrades = async (req, res) => {
  try {

    const trades = await Trade.find({
      user: req.user._id
    }).sort({ date: -1 });

    res.json(trades);

  } catch (error) {

    res.status(500).json({
      message: 'Server Error'
    });

  }
};

// ==============================
// Create manual trade
// ==============================
const createTrade = async (req, res) => {

  const {
    symbol,
    type,
    entry,
    exit,
    size,
    pnl,
    isWinner,
    emotion,
    date
  } = req.body;

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

    res.status(400).json({
      message: 'Invalid trade data',
      error: error.message
    });

  }
};

// ==============================
// MT5 AUTO SYNC
// ==============================
const syncTrade = async (req, res) => {

  try {

    const {
      apiKey,
      symbol,
      type,
      entry,
      exit,
      size,
      pnl,
      emotion
    } = req.body;

    // Security check
    if (apiKey !== process.env.MT5_API_KEY) {

      return res.status(401).json({
        message: 'Invalid API Key'
      });

    }

    const trade = new Trade({
      user: process.env.DEFAULT_USER_ID,
      symbol,
      type,
      entry,
      exit,
      size,
      pnl,
      emotion,
      isWinner: pnl > 0,
      status: 'Journaled'
    });

    const createdTrade = await trade.save();

    res.status(201).json({
      success: true,
      trade: createdTrade
    });

  } catch (error) {

    res.status(500).json({
      message: 'MT5 Sync Failed',
      error: error.message
    });

  }
};

// ==============================
// Update trade
// ==============================
const updateTrade = async (req, res) => {

  try {

    const trade = await Trade.findById(
      req.params.id
    );

    if (trade) {

      if (
        trade.user.toString() !==
        req.user._id.toString()
      ) {

        return res.status(401).json({
          message: 'Not authorized'
        });

      }

      // BASIC INFO

      trade.status =
        req.body.status || trade.status;

      trade.preTradeAnalysis =
        req.body.preTradeAnalysis ||
        trade.preTradeAnalysis;

      trade.postTradeReview =
        req.body.postTradeReview ||
        trade.postTradeReview;

      trade.lessonsLearned =
        req.body.lessonsLearned ||
        trade.lessonsLearned;

      trade.rating =
        req.body.rating ||
        trade.rating;

      trade.tags =
        req.body.tags ||
        trade.tags;

      // NEW CHECKLIST SUPPORT

      trade.checklist =
        req.body.checklist ||
        trade.checklist;

      // OPTIONAL FIELDS

      if (req.body.exit !== undefined) {

        trade.exit = req.body.exit;

      }

      if (req.body.pnl !== undefined) {

        trade.pnl = req.body.pnl;

        trade.isWinner =
          req.body.pnl > 0;

      }

      if (req.body.emotion !== undefined) {

        trade.emotion =
          req.body.emotion;

      }

      if (req.body.screenshots !== undefined) {

        trade.screenshots =
          req.body.screenshots;

      }

      // SAVE

      const updatedTrade =
        await trade.save();

      res.json(updatedTrade);

    } else {

      res.status(404).json({
        message: 'Trade not found'
      });

    }

  } catch (error) {

    res.status(500).json({
      message: 'Server Error',
      error: error.message
    });

  }
};

// ==============================
// Delete trade
// ==============================
const deleteTrade = async (req, res) => {

  try {

    const trade =
      await Trade.findById(
        req.params.id
      );

    if (trade) {

      if (
        trade.user.toString() !==
        req.user._id.toString()
      ) {

        return res.status(401).json({
          message: 'Not authorized'
        });

      }

      await trade.deleteOne();

      res.json({
        message: 'Trade removed'
      });

    } else {

      res.status(404).json({
        message: 'Trade not found'
      });

    }

  } catch (error) {

    res.status(500).json({
      message: 'Server Error',
      error: error.message
    });

  }
};

export {
  getTrades,
  createTrade,
  syncTrade,
  updateTrade,
  deleteTrade
};