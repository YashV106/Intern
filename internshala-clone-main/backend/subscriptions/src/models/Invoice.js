const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, index: true },

    subscriptionId: { type: String }, // stripe subscription id
    stripeInvoiceId: { type: String, index: true },

    tierBefore: { type: String },
    tierAfter: { type: String },

    amountINR: { type: Number, required: true },
    currency: { type: String, default: 'INR' },

    // For “invoice + plan details” email content
    billingPeriodStart: { type: Date },
    billingPeriodEnd: { type: Date },

    status: { type: String, enum: ['DRAFT', 'SENT', 'PAID', 'FAILED'], default: 'DRAFT' },

    // Email delivery tracking (optional)
    emailSentAt: { type: Date },
  },
  { timestamps: true }
);

module.exports = {
  Invoice: mongoose.model('SubscriptionInvoice', invoiceSchema),
};
