const mongoose = require("mongoose");

const InvoiceSchema = new mongoose.Schema({
  invoiceNumber: { type: String, required: true, unique: true, index: true },
  userId: { type: String, required: true, index: true },

  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },

  paymentId: { type: String, default: "" },
  orderId: { type: String, default: "" },

  amount: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },

  transactionTime: { type: Date, default: null },
  nextRenewalDate: { type: Date, default: null },

  // Email delivery
  emailSentAt: { type: Date, default: null },
});

module.exports = mongoose.model("Invoice", InvoiceSchema);

