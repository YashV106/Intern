const express = require('express');

const upgrade = require('./upgrade');
const stripeWebhook = require('./stripeWebhook');

const router = express.Router();

// Checkout/initiation
router.use('/upgrade', upgrade);

// Stripe webhook
// Mount exactly where main server registers this module.
router.use('/', stripeWebhook);

module.exports = router;
