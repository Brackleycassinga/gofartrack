// utils/employeeConstants.js

/**
 * Shared constants for employee positions and categories
 * Used by both frontend and backend to ensure validation consistency
 */

const EMPLOYEE_POSITIONS = {
  skilled: [
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
  ],
  unskilled: [
    "General Laborer",
    "Construction Helper",
    "Site Cleaner",
    "Material Handler",
    "Demolition Worker",
  ],
  supervisor: [
    "Site Supervisor",
    "Project Manager",
    "Foreman",
    "Safety Officer",
    "Quality Control Inspector",
  ],
  specialist: [
    "Architect",
    "Civil Engineer",
    "Structural Engineer",
    "Surveyor",
    "Environmental Specialist",
    "Safety Specialist",
  ],
};

// Flatten the positions into a single array for enum validation
const ALL_POSITIONS = Object.values(EMPLOYEE_POSITIONS).flat();

module.exports = {
  EMPLOYEE_POSITIONS,
  ALL_POSITIONS,
};
