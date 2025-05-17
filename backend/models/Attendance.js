const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: true,
    },
    date: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ["present", "absent", "late", "halfday"],
      required: true,
    },
    clockIn: {
      type: Date,
    },
    clockOut: {
      type: Date,
    },
    hours: {
      type: Number,
      default: 0,
    },
    notes: String,
  },
  {
    timestamps: true,
  }
);

// Create a compound index to ensure uniqueness
attendanceSchema.index({ employee: 1, date: 1, site: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);
