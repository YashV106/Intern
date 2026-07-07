const mongoose = require("mongoose");

const ResumeSchema = new mongoose.Schema({
  studentId: {
    type: String,
    required: true,
    index: true,
    unique: true,
  },

  // Web preview link (optional)
  resumeUrl: {
    type: String,
    default: "",
  },

  // Uploaded resume photo
  photoUrl: {
    type: String,
    default: "",
  },

  // Draft/structured resume payload (ATS fields)
  resume_json: {
    type: Object,
    default: {},
  },
  // Compatibility alias (some routes store resumeData)
  resumeData: {
    type: Object,
    default: {},
  },

  // Generated ATS PDF (final)
  pdf_path: {
    type: String,
    default: "",
  },
  pdfUrl: {
    type: String,
    default: "",
  },
  pdfGeneratedAt: {
    type: Date,
    default: null,
  },
  template_name: {
    type: String,
    default: "Modern Blue",
  },

  // Premium activation flag (gates download/generation)
  premiumActive: {
    type: Boolean,
    default: false,
    index: true,
  },
  premiumActivatedAt: {
    type: Date,
    default: null,
  },

  // OTP verification metadata for premium generation
  otpVerified: {
    type: Boolean,
    default: false,
  },
  otpVerifiedAt: {
    type: Date,
    default: null,
  },
  // Keep audit pointers to order creation attempt
  otpOrderReceipt: {
    type: String,
    default: "",
  },

  // Premium Resume payment refs (idempotency + audit)
  premiumOrderId: { type: String, default: "" },
  premiumPaymentId: { type: String, default: "" },
  premiumSignature: { type: String, default: "" },

  premiumPaymentStatus: {
    type: String,
    enum: ["created", "paid", "failed", "none"],
    default: "none",
    index: true,
  },

  paymentAmount: { type: Number, default: 0 },
  paymentCurrency: { type: String, default: "INR" },
  premiumPaymentTimestamp: { type: Date, default: null },

  // created/updated
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

ResumeSchema.pre("save", function (next) {
  this.updatedAt = new Date();
  next();
});

module.exports = mongoose.model("Resume", ResumeSchema);

