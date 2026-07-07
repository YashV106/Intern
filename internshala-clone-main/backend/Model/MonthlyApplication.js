const mongoose = require("mongoose");

const MonthlyApplicationSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  monthKey: { type: String, required: true, index: true }, // YYYY-MM in IST

  plan: {
    type: String,
    enum: ["free", "bronze", "silver", "gold"],
    default: "free",
  },

  applicationsPerMonth: { type: Number, default: 1 }, // -1 unlimited
  usageCount: { type: Number, default: 0 },

  updatedAt: { type: Date, default: Date.now },
});

MonthlyApplicationSchema.index({ userId: 1, monthKey: 1 }, { unique: true });

module.exports = mongoose.model("MonthlyApplication", MonthlyApplicationSchema);

