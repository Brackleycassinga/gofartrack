const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    projectId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now
    },
    text: {
      type: String,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    }
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Report", reportSchema);