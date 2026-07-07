const mongoose = require('mongoose');

const monthlyQuotaSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },

    // Track monthly period (for rolling monthly resets)
    periodStart: { type: Date, default: () => new Date() },

    // Applications used in the current month
    applicationsUsed: { type: Number, default: 0 },
  },
  { timestamps: true }
);

monthlyQuotaSchema.statics.ensureForUser = async function ensureForUser(userId) {
  const existing = await this.findOne({ userId });
  if (existing) return existing;

  return this.create({ userId, periodStart: new Date(), applicationsUsed: 0 });
};

module.exports = {
  MonthlyApplicationQuota: mongoose.model('MonthlyApplicationQuota', monthlyQuotaSchema),
};
