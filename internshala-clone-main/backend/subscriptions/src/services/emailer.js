const nodemailer = require('nodemailer');
const config = require('../config');

function createTransporter() {
  if (config.email.provider !== 'nodemailer') {
    throw new Error(`Unsupported email provider: ${config.email.provider}`);
  }

  if (!config.email.smtpHost) {
    throw new Error('Missing SMTP_HOST in environment variables');
  }

  return nodemailer.createTransport({
    host: config.email.smtpHost,
    port: config.email.smtpPort,
    secure: config.email.smtpPort === 465, // typical
    auth: {
      user: config.email.smtpUser,
      pass: config.email.smtpPass,
    },
  });
}

async function sendInvoiceEmail({ toEmail, userName, invoice, tierMetaAfter }) {
  if (!toEmail) throw new Error('toEmail is required');

  const transport = createTransporter();

  const tierName = invoice.tierAfter || 'FREE';
  const limit = tierMetaAfter?.[tierName]?.monthlyLimit;
  const appsText = limit === null ? 'Unlimited' : `${limit} applications`;

  const subject = `Your ${tierName} subscription invoice (${invoice.currency})`;
  const html = `
    <div style="font-family: Arial, sans-serif; line-height:1.5;">
      <h2 style="margin:0 0 12px;">Hi ${userName || 'there'},</h2>
      <p style="margin:0 0 10px;">We’ve received your payment and activated your plan.</p>

      <div style="padding:12px; border:1px solid #eee; border-radius:8px;">
        <p><b>Plan:</b> ${tierName}</p>
        <p><b>Applications per month:</b> ${appsText}</p>
        <p><b>Amount:</b> ₹${invoice.amountINR} ${invoice.currency || ''}</p>
        <p><b>Billing period:</b> ${invoice.billingPeriodStart ? invoice.billingPeriodStart.toDateString() : '-'} to ${invoice.billingPeriodEnd ? invoice.billingPeriodEnd.toDateString() : '-'}</p>
        <p><b>Status:</b> PAID</p>
      </div>

      <p style="margin-top:14px;">Thanks,<br/>Internship Application Team</p>
    </div>
  `;

  const info = await transport.sendMail({
    from: config.email.fromEmail,
    to: toEmail,
    subject,
    html,
  });

  return info;
}

module.exports = { sendInvoiceEmail };
