const Stripe = require('stripe');
const config = require('../config');

function getStripe() {
  return new Stripe(config.stripe.secretKey, {
    apiVersion: '2024-06-20',
  });
}

module.exports = { getStripe };
