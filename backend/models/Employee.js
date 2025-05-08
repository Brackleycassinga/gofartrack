const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
      enum: ["Worker", "Skilled Worker", "Supervisor", "Lead Contractor"],
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
      required: function () {
        return !["Supervisor", "Manager"].includes(this.role);
      },
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    payRate: {
      type: Number,
      required: true,
    },
    present: {
      type: Boolean,
      default: true,
    },
    hours: {
      type: Number,
      default: 0,
    },
    startDate: {
      type: Date,
      required: true,
    },
    nationalId: {
      type: String,
      required: true,
      unique: true,
    },
    address: String,
    role: {
      type: String,
      required: true,
      enum: ["Supervisor", "Worker", "Manager", "Skilled Worker"],
      default: "Worker",
    },
  },
  {
    timestamps: true,
  }
);

// Add index for quickly finding supervisors
employeeSchema.index({ role: 1 });

// Add static method to find supervisors
employeeSchema.statics.getSupervisors = function () {
  return this.find({ role: "Supervisor" });
};

module.exports = mongoose.model("Employee", employeeSchema);
