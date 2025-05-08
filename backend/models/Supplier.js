const mongoose = require("mongoose");

const supplierSchema = new mongoose.Schema(
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
    },
    address: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: ["Building Materials", "Electrical", "Plumbing", "Tools", "Other"],
    },
    products: {
      type: String,
      required: true,
    },
    tin: {
      type: String,
      required: true,
    },
    website: String,
    status: {
      type: String,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Supplier", supplierSchema);
