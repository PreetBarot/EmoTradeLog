
import User from "../models/User.model.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { encrypt } from "../utils/encryption.js";

const isValidEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

const generateToken = (userId) => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign({ id: userId }, jwtSecret, { expiresIn: "7d" });
};

export const registerUser = async (req, res) => {
  try {
    const { firstName, lastName, email, password, investorPassword } = req.body;

    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
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

    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }


    // Generate unique API key
    let apiKey;
    let apiKeyExists = true;
    while (apiKeyExists) {
      apiKey = crypto.randomBytes(32).toString("hex");
      apiKeyExists = await User.findOne({ apiKey });
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
      ...(encryptedInvestorPassword && { investorPassword: encryptedInvestorPassword }),
    });

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        apiKey: user.apiKey,
      },
    });
  } catch (error) {
    console.error("[AUTH] registerUser error:", error.message);

    // Handles duplicate key race condition if two requests pass pre-check simultaneously.
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

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
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
    console.error("[AUTH] loginUser error:", error.message);

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};