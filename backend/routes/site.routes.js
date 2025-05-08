const express = require("express");
const router = express.Router();
const Site = require("../models/Site");
const Project = require("../models/Project");
const auth = require("../middleware/auth");

// Get all sites or filter by project
router.get("/", auth, async (req, res) => {
  try {
    let query = {};

    // Convert project string ID to ObjectId if present
    if (req.query.project) {
      try {
        query.project = mongoose.Types.ObjectId(req.query.project);
      } catch (err) {
        console.error("Invalid ObjectId format:", req.query.project);
        query.project = req.query.project; // Fallback to string (will likely return no results)
      }
    }

    console.log("Site query:", query);

    const sites = await Site.find(query)
      .populate("project", "name")
      .sort({ createdAt: -1 });

    console.log(
      `Found ${sites.length} sites for project ${req.query.project || "all"}`
    );
    res.json(sites);
  } catch (error) {
    console.error("Error fetching sites:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create site
router.post("/", auth, async (req, res) => {
  try {
    const { projectId, ...siteData } = req.body;

    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Create site with project reference
    const site = new Site({
      ...siteData,
      project: projectId,
    });

    const savedSite = await site.save();

    // Return populated site data
    const populatedSite = await Site.findById(savedSite._id)
      .populate("project", "name")
      .populate("supervisor", "name");

    res.status(201).json(populatedSite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Get site by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const site = await Site.findById(req.params.id)
      .populate("project", "name")
      .populate("supervisor", "name");
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.json(site);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update site
router.put("/:id", auth, async (req, res) => {
  try {
    const updatedSite = await Site.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
      .populate("project", "name")
      .populate("supervisor", "name");

    if (!updatedSite) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.json(updatedSite);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete site
router.delete("/:id", auth, async (req, res) => {
  try {
    const site = await Site.findByIdAndDelete(req.params.id);
    if (!site) {
      return res.status(404).json({ message: "Site not found" });
    }
    res.json({ message: "Site deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
