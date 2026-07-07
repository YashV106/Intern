const mongoose = require("mongoose");

const SubscriptionSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true, unique: true },

  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },

  status: {
    type: String,
    enum: ["active", "inactive"],
    default: "inactive",
  },

  // Subscription period
  startDate: { type: Date, default: null },
  expiryDate: { type: Date, default: null },

  // Payment refs
  paymentId: { type: String, default: "" },
  orderId: { type: String, default: "" },

  // Monthly quota tracking (IST YYYY-MM)
  monthKey: { type: String, default: "", index: true },
  applicationsPerMonth: { type: Number, default: 1 },
  usageCount: { type: Number, default: 0 },

  purchasedAt: { type: Date, default: null },
});

module.exports = mongoose.model("Subscription", SubscriptionSchema);

