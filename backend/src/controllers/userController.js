import User from "../models/User.model.js";
import bcrypt from "bcryptjs";

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.firstName = req.body.firstName || user.firstName;
      user.lastName = req.body.lastName || user.lastName;
      if (req.body.avatar) {
        user.avatar = req.body.avatar;
      }
      if (req.body.notifications) {
        user.notifications = {
          ...user.notifications,
          ...req.body.notifications
        };
      }

      const updatedUser = await user.save();

      res.status(200).json({
        success: true,
        message: "Profile updated successfully",
        user: {
          id: updatedUser._id,
          firstName: updatedUser.firstName,
          lastName: updatedUser.lastName,
          email: updatedUser.email,
          apiKey: updatedUser.apiKey,
          avatar: updatedUser.avatar,
          notifications: updatedUser.notifications,
        },
      });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("[USER] updateProfile error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Update user password
// @route   PUT /api/users/password
// @access  Private
export const updatePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({ success: false, message: "Both current and new passwords are required" });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, message: "New password must be at least 6 characters" });
    }

    const user = await User.findById(req.user._id);

    if (user) {
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ success: false, message: "Invalid current password" });
      }

      user.password = newPassword;
      await user.save();

      res.status(200).json({ success: true, message: "Password updated successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("[USER] updatePassword error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// @desc    Delete user account
// @route   DELETE /api/users/account
// @access  Private
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      // Optional: Delete related trades, settings, etc. if cascade is not set up
      // await Trade.deleteMany({ userId: user._id });
      
      await User.deleteOne({ _id: user._id });

      res.status(200).json({ success: true, message: "Account deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  } catch (error) {
    console.error("[USER] deleteAccount error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
