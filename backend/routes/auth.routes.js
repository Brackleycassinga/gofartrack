const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");

// Route to check if auth routes are working
router.get("/test", (req, res) => {
  res.json({ message: "Auth routes are working!" });
});

// Login route
router.post("/login", async (req, res) => {
  try {
    const { phone, password } = req.body;
    console.log("Login attempt for phone:", phone);

    // Validate input
    if (!phone || !password) {
      return res
        .status(400)
        .json({ message: "Phone and password are required" });
    }

    // Find user
    const user = await User.findOne({ phone });
    console.log("Found user:", user ? "Yes" : "No");

    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("Password match:", isMatch ? "Yes" : "No");

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    const userData = {
      token,
      user: {
        id: user._id,
        name: user.name,
        phone: user.phone,
        role: user.role,
        email: user.email,
      },
    };

    console.log("Login successful:", userData);
    res.json(userData);
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Signup route
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, phone, role = "user" } = req.body;
    console.log("Signup attempt for:", email);

    // Validate input
    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        message: "All fields are required",
        details: "Name, email, password, and phone must be provided",
      });
    }

    // Check if user exists by email
    let existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already registered" });
    }

    // Check if user exists by phone
    existingUser = await User.findOne({ phone });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Phone number already registered" });
    }

    // Create new user
    const user = new User({
      name,
      email,
      password, // Password will be hashed by the User model pre-save hook
      phone,
      role,
    });

    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET || "your-secret-key",
      { expiresIn: "30d" }
    );

    // Return user data with token
    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Server error",
      details:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
});

// Get current authenticated user
router.get("/me", async (req, res) => {
  try {
    // Get token from header
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res
        .status(401)
        .json({ message: "No token, authorization denied" });
    }

    // Verify token
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );

    // Find user
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Auth error:", error);
    res.status(401).json({ message: "Token is not valid" });
  }
});

module.exports = router;
