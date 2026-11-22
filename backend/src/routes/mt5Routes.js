import express from 'express';

const router = express.Router();

router.post('/sync', async (req, res) => {
  try {
    console.log('MT5 Sync API Hit');

    res.json({
      success: true,
      message: 'MT5 sync successful',
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;