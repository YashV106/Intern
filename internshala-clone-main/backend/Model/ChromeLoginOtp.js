const mongoose = require("mongoose");

const ChromeLoginOtpSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    email: {
      type: String,
      required: true,
      index: true,
    },
    otp: {
      type: String,
      required: true,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: true,
    },
    usedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

ChromeLoginOtpSchema.index({ userId: 1, expiresAt: 1 });

module.exports = mongoose.model("ChromeLoginOtp", ChromeLoginOtpSchema);
