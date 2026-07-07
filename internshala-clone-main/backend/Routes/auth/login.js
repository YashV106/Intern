const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const UAHistory = require("../../Model/LoginHistory");
const User = require("../../Model/User");
const ChromeLoginOtp = require("../../Model/ChromeLoginOtp");
const nodemailer = require("nodemailer");

const parseEmail = (email) => String(email || "").trim();

function isEmailValid(email) {
  return (
    typeof email === "string" &&
    email.includes("@") &&
    email.includes(".") &&
    email.trim().length > 3
  );
}

function generateOtp6() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail({ to, otp }) {
  const { OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS } =
    process.env;

  if (!OTP_EMAIL_HOST || !OTP_EMAIL_PORT || !OTP_EMAIL_USER || !OTP_EMAIL_PASS) {
    throw new Error(
      "Email not configured. Set OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS"
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
    to,
    subject: "Your login OTP",
    text: `Your login OTP is:\n\n${otp}\n\nThis OTP is valid for 5 minutes. Do not share it with anyone.`,
  });
}

function isWithinTimeWindow({ now, timezone }) {
  // Time window: 10:00 AM to 1:00 PM inclusive start, exclusive end.
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: timezone,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(now);

  const get = (type) => parts.find((p) => p.type === type)?.value;
  const hour = Number(get("hour"));
  const minute = Number(get("minute"));

  const totalMinutes = hour * 60 + minute;
  const start = 10 * 60; // 10:00
  const end = 13 * 60; // 13:00 (1:00 PM)

  return totalMinutes >= start && totalMinutes < end;
}

router.post("/", async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const parsedEmail = parseEmail(email);

    if (!isEmailValid(parsedEmail) || typeof password !== "string") {
      return res.status(400).json({ error: "Invalid credentials" });
    }

    // UA/IP parsing should happen via middleware; fallback to nulls
    const { browserType, operatingSystem, deviceType } = req.parsedUserAgent || {};
    const ipAddress = req.clientIp || null;
    const timestamp = new Date();

    const user = await User.findOne({ email: parsedEmail });
    if (!user) {
      // Can't create LoginHistory without userId; store Failed with null userId if desired.
      // Per requirements, it should be linked to User; we'll store nothing here.
      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Mobile access rule (403 outside window)
    if (deviceType === "mobile") {
      const timezone = process.env.LOGIN_TIMEZONE || "Asia/Kolkata";
      const within = isWithinTimeWindow({ now: new Date(), timezone });

      if (!within) {
        await UAHistory.create({
          userId: user._id,
          timestamp,
          browserType: browserType || null,
          operatingSystem: operatingSystem || null,
          deviceType: deviceType || null,
          ipAddress,
          status: "Blocked",
        });

        return res.status(403).json({
          error: `Mobile access is restricted to 10:00 AM - 1:00 PM (${timezone})`,
        });
      }
    }

    // Password check
    if (!user.password || user.password !== password) {
      await UAHistory.create({
        userId: user._id,
        timestamp,
        browserType: browserType || null,
        operatingSystem: operatingSystem || null,
        deviceType: deviceType || null,
        ipAddress,
        status: "Failed",
      });

      return res.status(401).json({ error: "Invalid credentials" });
    }

    // Chrome OTP rule
    if (browserType === "Chrome") {
      const otp = generateOtp6();
      const expiresAt = new Date(Date.now() + 5 * 60 * 1000);

      // Upsert OTP record
      await ChromeLoginOtp.updateOne(
        { userId: user._id },
        {
          $set: {
            email: user.email,
            otp,
            expiresAt,
            usedAt: null,
          },
        },
        { upsert: true }
      );

      await UAHistory.create({
        userId: user._id,
        timestamp,
        browserType: browserType || null,
        operatingSystem: operatingSystem || null,
        deviceType: deviceType || null,
        ipAddress,
        status: "Pending OTP",
      });

      await sendOtpEmail({ to: user.email, otp });

      // Challenge response
      return res.status(202).json({
        challenge: "REQUIRES_OTP",
        email: user.email,
        expiresAt,
      });
    }

    // Success: issue JWT
    const token = jwt.sign(
      { userId: user._id.toString(), email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    await UAHistory.create({
      userId: user._id,
      timestamp,
      browserType: browserType || null,
      operatingSystem: operatingSystem || null,
      deviceType: deviceType || null,
      ipAddress,
      status: "Success",
    });

    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Login failed" });
  }
});

module.exports = router;
