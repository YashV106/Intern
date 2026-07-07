const { UserSubscription, Tier } = require('../models/UserSubscription');
const { Invoice } = require('../models/Invoice');
const { MonthlyApplicationQuota } = require('../models/MonthlyApplicationQuota');

/**
 * Reset monthly quota + subscription tier on successful payment.
 * @param {Object} params
 * @param {String} params.userId
 * @param {String} params.tierAfter
 * @param {Object} params.stripeEventData
 * @param {Number} params.amountINR
 * @param {String} params.stripeSubscriptionId
 * @param {String} params.stripeInvoiceId
 */
async function handleSuccessfulPayment({
  userId,
  tierAfter,
  stripeEventData,
  amountINR,
  stripeSubscriptionId,
  stripeInvoiceId,
}) {
  const inv = await Invoice.create({
    userId,
    subscriptionId: stripeSubscriptionId,
    stripeInvoiceId,
    tierBefore: null,
    tierAfter,
    amountINR,
    currency: 'INR',
    billingPeriodStart: stripeEventData?.billing_period_start
      ? new Date(stripeEventData.billing_period_start * 1000)
      : undefined,
    billingPeriodEnd: stripeEventData?.billing_period_end
      ? new Date(stripeEventData.billing_period_end * 1000)
      : undefined,
    status: 'PAID',
    emailSentAt: null,
  });

  const userSub = await UserSubscription.findOne({ userId });
  const tierMeta = UserSubscription.tierMeta;

  if (!userSub) {
    await UserSubscription.create({
      userId,
      activeTier: tierAfter,
      status: 'ACTIVE',
      stripeSubscriptionId,
      lastPaymentStatus: 'PAID',
      stripePriceId: stripeEventData?.price?.id,
      stripeCustomerId: stripeEventData?.customer?.id,
    });
  } else {
    userSub.activeTier = tierAfter;
    userSub.status = 'ACTIVE';
    userSub.lastPaymentStatus = 'PAID';
    userSub.stripeSubscriptionId = stripeSubscriptionId;
    userSub.stripePriceId = stripeEventData?.price?.id;
    userSub.stripeCustomerId = stripeEventData?.customer?.id;
    await userSub.save();
  }

  // Reset quota on successful payment
  const quota = await MonthlyApplicationQuota.ensureForUser(userId);
  quota.periodStart = new Date();
  quota.applicationsUsed = 0;
  await quota.save();

  return inv;
}

module.exports = { handleSuccessfulPayment, Tier };
