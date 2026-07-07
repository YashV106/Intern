const mongoose = require('mongoose');

const Tier = Object.freeze({
  FREE: 'FREE',
  BRONZE: 'BRONZE',
  SILVER: 'SILVER',
  GOLD: 'GOLD',
});

const tierMeta = {
  [Tier.FREE]: { monthlyLimit: 1, priceINR: 0 },
  [Tier.BRONZE]: { monthlyLimit: 3, priceINR: 100 },
  [Tier.SILVER]: { monthlyLimit: 5, priceINR: 300 },
  [Tier.GOLD]: { monthlyLimit: null, priceINR: 1000 }, // null => unlimited
};

const userSubscriptionSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, unique: true, index: true },

    activeTier: { type: String, enum: Object.values(Tier), default: Tier.FREE },

    // Used for "reset application count"
    periodStart: { type: Date, default: () => new Date() },

    // For monthly quotas
    applicationsUsedInCurrentPeriod: { type: Number, default: 0 },

    // Stripe/Razorpay references
    stripeCustomerId: { type: String },
    stripeSubscriptionId: { type: String },
    stripePriceId: { type: String },
    lastPaymentStatus: { type: String, enum: ['PENDING', 'PAID', 'FAILED', 'CANCELLED'], default: 'PENDING' },

    // Keep history (optional but useful)
    status: { type: String, enum: ['ACTIVE', 'INACTIVE'], default: 'ACTIVE' },
  },
  { timestamps: true }
);

// Helpers
userSubscriptionSchema.statics.Tier = Tier;
userSubscriptionSchema.statics.tierMeta = tierMeta;

userSubscriptionSchema.methods.getMonthlyLimit = function getMonthlyLimit() {
  const meta = tierMeta[this.activeTier] || tierMeta[Tier.FREE];
  return meta.monthlyLimit; // number or null
};

userSubscriptionSchema.methods.resetPeriodAndUsage = function resetPeriodAndUsage({ periodStart = new Date() } = {}) {
  this.periodStart = periodStart;
  this.applicationsUsedInCurrentPeriod = 0;
};

module.exports = {
  UserSubscription: mongoose.model('UserSubscription', userSubscriptionSchema),
  Tier,
  tierMeta,
};
