const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const checkRole = require("../middleware/checkRole");
const Project = require("../models/Project");
const Employee = require("../models/Employee");

// Get all projects
router.get("/", auth, async (req, res) => {
  try {
    const projects = await Project.find().sort({ createdAt: -1 });
    res.json(projects);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// Create project - admin only
router.post("/", [auth, checkRole(["admin"])], async (req, res) => {
  try {
    // First check if supervisor exists
    const supervisor = await Employee.findById(req.body.supervisor);
    if (!supervisor || supervisor.role !== "Supervisor") {
      return res.status(400).json({
        message: "Invalid supervisor. Please create a supervisor first.",
      });
    }

    const project = new Project(req.body);
    await project.save();
    res.status(201).json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Update project - admin only
router.put("/:id", [auth, checkRole(["admin"])], async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// Delete project - admin only
router.delete("/:id", [auth, checkRole(["admin"])], async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json({ message: "Project deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Create site for project
router.post("/:projectId/sites", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    if (!project.sites) {
      project.sites = [];
    }

    project.sites.push(req.body);
    await project.save();

    res.status(201).json(project.sites[project.sites.length - 1]);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get all sites for a project
router.get("/:projectId/sites", auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project.sites || []);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
