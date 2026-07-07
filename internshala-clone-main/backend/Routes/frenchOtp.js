const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");

// Simple in-memory store for OTPs.
// This is enough for assignment/demo purposes.
// Note: OTP resets on server restart.
const otpStore = new Map();

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function msUntil(expiresAt) {
  return Math.max(0, expiresAt - Date.now());
}

router.post("/send", async (req, res) => {
  try {
    const { email } = req.body;

    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Email is required" });
    }

    // Basic env-based email config
    const { OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS } = process.env;

    if (!OTP_EMAIL_HOST || !OTP_EMAIL_PORT || !OTP_EMAIL_USER || !OTP_EMAIL_PASS) {
      return res.status(500).json({
        error:
          "Email not configured. Set OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS in backend/.env",
      });
    }

    const otp = generateOtp();
    const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

    otpStore.set(email, { otp, expiresAt });

    const transporter = nodemailer.createTransport({
      host: OTP_EMAIL_HOST,
      port: Number(OTP_EMAIL_PORT),
      secure: Number(OTP_EMAIL_PORT) === 465,
      auth: {
        user: OTP_EMAIL_USER,
        pass: OTP_EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: OTP_EMAIL_USER,
      to: email,
      subject: "InternArea - French OTP verification",
      text: `Your OTP is: ${otp}. It expires in 5 minutes.`,
    });

    return res.status(200).json({
      ok: true,
      expiresAt,
      resendAfterMs: msUntil(expiresAt),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to send OTP" });
  }
});

router.post("/verify", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || typeof email !== "string" || !otp || typeof otp !== "string") {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const saved = otpStore.get(email);
    if (!saved) {
      return res.status(400).json({ error: "OTP not found. Please request a new one." });
    }

    if (Date.now() > saved.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    if (saved.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    otpStore.delete(email);
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OTP verification failed" });
  }
});

module.exports = router;

