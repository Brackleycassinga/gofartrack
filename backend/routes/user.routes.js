const express = require("express");
const router = express.Router();
const User = require("../models/User");
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const { body, validationResult } = require("express-validator");

// Get all users - protected, only accessible by admins
router.get("/", auth, checkRole(["admin"]), async (req, res) => {
  try {
    // Fetch all users (excluding password)
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    console.error("Error fetching users:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Update user role - protected, only accessible by admins
router.patch("/:userId/role", auth, checkRole(["admin"]), async (req, res) => {
  try {
    // Validate request
    const { role } = req.body;
    if (!role || (role !== "admin" && role !== "user")) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    // Find the user to update
    const userToUpdate = await User.findById(req.params.userId);
    if (!userToUpdate) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update the role
    userToUpdate.role = role;
    await userToUpdate.save();

    // Return the updated user (excluding password)
    const updatedUser = await User.findById(req.params.userId).select(
      "-password"
    );
    res.json(updatedUser);
  } catch (err) {
    console.error("Error updating user role:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Create a new user - protected, admin only
router.post(
  "/",
  [
    auth,
    checkRole(["admin"]),
    body("name").notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Valid email is required"),
    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters"),
    body("phone").notEmpty().withMessage("Phone is required"),
    body("role")
      .isIn(["admin", "user"])
      .withMessage("Role must be either 'admin' or 'user'"),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const { name, email, password, phone, role } = req.body;

      // Check if user exists
      let user = await User.findOne({ email });
      if (user) {
        return res.status(400).json({ message: "User already exists" });
      }

      // Create new user
      user = new User({
        name,
        email,
        password, // Model will handle password hashing via pre-save hook
        phone,
        role: role || "user",
      });

      await user.save();

      // Return the created user without password
      const newUser = await User.findById(user.id).select("-password");
      res.status(201).json(newUser);
    } catch (err) {
      console.error("Error creating user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Update a user - protected, admin or self only
router.put(
  "/:userId",
  [
    auth,
    body("name").optional(),
    body("email").optional().isEmail(),
    body("phone").optional(),
  ],
  async (req, res) => {
    try {
      // Validate request
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }

      const userId = req.params.userId;

      // Check if current user is admin or the user being updated
      if (req.user.role !== "admin" && req.user.id !== userId) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Find user to update
      let user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Update fields
      const { name, email, phone } = req.body;
      if (name) user.name = name;
      if (email) user.email = email;
      if (phone) user.phone = phone;

      // Save updated user
      await user.save();

      // Return updated user
      const updatedUser = await User.findById(userId).select("-password");
      res.json(updatedUser);
    } catch (err) {
      console.error("Error updating user:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Delete a user - protected, admin only
router.delete("/:userId", auth, checkRole(["admin"]), async (req, res) => {
  try {
    // Find and delete user
    const user = await User.findById(req.params.userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.findByIdAndDelete(req.params.userId);
    res.json({ message: "User deleted successfully" });
  } catch (err) {
    console.error("Error deleting user:", err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
