const mongoose = require("mongoose");

const LoginHistorySchema = new mongoose.Schema(
  {
    // --- Identity / user ---
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
      ref: "User",
    },
    userName: { type: String, default: null, index: true },
    email: { type: String, default: null, index: true },

    // --- Login time ---
    timestamp: {
      // Keeping existing field name for backwards compatibility
      type: Date,
      required: true,
      default: Date.now,
      index: true,
    },
    loginDate: { type: Date, default: null }, // derived at write-time
    loginTime: { type: String, default: null }, // derived at write-time

    // --- Browser / OS / device ---
    browserType: { type: String, default: null, index: true }, // existing
    browserName: { type: String, default: null, index: true }, // requested
    browserVersion: { type: String, default: null },

    operatingSystem: { type: String, default: null, index: true },
    deviceType: {
      type: String,
      enum: ["desktop", "laptop", "mobile", "tablet"],
      default: null,
      index: true,
    },
    deviceModel: { type: String, default: null },
    deviceVersion: { type: String, default: null }, // when UA parser can infer

    // --- IP / geo ---
    ipAddress: { type: String, default: null, index: true }, // existing
    ipLocal: { type: String, default: null },
    country: { type: String, default: null, index: true },
    state: { type: String, default: null, index: true },
    city: { type: String, default: null, index: true },
    timeZone: { type: String, default: null },

    // --- Login method / status ---
    loginMethod: {
      type: String,
      enum: ["Email/Password", "Google OAuth", "OTP", "Unknown"],
      default: "Unknown",
      index: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed", "Blocked", "Pending OTP"],
      required: true,
      index: true,
    },
    failureReason: { type: String, default: null },

    // --- Session tracking ---
    sessionId: { type: String, default: null, index: true },
    userAgent: { type: String, default: null },
    lastActivityTime: { type: Date, default: null },
    logoutTime: { type: Date, default: null },
    sessionDuration: { type: Number, default: null }, // seconds

    // --- extra metadata ---
    loginStatus: { type: String, default: null }, // alias for admin UX
  },
  { timestamps: false }
);

LoginHistorySchema.index({ userId: 1, timestamp: -1 });
LoginHistorySchema.index({ ipAddress: 1, timestamp: -1 });
LoginHistorySchema.index({ browserType: 1, deviceType: 1, timestamp: -1 });
LoginHistorySchema.index({ loginMethod: 1, status: 1, timestamp: -1 });

module.exports = mongoose.model("LoginHistory", LoginHistorySchema);
