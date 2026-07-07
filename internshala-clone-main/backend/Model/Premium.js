const mongoose = require("mongoose");

const PremiumSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    unique: true,
    index: true,
  },

  // Free/Bronze/Silver/Gold
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

  // Monthly quota tracking (based on IST month key: YYYY-MM)
  monthKey: {
    type: String,
    default: "",
    index: true,
  },
  applicationsPerMonth: {
    type: Number,
    // use -1 for unlimited
    default: 1,
  },
  usageCount: {
    type: Number,
    default: 0,
  },
  periodStart: {
    type: Date,
    default: null,
  },
  periodEnd: {
    type: Date,
    default: null,
  },

  // Payment refs
  paymentId: {
    type: String,
    default: "",
  },
  orderId: {
    type: String,
    default: "",
  },
  amount: {
    type: Number,
    default: 0,
  },
  purchasedAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("Premium", PremiumSchema);


