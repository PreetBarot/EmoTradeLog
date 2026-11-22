import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { encrypt } from "../utils/encryption.js";
import Otp from "../models/Otp.js";
import sendEmail from "../utils/sendEmail.js";

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { id: userId },
    jwtSecret,
    { expiresIn: "7d" }
  );
};

export const sendOtp = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please sign in or use a different email.",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    // Delete old OTPs
    await Otp.deleteMany({
      email: normalizedEmail,
    });

    // Save new OTP
    await Otp.create({
      email: normalizedEmail,
      otp,
    });

    const message =
      `Your EmoTradeLog verification code is: ${otp}\n\n` +
      `This code will expire in 5 minutes.`;

    // Send Email via Nodemailer
    try {
      await sendEmail({
        email: normalizedEmail,
        subject: "EmoTradeLog - Email Verification Code",
        message,
        otp,
        type: 'otp',
      });
    } catch (emailError) {
      console.error(
        "[EMAIL ERROR]",
        emailError
      );

      return res.status(500).json({
        success: false,
        message: "Failed to send OTP email. Please ensure your email configuration is set.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "OTP sent successfully",
    });

  } catch (error) {
    console.error(
      "[AUTH] sendOtp error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

export const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      investorPassword,
      otp,
    } = req.body;

    if (
      !firstName ||
      !lastName ||
      !email ||
      !password ||
      !otp
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields including OTP are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const existingUser = await User.findOne({
      email: normalizedEmail,
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered. Please sign in or use a different email.",
      });
    }

    const validOtp = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.toString().trim(),
    });

    if (!validOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    // Generate unique API key
    let apiKey;
    let apiKeyExists = true;

    while (apiKeyExists) {
      apiKey = crypto
        .randomBytes(32)
        .toString("hex");

      apiKeyExists = await User.findOne({
        apiKey,
      });
    }

    let encryptedInvestorPassword = undefined;

    if (investorPassword) {
      encryptedInvestorPassword = encrypt(investorPassword);
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: normalizedEmail,
      password,
      apiKey,
      ...(encryptedInvestorPassword && {
        investorPassword: encryptedInvestorPassword,
      }),
    });

    // Delete OTP after registration
    await Otp.deleteMany({
      email: normalizedEmail,
    });

    // Generate token
    const token = generateToken(user._id.toString());

    // Send Welcome / Login Credentials Confirmation Email
    try {
      await sendEmail({
        email: normalizedEmail,
        subject: "Welcome to EmoTradeLog - Account Created",
        type: 'welcome',
        user: {
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
        },
      });
    } catch (welcomeErr) {
      console.warn("[AUTH] Failed to send welcome email:", welcomeErr.message || welcomeErr);
    }

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        apiKey: user.apiKey,
      },
    });

  } catch (error) {
    console.error(
      "[AUTH] registerUser error:",
      error
    );

    if (error?.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    const user = await User.findOne({
      email: normalizedEmail,
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateToken(user._id.toString());

    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        apiKey: user.apiKey,
      },
    });

  } catch (error) {
    console.error(
      "[AUTH] loginUser error:",
      error
    );

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || !isValidEmail(email)) {
      return res.status(400).json({
        success: false,
        message: "Valid email is required",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "No user found with this email address",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete old OTPs for this email
    await Otp.deleteMany({ email: normalizedEmail });

    // Save new OTP
    await Otp.create({
      email: normalizedEmail,
      otp,
    });

    const message = `Your EmoTradeLog password reset code is: ${otp}\nThis code will expire in 5 minutes.`;

    try {
      await sendEmail({
        email: normalizedEmail,
        subject: "EmoTradeLog - Password Reset Code",
        message,
        otp,
        type: 'reset_otp',
      });
    } catch (emailError) {
      console.error("[EMAIL ERROR]", emailError);
      return res.status(500).json({
        success: false,
        message: "Failed to send reset email. Please try again.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Password reset OTP sent to your email",
    });
  } catch (error) {
    console.error("[AUTH] forgotPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Email, OTP, and new password are required",
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters",
      });
    }

    const normalizedEmail = email.toLowerCase().trim();

    const validOtp = await Otp.findOne({
      email: normalizedEmail,
      otp: otp.toString().trim(),
    });

    if (!validOtp) {
      return res.status(400).json({
        success: false,
        message: "Invalid or expired OTP",
      });
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    user.password = newPassword;
    await user.save();

    // Delete OTP
    await Otp.deleteMany({ email: normalizedEmail });

    return res.status(200).json({
      success: true,
      message: "Password reset successfully. You can now log in.",
    });
  } catch (error) {
    console.error("[AUTH] resetPassword error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};
