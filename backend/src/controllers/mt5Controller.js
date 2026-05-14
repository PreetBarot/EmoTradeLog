import Trade from "../models/Trade.js";
import User from "../models/User.model.js";

// Receives trade data from MT5, identifies user by x-api-key, saves trade
export const receiveMT5Trade = async (req, res) => {
  try {
    const apiKey = req.headers["x-api-key"];
    if (!apiKey) {
      return res.status(401).json({ success: false, message: "Missing API key" });
    }
    const user = await User.findOne({ apiKey });
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid API key" });
    }
    const tradeData = req.body;
    if (!tradeData || Object.keys(tradeData).length === 0) {
      return res.status(400).json({ success: false, message: "No trade data provided" });
    }
    // Attach user to trade
    const trade = new Trade({ ...tradeData, user: user._id });
    await trade.save();
    return res.status(201).json({ success: true, message: "Trade saved", trade });
  } catch (error) {
    console.error("[MT5] receiveMT5Trade error:", error.message);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
