const express = require("express");
const router = express.Router();
const Employee = require("../models/Employee");
const auth = require("../middleware/auth");

// Get all employees
router.get("/", auth, async (req, res) => {
  try {
    const employees = await Employee.find().sort({ createdAt: -1 });
    res.json(employees);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add new employee with improved error handling
router.post("/", auth, async (req, res) => {
  try {
    console.log("Received employee data:", req.body);

    // Validate required fields
    if (!req.body.name || !req.body.nationalId || !req.body.payRate) {
      return res.status(400).json({
        message: "Missing required fields",
      });
    }

    // Create employee with validated data
    const employee = new Employee({
      ...req.body,
      payRate: parseFloat(req.body.payRate),
      startDate: new Date(req.body.startDate),
    });

    const savedEmployee = await employee.save();
    res.status(201).json(savedEmployee);
  } catch (error) {
    console.error("Error creating employee:", error);
    if (error.code === 11000) {
      res.status(400).json({ message: "National ID already exists" });
    } else {
      res.status(500).json({ message: error.message });
    }
  }
});

// Update employee attendance
router.patch("/:id/attendance", auth, async (req, res) => {
  try {
    const { present, hours } = req.body;
    const employee = await Employee.findByIdAndUpdate(
      req.params.id,
      { present, hours },
      { new: true }
    );
    res.json(employee);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete employee
router.delete("/:id", auth, async (req, res) => {
  try {
    await Employee.findByIdAndDelete(req.params.id);
    res.json({ message: "Employee deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
