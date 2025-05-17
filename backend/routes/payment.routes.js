// routes/paymentRoutes.js
const express = require("express");
const router = express.Router();
const Payment = require("../models/Payment");
const Employee = require("../models/Employee");
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
    const { recipientType, recipient, ...paymentData } = req.body;

    // If payment is for an employee, try to get their position and category
    let employeeData = {};
    if (recipientType === "employee") {
      try {
        // Look for employee by ID or name
        let employeeQuery = {};

        if (mongoose.Types.ObjectId.isValid(recipient)) {
          employeeQuery._id = recipient;
        } else {
          employeeQuery.name = recipient;
        }

        const employee = await Employee.findOne(employeeQuery);

        if (employee) {
          employeeData = {
            position: employee.position,
            employeeType: employee.category,
          };
          console.log("Found employee data for payment:", employeeData);
        }
      } catch (err) {
        console.log("Error finding employee details:", err);
        // Continue without employee data if there's an error
      }
    }

    // Create payment with all data
    const payment = new Payment({
      recipientType,
      recipient,
      ...paymentData,
      ...employeeData,
    });

    const savedPayment = await payment.save();
    res.status(201).json(savedPayment);
  } catch (error) {
    console.error("Error creating payment:", error);
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
