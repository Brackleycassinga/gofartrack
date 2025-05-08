const mongoose = require("mongoose");

const contractorSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    specialization: {
      type: String,
      required: true,
      enum: [
        "General Construction",
        "Electrical",
        "Plumbing",
        "HVAC",
        "Masonry",
        "Carpentry",
        "Roofing",
      ],
    },
    tin: {
      type: String,
      required: true,
      unique: true,
    },
    license: {
      type: String,
      required: true,
      unique: true,
    },
    address: String,
    rate: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["active", "inactive", "suspended"],
      default: "active",
    },
    availability: {
      type: String,
      enum: ["available", "engaged", "unavailable"],
      default: "available",
    },
    activeProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
  },
  {
    timestamps: true,
  }
);

// Add index for performance
contractorSchema.index({ specialization: 1, status: 1 });

module.exports = mongoose.model("Contractor", contractorSchema);
