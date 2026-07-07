const express = require('express');
const { getStripe } = require('../services/stripeClient');
const config = require('../config');
const { UserSubscription, Tier } = require('../models/UserSubscription');

const router = express.Router();

/**
 * POST /api/subscriptions/create-checkout-session
 * Body: { tier: 'FREE'|'BRONZE'|'SILVER'|'GOLD' }
 *
 * NOTE: Attach your existing auth middleware so req.user exists.
 * For this module, we read userId from req.user.id or req.user._id.
 */
router.post('/create-checkout-session', async (req, res) => {
  try {
    const { tier } = req.body || {};

    if (!tier) return res.status(400).json({ error: 'MISSING_TIER' });
    if (![Tier.FREE, Tier.BRONZE, Tier.SILVER, Tier.GOLD].includes(tier)) {
      return res.status(400).json({ error: 'INVALID_TIER' });
    }

    const userId = req.user?.id || req.user?._id;
    if (!userId) return res.status(401).json({ error: 'UNAUTHENTICATED' });

    // Disallow upgrading to current active tier
    const sub = await UserSubscription.findOne({ userId });
    if (sub?.activeTier === tier) {
      return res.status(409).json({ error: 'ALREADY_ACTIVE', message: 'This plan is already active.' });
    }

    // Free plan: no payment required; you can activate immediately if you want.
    if (tier === Tier.FREE) {
      return res.json({ checkoutUrl: null, message: 'FREE plan does not require payment.' });
    }

    const priceId = config.app.priceIds[tier.toLowerCase()];
    if (!priceId) return res.status(500).json({ error: 'MISSING_PRICE_ID', tier });

    const stripe = getStripe();

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId, quantity: 1 }],
      currency: config.app.currency,
      success_url: `${config.app.frontendBaseUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.app.frontendBaseUrl}/upgrade?canceled=1`,

      // Important: put userId into metadata for webhook mapping
      subscription_data: {
        metadata: { userId },
      },
      // also attach metadata to session (some event types carry session metadata)
      metadata: { userId },

      customer_email: req.user?.email, // if available in auth middleware
    });

    return res.json({ checkoutUrl: session.url });
  } catch (err) {
    // eslint-disable-next-line no-console
    console.error('create-checkout-session error:', err);
    return res.status(500).json({ error: 'SERVER_ERROR', message: err.message });
  }
});

module.exports = router;
