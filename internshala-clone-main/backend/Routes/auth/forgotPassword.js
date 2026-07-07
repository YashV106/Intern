const express = require("express");
const router = express.Router();

const User = require("../../Model/User");

function isEmailValid(email) {
  return typeof email === "string" && email.includes("@") && email.includes(".");
}

function normalizePhone(value) {
  if (typeof value !== "string") return "";
  const digits = value.replace(/[^0-9]/g, "");
  return digits;
}

function isPhoneValid(value) {
  const digits = normalizePhone(value);
  // basic validation: 10-15 digits
  return digits.length >= 10 && digits.length <= 15;
}

function generateRandomPassword(minLen = 10, maxLen = 12) {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const letters = upper + lower;

  const length = Math.floor(Math.random() * (maxLen - minLen + 1)) + minLen;

  let out = "";
  for (let i = 0; i < length; i++) {
    // distribution of uppercase/lowercase is naturally random via the combined alphabet
    out += letters[Math.floor(Math.random() * letters.length)];
  }

  return out;
}

router.post("/forgot-password", async (req, res) => {
  try {
    const { identifier } = req.body;

    if (!identifier || typeof identifier !== "string" || identifier.trim().length === 0) {
      return res.status(400).json({ error: "Email or phone is required" });
    }

    const raw = identifier.trim();
    const isEmail = isEmailValid(raw);
    const isPhone = !isEmail && isPhoneValid(raw);

    if (!isEmail && !isPhone) {
      // Keep messages simple and aligned with frontend expectations
      return res.status(400).json({ error: "Enter a valid email or phone number" });
    }

    const query = isEmail ? { email: raw } : { phone: normalizePhone(raw) };

    const user = await User.findOne(query);
    if (!user) {
      return res.status(400).json({ error: "User not found" });
    }

    const now = new Date();
    if (user.lastPasswordResetAt) {
      const diffMs = now.getTime() - user.lastPasswordResetAt.getTime();
      const dayMs = 24 * 60 * 60 * 1000;
      if (diffMs < dayMs) {
        return res.status(429).json({ error: "You can use this option only once per day." });
      }
    }

    const newPassword = generateRandomPassword(10, 12);

    user.password = newPassword;
    user.lastPasswordResetAt = now;
    await user.save();

    return res.status(200).json({
      ok: true,
      password: newPassword,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Unexpected error" });
  }
});

module.exports = router;

