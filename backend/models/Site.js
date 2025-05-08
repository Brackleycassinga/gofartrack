const mongoose = require("mongoose");

const siteSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: String,
    status: {
      type: String,
      enum: ["Active", "On Hold", "Completed"],
      default: "Active",
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
    },
    progress: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Site", siteSchema);
