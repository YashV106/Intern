const mongoose = require("mongoose");

const EmailOtpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },
  otp: {
    type: String,
    required: true,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
  verified: {
    type: Boolean,
    default: false,
  },
  resendCount: {
    type: Number,
    default: 0,
  },
  cooldownUntil: {
    type: Date,
    default: null,
  },
  lastGeneratedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("EmailOtp", EmailOtpSchema);

