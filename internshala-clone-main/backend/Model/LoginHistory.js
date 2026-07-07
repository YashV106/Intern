const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    timestamp: {
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    browserType: {
      type: String,
      default: null,
    },
    operatingSystem: {
      type: String,
      default: null,
    },
    deviceType: {
      type: String,
      enum: ["desktop", "laptop", "mobile"],
      default: null,
    },
    ipAddress: {
      type: String,
      default: null,
      index: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed", "Blocked", "Pending OTP"],
      required: true,
      index: true,
    },
  },
  { timestamps: false }
);

LoginHistorySchema.index({ userId: 1, timestamp: -1 });

module.exports = mongoose.model("LoginHistory", LoginHistorySchema);
