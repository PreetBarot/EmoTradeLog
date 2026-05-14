import User from "../models/User.model.js";
import { decrypt } from "../utils/encryption.js";

// Get decrypted investor password for a user (admin/internal use only)
export const getInvestorPassword = async (req, res) => {
  try {
    const userId = req.params.userId;
    const user = await User.findById(userId).select("investorPassword");
    if (!user || !user.investorPassword) {
      return res.status(404).json({ success: false, message: "Investor password not set" });
    }
    const decrypted = decrypt(user.investorPassword);
    return res.status(200).json({ success: true, investorPassword: decrypted });
  } catch (error) {
    return res.status(500).json({ success: false, message: "Server error" });
  }
};
