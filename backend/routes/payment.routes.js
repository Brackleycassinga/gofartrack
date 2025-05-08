const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const auth = require("../middleware/auth");

// Get all payments
router.get("/", auth, async (req, res) => {
  try {
    const payments = await Payment.find().sort({ date: -1 });
    res.json(payments);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Create payment
router.post("/", auth, async (req, res) => {
  try {
    const payment = new Payment(req.body);
    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get payment statistics
router.get("/statistics", auth, async (req, res) => {
  try {
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: "$type",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
    ]);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
