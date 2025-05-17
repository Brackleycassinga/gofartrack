const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
      enum: ["expense", "income"],
    },
    amount: {
      type: Number,
      required: true,
    },
    recipient: {
      type: String,
      required: true,
    },
    recipientType: {
      type: String,
      enum: ["employee", "contractor", "supplier"],
      required: true,
    },
    description: String,
    date: {
      type: Date,
      required: true,
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ["cash", "bank", "mobile"],
      default: "cash",
    },
    category: {
      type: String,
      required: true,
      enum: ["wages", "supplies", "contract", "other"],
    },
    reference: String,
    status: {
      type: String,
      default: "completed",
      enum: ["pending", "completed", "failed"],
    },
    projectReference: String,
    siteReference: String,
    // Add position and employeeType fields for filtering payments
    position: String,
    employeeType: String,
  },
  {
    timestamps: true,
  }
);

// IMPORTANT: Prevent overwriting the model by checking if it already exists
const Payment =
  mongoose.models.Payment || mongoose.model("Payment", paymentSchema);

module.exports = Payment;
