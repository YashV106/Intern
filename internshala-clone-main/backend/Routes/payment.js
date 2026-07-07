const express = require("express");
const router = express.Router();

// Razorpay is optional in this codebase right now.
// This route is written to reuse Razorpay if available in env,
// otherwise it returns a clear error.

const crypto = require("crypto");
const Premium = require("../Model/Premium");
const User = require("../Model/User");
const nodemailer = require("nodemailer");
const { isWithinIstWindow, currentIstMonthKey } = require("./istTime");



function getPlanConfig(plan) {
  const p = String(plan || "").toLowerCase();
  if (p === "bronze") return { plan: "bronze", amount: 100, applicationsPerMonth: 3 };
  if (p === "silver") return { plan: "silver", amount: 300, applicationsPerMonth: 5 };
  if (p === "gold") return { plan: "gold", amount: 1000, applicationsPerMonth: -1 };
  return { plan: "free", amount: 0, applicationsPerMonth: 1 };
}

function amountToPaise(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function getIstTimeWindowValidation() {
  // Allowed between 10:00 and 11:00 IST
  return isWithinIstWindow({ startHour: 10, startMinute: 0, endHour: 11, endMinute: 0 });
}

const MONTH_KEY = currentIstMonthKey();

async function sendInvoiceEmail({ toEmail, studentId, plan, amount, paymentId, orderId }) {
  // invoice is sent after successful verification

  const { OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS } = process.env;

  if (!OTP_EMAIL_HOST || !OTP_EMAIL_PORT || !OTP_EMAIL_USER || !OTP_EMAIL_PASS) {
    throw new Error("Email not configured. Set OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS in backend/.env");
  }

  const transporter = nodemailer.createTransport({
    host: OTP_EMAIL_HOST,
    port: Number(OTP_EMAIL_PORT),
    secure: Number(OTP_EMAIL_PORT) === 465,
    auth: { user: OTP_EMAIL_USER, pass: OTP_EMAIL_PASS },
  });

  const amountStr = amount === 0 ? "₹0 (Free plan)" : `₹${amount}`;
  const subject = `Invoice: ${plan.toUpperCase()} internship subscription`;
  const text = [
    `Hi,`,
    ``,
    `Your subscription payment was successful.`,
    ``,
    `Plan: ${plan.toUpperCase()}`,
    `Amount: ${amountStr}`,
    `Student ID: ${studentId}`,
    `Order ID: ${orderId || ""}`,
    `Payment ID: ${paymentId || ""}`,
    ``,
    `You can now apply for internships according to your plan quota.`,
    ``,
    `Thanks,`
  ].join("\n");

  await transporter.sendMail({ from: OTP_EMAIL_USER, to: toEmail, subject, text });
}


function requireEnv(name) {
  if (!process.env[name]) {
    throw new Error(`Missing env var: ${name}`);
  }
  return process.env[name];
}

function amountToPaise(amount) {
  // ₹50 => 5000 paise
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

router.post("/create-order", async (req, res) => {
  try {
    if (!getIstTimeWindowValidation()) {
      return res
        .status(403)
        .json({ error: "Payments are allowed only between 10:00 AM and 11:00 AM IST" });
    }

    const { studentId, premiumEmailVerified, plan } = req.body;

    if (!studentId) return res.status(400).json({ error: "studentId is required" });
    if (premiumEmailVerified !== true) {
      return res
        .status(403)
        .json({ error: "Email OTP verification is required before payment" });
    }

    const cfg = getPlanConfig(plan);
    const amount = cfg.amount;
    const currency = "INR";

    // Create order (Razorpay)
    const razorpayKey = requireEnv("RAZORPAY_KEY_ID");
    requireEnv("RAZORPAY_KEY_SECRET");

    const orderId = "order_" + crypto.randomBytes(12).toString("hex");

    await Premium.findOneAndUpdate(
      { studentId },
      {
        plan: cfg.plan,
        status: "inactive",
        monthKey: MONTH_KEY,
        applicationsPerMonth: cfg.applicationsPerMonth,
        usageCount: 0,
        periodStart: new Date(),
        periodEnd: new Date(),
        orderId,
        paymentId: "",
        amount,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      ok: true,
      amount,
      currency,
      orderId,
      razorpayKey,
      plan: cfg.plan,
      applicationsPerMonth: cfg.applicationsPerMonth,
      monthKey: MONTH_KEY,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Payment order creation failed" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { studentId, orderId, paymentId, signature } = req.body;

    if (!studentId || !orderId || !paymentId || !signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    const razorpaySecret = requireEnv("RAZORPAY_KEY_SECRET");

    // Razorpay signature verification: HMAC SHA256(orderId|paymentId)
    const expected = crypto
      .createHmac("sha256", razorpaySecret)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    if (expected !== signature) {
      return res.status(400).json({ error: "Invalid Razorpay signature" });
    }

    const premium = await Premium.findOneAndUpdate(
      { studentId },
      {
        status: "active",
        paymentId,
        orderId,
        purchasedAt: new Date(),
        monthKey: MONTH_KEY,
      },
      { upsert: true, new: true }
    );

    // Invoice email after successful verification
    let toEmail = "";
    try {
      const user = await User.findOne({ _id: studentId }).lean();
      toEmail = user && user.email ? user.email : "";
    } catch (e) {
      // ignore
    }

    if (premium && toEmail) {
      await sendInvoiceEmail({
        toEmail,
        studentId,
        plan: premium.plan || "free",
        amount: premium.amount || 0,
        paymentId,
        orderId,
      });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Payment verification failed" });
  }
});

module.exports = router;

