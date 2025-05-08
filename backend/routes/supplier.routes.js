const express = require("express");
const router = express.Router();
const Supplier = require("../models/Supplier");
const auth = require("../middleware/auth");

// Debug middleware for supplier routes
router.use((req, res, next) => {
  console.log("Supplier route accessed:", req.method, req.url);
  next();
});

// Get all suppliers
router.get("/", auth, async (req, res) => {
  console.log("Attempting to fetch suppliers...");
  try {
    const suppliers = await Supplier.find();
    console.log(`Found ${suppliers.length} suppliers`);
    res.json(suppliers);
  } catch (error) {
    console.error("Error fetching suppliers:", error);
    res.status(500).json({ message: error.message });
  }
});

// Create supplier
router.post("/", auth, async (req, res) => {
  try {
    const supplier = new Supplier(req.body);
    const newSupplier = await supplier.save();
    res.status(201).json(newSupplier);
  } catch (error) {
    console.error("Error creating supplier:", error);
    res.status(400).json({ message: error.message });
  }
});

// Get supplier by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const supplier = await Supplier.findById(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update supplier
router.put("/:id", auth, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json(supplier);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Delete supplier
router.delete("/:id", auth, async (req, res) => {
  try {
    const supplier = await Supplier.findByIdAndDelete(req.params.id);
    if (!supplier) {
      return res.status(404).json({ message: "Supplier not found" });
    }
    res.json({ message: "Supplier deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
