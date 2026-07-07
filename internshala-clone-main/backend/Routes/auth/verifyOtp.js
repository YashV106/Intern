const express = require("express");
const router = express.Router();

const jwt = require("jsonwebtoken");
const UAHistory = require("../../Model/LoginHistory");
const User = require("../../Model/User");
const ChromeLoginOtp = require("../../Model/ChromeLoginOtp");

function isEmailValid(email) {
  return (
    typeof email === "string" &&
    email.includes("@") &&
    email.includes(".") &&
    email.trim().length > 3
  );
}

function generateToken(user) {
  return jwt.sign(
    { userId: user._id.toString(), email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

router.post("/", async (req, res) => {
  try {
    const { email, otp } = req.body || {};
    const parsedEmail = isEmailValid(email) ? email.trim() : null;

    if (!parsedEmail || typeof otp !== "string") {
      return res.status(400).json({ error: "Email and OTP are required" });
    }

    const user = await User.findOne({ email: parsedEmail });
    if (!user) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    const record = await ChromeLoginOtp.findOne({
      userId: user._id,
      email: parsedEmail,
    });

    if (!record) {
      return res.status(400).json({ error: "OTP not found. Please login again." });
    }

    if (record.usedAt) {
      return res.status(400).json({ error: "OTP already used. Please login again." });
    }

    const now = new Date();
    if (record.expiresAt < now) {
      await ChromeLoginOtp.deleteOne({ _id: record._id });
      return res.status(400).json({ error: "OTP expired. Please login again." });
    }

    if (String(record.otp) !== String(otp)) {
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Invalidate OTP
    record.usedAt = now;
    await record.save();

    // Record successful login
    const { browserType, operatingSystem, deviceType } = req.parsedUserAgent || {};
    const ipAddress = req.clientIp || null;

    await UAHistory.create({
      userId: user._id,
      timestamp: now,
      browserType: browserType || null,
      operatingSystem: operatingSystem || null,
      deviceType: deviceType || null,
      ipAddress,
      status: "Success",
    });

    const token = generateToken(user);
    return res.status(200).json({ token });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "OTP verification failed" });
  }
});

module.exports = router;
