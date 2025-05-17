const mongoose = require("mongoose");
const { ALL_POSITIONS } = require("../utils/employeeConstants");

// Log the ALL_POSITIONS to confirm it's a flat array of strings
console.log("ALL_POSITIONS type:", typeof ALL_POSITIONS);
console.log("ALL_POSITIONS is array:", Array.isArray(ALL_POSITIONS));
console.log("ALL_POSITIONS length:", ALL_POSITIONS.length);
console.log("First few positions:", ALL_POSITIONS.slice(0, 3));

// Define the schema
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
    nationalId: {
      type: String,
      required: true,
      unique: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["skilled", "unskilled", "supervisor", "specialist"],
    },
    position: {
      type: String,
      required: true,
      // Use explicit enum array instead of a variable if there's an issue
      enum: [
        // Skilled
        "Electrician",
        "Plumber",
        "Carpenter",
        "Mason",
        "Welder",
        "Heavy Equipment Operator",
        "HVAC Technician",
        "Painter",
        "Roofer",
        "Steel Worker",

        // Unskilled
        "General Laborer",
        "Construction Helper",
        "Site Cleaner",
        "Material Handler",
        "Demolition Worker",

        // Supervisor
        "Site Supervisor",
        "Project Manager",
        "Foreman",
        "Safety Officer",
        "Quality Control Inspector",

        // Specialist
        "Architect",
        "Civil Engineer",
        "Structural Engineer",
        "Surveyor",
        "Environmental Specialist",
        "Safety Specialist",
      ],
    },
    payRate: {
      type: Number,
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    address: String,
    status: {
      type: String,
      enum: ["active", "inactive", "terminated"],
      default: "active",
    },
    hours: {
      type: Number,
      default: 0,
    },
    present: {
      type: Boolean,
      default: true,
    },
    project: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    site: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Site",
    },
  },
  {
    timestamps: true,
  }
);

// IMPORTANT: Prevent overwriting the model by checking if it already exists
const Employee =
  mongoose.models.Employee || mongoose.model("Employee", employeeSchema);

module.exports = Employee;
