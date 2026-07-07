require('dotenv').config();

const config = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  },
  app: {
    currency: process.env.SUBSCRIPTION_CURRENCY || 'INR',
    priceIds: {
      free: process.env.STRIPE_PRICE_ID_FREE, // optional
      bronze: process.env.STRIPE_PRICE_ID_BRONZE,
      silver: process.env.STRIPE_PRICE_ID_SILVER,
      gold: process.env.STRIPE_PRICE_ID_GOLD,
    },
    frontendBaseUrl: process.env.FRONTEND_BASE_URL || 'http://localhost:3000',
  },
  email: {
    provider: process.env.EMAIL_PROVIDER || 'nodemailer',
    fromEmail: process.env.FROM_EMAIL,
    smtpHost: process.env.SMTP_HOST,
    smtpPort: Number(process.env.SMTP_PORT || 587),
    smtpUser: process.env.SMTP_USER,
    smtpPass: process.env.SMTP_PASS,
  },
  paymentWindow: {
    // IST time window: 10:00 to 11:00
    startHour: 10,
    endHour: 11,
    // interpret as [start, end) to avoid double-accept at exactly end
    endMinuteExclusive: 0,
  },
};

function assertConfig() {
  const missing = [];
  if (!config.stripe.secretKey) missing.push('STRIPE_SECRET_KEY');
  if (!config.stripe.webhookSecret) missing.push('STRIPE_WEBHOOK_SECRET');
  if (!config.app.priceIds.bronze) missing.push('STRIPE_PRICE_ID_BRONZE');
  if (!config.app.priceIds.silver) missing.push('STRIPE_PRICE_ID_SILVER');
  if (!config.app.priceIds.gold) missing.push('STRIPE_PRICE_ID_GOLD');
  if (!config.email.fromEmail) missing.push('FROM_EMAIL');

  if (missing.length) {
    // eslint-disable-next-line no-console
    console.warn('Missing subscription config:', missing.join(', '));
  }
}

assertConfig();

module.exports = config;
