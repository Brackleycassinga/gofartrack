const express = require("express");
const router = express.Router();
const Report = require("../models/report");
const auth = require("../middleware/auth");

// Create a new report
router.post("/", auth, async (req, res) => {
  try {
    const report = new Report({
      ...req.body,
      createdBy: req.user.id
    });
    const savedReport = await report.save();
    res.status(201).json(savedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all reports
router.get("/", auth, async (req, res) => {
  try {
    const reports = await Report.find()
      .populate("projectId", "name")
      .populate("createdBy", "name");
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reports by project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const reports = await Report.find({ projectId: req.params.projectId })
      .populate("projectId", "name")
      .populate("createdBy", "name")
      .sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reports by date
router.get("/date/:date", auth, async (req, res) => {
  try {
    // Create date objects for start and end of the specified day
    const startDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0);
    
    const endDate = new Date(req.params.date);
    endDate.setHours(23, 59, 59, 999);
    
    const reports = await Report.find({ 
      date: { $gte: startDate, $lte: endDate } 
    })
      .populate("projectId", "name")
      .populate("createdBy", "name");
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a report
router.put("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    // Check if user is the creator or admin
    if (report.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to update this report" });
    }
    
    const updatedReport = await Report.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    
    res.json(updatedReport);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a report
router.delete("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    
    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }
    
    // Check if user is the creator or admin
    if (report.createdBy.toString() !== req.user.id && req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized to delete this report" });
    }
    
    await Report.findByIdAndDelete(req.params.id);
    res.json({ message: "Report deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;