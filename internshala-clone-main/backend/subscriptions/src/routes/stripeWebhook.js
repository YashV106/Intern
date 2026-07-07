const express = require('express');
const config = require('../config');
const { getStripe } = require('./../services/stripeClient');
const { handleSuccessfulPayment, Tier } = require('../services/stripeWebhookHandler');
const { sendInvoiceEmail } = require('../services/emailer');

const router = express.Router();

/**
 * Stripe webhook endpoint
 * IMPORTANT: In your main app, you must use raw body for stripe signature verification.
 * Example:
 * app.post('/api/subscriptions/stripe-webhook', express.raw({ type: 'application/json' }), webhookRouter)
 */
router.post('/stripe-webhook', async (req, res) => {
  try {
    const stripe = getStripe();

    const rawBody = req.body; // should be Buffer from express.raw
    const sig = req.headers['stripe-signature'];

    const event = stripe.webhooks.constructEvent(rawBody, sig, config.stripe.webhookSecret);

    // We only handle recurring subscription/payment success events.
    // For Stripe, typical event types:
    // - invoice.paid (when using subscriptions)
    // - checkout.session.completed (for one-time checkout)
    const eventType = event.type;
    const data = event.data?.object || {};

    // Idempotency: use stripe event id in DB in production.
    if (eventType === 'invoice.paid') {
      // invoice.paid includes billing + customer and subscription info
      const stripeSubscriptionId = data.subscription || data.lines?.data?.[0]?.plan?.id;
      const stripeInvoiceId = data.id;

      // Determine tier from price id
      const priceId = data.lines?.data?.[0]?.price?.id;
      let tierAfter = null;
      if (priceId === config.app.priceIds.bronze) tierAfter = Tier.BRONZE;
      if (priceId === config.app.priceIds.silver) tierAfter = Tier.SILVER;
      if (priceId === config.app.priceIds.gold) tierAfter = Tier.GOLD;

      // If mapping fails, fail safe.
      if (!tierAfter) {
        return res.status(400).json({ error: 'UNKNOWN_TIER', message: 'Could not map tier from price id.' });
      }

      // We stored userId in metadata when creating checkout.
      const userId = data.metadata?.userId;
      if (!userId) {
        return res.status(400).json({ error: 'MISSING_USER_ID', message: 'No userId in metadata.' });
      }

      // Determine amount
      const amountINR = data.amount_paid ? data.amount_paid / 100 : (data.amount_due ? data.amount_due / 100 : 0);

      const invoice = await handleSuccessfulPayment({
        userId,
        tierAfter,
        stripeEventData: data,
        amountINR,
        stripeSubscriptionId,
        stripeInvoiceId,
      });

      // Email invoice + plan details
      // Best-effort: Stripe sends customer_email; additionally we store userName/email in metadata if you add it.
      const toEmail = data.customer_email || data.metadata?.email;
      if (toEmail) {
        await sendInvoiceEmail({
          toEmail,
          userName: data.customer_name || data.metadata?.userName,
          invoice,
          tierMetaAfter: { [tierAfter]: { monthlyLimit: null } },
        });
      }
    }

    res.json({ received: true });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('Stripe webhook error:', err);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

module.exports = router;
