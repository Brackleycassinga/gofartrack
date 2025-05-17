const express = require("express");
const router = express.Router();
const Report = require("../models/report");
const auth = require("../middleware/auth");

// Create a new report
router.post("/", auth, async (req, res) => {
  try {
    const { projectId, title, progress, date, text } = req.body;

    // Basic validation
    if (!projectId)
      return res.status(400).json({ message: "projectId is required" });
    if (!title?.trim())
      return res.status(400).json({ message: "title is required" });
    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return res.status(400).json({ message: "progress must be 0–100" });
    }
    if (!text?.trim())
      return res.status(400).json({ message: "text is required" });

    const report = new Report({
      projectId,
      title: title.trim(),
      progress,
      date: date ? new Date(date) : undefined,
      text,
      createdBy: req.user.id,
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
      .select("projectId date title progress createdBy")
      .populate("projectId", "name")
      .populate("createdBy", "name")
      .sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get reports by project
router.get("/project/:projectId", auth, async (req, res) => {
  try {
    const reports = await Report.find({ projectId: req.params.projectId })
      .select("projectId date title progress createdBy")
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
    const startDate = new Date(req.params.date);
    startDate.setHours(0, 0, 0, 0);
    const endDate = new Date(req.params.date);
    endDate.setHours(23, 59, 59, 999);

    const reports = await Report.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .select("projectId date title progress createdBy")
      .populate("projectId", "name")
      .populate("createdBy", "name")
      .sort({ date: -1 });
    res.json(reports);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a report
router.put("/:id", auth, async (req, res) => {
  try {
    const { title, progress, date, text } = req.body;
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (
      report.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (title?.trim()) report.title = title.trim();
    if (typeof progress === "number") report.progress = progress;
    if (date) report.date = new Date(date);
    if (text?.trim()) report.text = text;

    const updated = await report.save();
    res.json(updated);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete a report
router.delete("/:id", auth, async (req, res) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) return res.status(404).json({ message: "Report not found" });

    if (
      report.createdBy.toString() !== req.user.id &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    await report.remove();
    res.json({ message: "Report deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
