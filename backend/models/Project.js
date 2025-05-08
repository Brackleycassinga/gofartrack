const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    description: String,
    supervisor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    status: {
      type: String,
      enum: ["Not Started", "On Track", "Delayed", "Completed"],
      default: "Not Started",
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

module.exports = mongoose.model("Project", projectSchema);
