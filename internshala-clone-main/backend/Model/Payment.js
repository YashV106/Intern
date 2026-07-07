const mongoose = require("mongoose");

const PaymentSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },

  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },

  status: {
    type: String,
    enum: ["created", "paid", "failed", "cancelled"],
    default: "created",
  },

  paymentId: { type: String, required: true, unique: true, index: true },
  orderId: { type: String, default: "" },
  signature: { type: String, default: "" },

  amount: { type: Number, default: 0 },
  currency: { type: String, default: "INR" },

  createdAt: { type: Date, default: Date.now },
  paidAt: { type: Date, default: null },
});

module.exports = mongoose.model("Payment", PaymentSchema);

