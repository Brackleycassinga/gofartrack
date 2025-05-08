const express = require("express");
const router = express.Router();
const Contractor = require("../models/Contractor");
const auth = require("../middleware/auth");

router.post("/", auth, async (req, res) => {
  try {
    const contractor = new Contractor(req.body);
    const savedContractor = await contractor.save();
    res.status(201).json(savedContractor);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

router.get("/", auth, async (req, res) => {
  try {
    const contractors = await Contractor.find();
    res.json(contractors);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
