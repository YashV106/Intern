const express = require("express");
const router = express.Router();
const nodemailer = require("nodemailer");
const EmailOtp = require("../Model/EmailOtp");

function generateOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function isEmailValid(email) {
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

async function sendOtpEmail({ email, otp }) {
  const { OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS } =
    process.env;

  if (!OTP_EMAIL_HOST || !OTP_EMAIL_PORT || !OTP_EMAIL_USER || !OTP_EMAIL_PASS) {
    throw new Error(
      "Email not configured. Set OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS in backend/.env"
    );
  }

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
    subject: "Verify Your Email",
    text: `Your verification code is:\n\n${otp}\n\nThis OTP is valid for 5 minutes.\nDo not share it with anyone.`,
  });
}

router.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;

    if (!isEmailValid(email)) {
      return res.status(400).json({ error: "Valid email is required" });
    }

    const now = new Date();

    const existing = await EmailOtp.findOne({ email });
    if (existing && existing.cooldownUntil && existing.cooldownUntil > now) {
      const seconds = Math.ceil((existing.cooldownUntil - now) / 1000);
      return res
        .status(429)
        .json({ error: `Please wait ${seconds}s before resending OTP` });
    }

    if (existing && existing.resendCount >= 3) {
      return res.status(429).json({ error: "Maximum resend attempts reached" });
    }

    const otp = generateOtp6();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const cooldownUntil = new Date(Date.now() + 30 * 1000);

    if (!existing) {
      await EmailOtp.create({
        email,
        otp,
        expiresAt,
        verified: false,
        resendCount: 0,
        cooldownUntil,
      });
    } else {
      existing.otp = otp;
      existing.expiresAt = expiresAt;
      existing.verified = false;
      existing.resendCount = (existing.resendCount || 0) + 1;
      existing.cooldownUntil = cooldownUntil;
      existing.lastGeneratedAt = new Date();
      await existing.save();
    }

    await sendOtpEmail({ email, otp });

    return res.status(200).json({
      ok: true,
      expiresAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Email OTP send failed" });
  }
});

router.post("/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!isEmailValid(email) || typeof otp !== "string") {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const record = await EmailOtp.findOne({ email });
    if (!record) {
      return res.status(400).json({ error: "OTP not found. Please request a new one." });
    }

    if (record.verified) {
      return res.status(400).json({ error: "OTP already verified" });
    }

    const now = new Date();
    if (record.expiresAt < now) {
      await EmailOtp.deleteOne({ email });
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    if (record.otp !== otp) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Invalidate OTP immediately after successful verification
    await EmailOtp.deleteOne({ email });

    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OTP verification failed" });
  }
});

module.exports = router;

