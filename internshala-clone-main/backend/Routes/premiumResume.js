const express = require("express");
const router = express.Router();

const crypto = require("crypto");
const path = require("path");
const fs = require("fs");
const multer = require("multer");

const authRequired = require("../middleware/authRequired");
const Resume = require("../Model/Resume");
const EmailOtp = require("../Model/EmailOtp");
const User = require("../Model/User");

const { generateResumePdf } = require("../services/resumePdf");

const Razorpay = (() => {
  // Razorpay SDK is optional; premium resume flow should fail clearly if missing.
  try {
    // eslint-disable-next-line global-require
    return require("razorpay");
  } catch {
    return null;
  }
})();

// Multer for profile photo upload
const uploadDir = path.join(__dirname, "..", "uploads", "resume-photos");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: function (_req, _file, cb) {
    cb(null, uploadDir);
  },
  filename: function (_req, file, cb) {
    const ext = path.extname(file.originalname || "").toLowerCase() || ".jpg";
    const safeExt = [".jpg", ".jpeg", ".png", ".webp"].includes(ext) ? ext : ".jpg";
    const name = crypto.randomBytes(12).toString("hex") + safeExt;
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "").toLowerCase();
    const ok = [".jpg", ".jpeg", ".png", ".webp"].includes(ext);
    cb(ok ? null : new Error("Invalid file type. Upload jpg/png/webp."), ok);
  },
});

function requireEnv(name) {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

function validateStudentId(studentId) {
  if (!studentId || typeof studentId !== "string") return false;
  return true;
}

function nowIso() {
  return new Date().toISOString();
}

function amountToPaise(amount) {
  const n = Number(amount);
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.round(n * 100);
}

function isWithinAttempts(record, maxAttempts) {
  const attempts = Number(record.attempts || 0);
  return attempts < maxAttempts;
}

async function getStudentEmail(studentId) {
  const u = await User.findOne({ _id: studentId }).lean();
  if (!u || !u.email) throw new Error("Student email not found");
  return u.email;
}

function getRazorpayClient() {
  if (!Razorpay) {
    throw new Error("Razorpay SDK not installed. Install razorpay package or configure payment another way.");
  }
  const keyId = requireEnv("RAZORPAY_KEY_ID");
  const keySecret = requireEnv("RAZORPAY_KEY_SECRET");
  return {
    client: new Razorpay({ key_id: keyId, key_secret: keySecret }),
    keySecret,
    keyId,
  };
}

function hmacSha256Hex(secret, data) {
  return crypto.createHmac("sha256", secret).update(data).digest("hex");
}

/**
 * Endpoint contract is aligned to:
 * internarea/src/lib/api.ts
 */
router.post(
  "/submit-form",
  authRequired,
  upload.single("photo"),
  async (req, res) => {
    try {
      const studentId = req.body.studentId;
      if (!validateStudentId(studentId)) {
        return res.status(400).json({ error: "studentId is required" });
      }

      // Premium check: per spec OTP+payment unlocks templates/export.
      // But draft saving can still be allowed to keep UX smooth.
      // We'll still store safely.
      const resumeData = (() => {
        // Frontend may send either resume JSON fields or minimal fields.
        // For this repo’s current frontend expectations, store whatever it sends.
        return {
          name: req.body.name || "",
          qualifications: req.body.qualifications || "",
          experience: req.body.experience || "",
          personalInformation: req.body.personalInformation || "",
          // Store the full payload for scalability
          _raw: {
            ...req.body,
          },
        };
      })();

      const photoFile = req.file;
      const photoUrl = photoFile
        ? `/uploads/resume-photos/${photoFile.filename}`
        : "";

      // Keep draft in Resume record
      // Ensure schema supports resume_json/resumeData etc; we’ll store both for compatibility.
      const updated = await Resume.findOneAndUpdate(
        { studentId },
        {
          resumeData: resumeData, // existing placeholders may use this key
          resume_json: resumeData,
          photoUrl,
          updatedAt: new Date(),
        },
        { upsert: true, new: true }
      );

      return res.status(200).json({
        ok: true,
        resumeExists: !!updated,
        updatedAt: updated?.updatedAt || nowIso(),
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ error: err.message || "Failed to submit resume form" });
    }
  }
);

router.post("/send-otp", authRequired, async (req, res) => {
  try {
    const { studentId, email } = req.body || {};
    if (!validateStudentId(studentId)) {
      return res.status(400).json({ error: "studentId is required" });
    }

    const studentEmail = email && typeof email === "string" ? email : await getStudentEmail(studentId);

    // Basic rate limiting handled by EmailOtp route behavior; we implement similarly here
    // but using EmailOtp model directly to keep contract stable.
    const now = new Date();
    const existing = await EmailOtp.findOne({ email: studentEmail });

    if (existing && existing.cooldownUntil && existing.cooldownUntil > now) {
      const seconds = Math.ceil((existing.cooldownUntil - now) / 1000);
      return res.status(429).json({ error: `Please wait ${seconds}s before resending OTP` });
    }

    const maxResendAttempts = 3;
    if (existing && Number(existing.resendCount || 0) >= maxResendAttempts) {
      return res.status(429).json({ error: "Maximum resend attempts reached" });
    }

    const otpPlain = String(Math.floor(100000 + Math.random() * 900000));
    const otpHash = crypto.createHash("sha256").update(otpPlain).digest("hex");
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    const cooldownUntil = new Date(Date.now() + 60 * 1000); // resend cooldown 60s for resume spec
    const otpRecordPayload = {
      email: studentEmail,
      otp: otpHash,
      expiresAt,
      verified: false,
      resendCount: existing ? Number(existing.resendCount || 0) + 1 : 0,
      cooldownUntil,
      lastGeneratedAt: new Date(),
    };

    if (!existing) {
      await EmailOtp.create(otpRecordPayload);
    } else {
      existing.otp = otp;
      existing.expiresAt = expiresAt;
      existing.verified = false;
      existing.resendCount = otpRecordPayload.resendCount;
      existing.cooldownUntil = cooldownUntil;
      existing.lastGeneratedAt = otpRecordPayload.lastGeneratedAt;
      await existing.save();
    }

    // Send email using existing EmailOtp email route logic is not reusable here; implement minimal sender
    // Use the same nodemailer env vars as emailOtp.js
    const nodemailer = require("nodemailer");
    const { OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS } = process.env;

    if (!OTP_EMAIL_HOST || !OTP_EMAIL_PORT || !OTP_EMAIL_USER || !OTP_EMAIL_PASS) {
      throw new Error(
        "Email not configured. Set OTP_EMAIL_HOST, OTP_EMAIL_PORT, OTP_EMAIL_USER, OTP_EMAIL_PASS in backend/.env"
      );
    }

    const transporter = nodemailer.createTransport({
      host: OTP_EMAIL_HOST,
      port: Number(OTP_EMAIL_PORT),
      secure: Number(OTP_EMAIL_PORT) === 465,
      auth: { user: OTP_EMAIL_USER, pass: OTP_EMAIL_PASS },
    });

    await transporter.sendMail({
      from: OTP_EMAIL_USER,
      to: studentEmail,
      subject: "Verify your Premium Resume",
      text: `Your Premium Resume OTP is:\n\n${otp}\n\nThis OTP is valid for 5 minutes.\nDo not share it with anyone.`,
    });

    // frontend expects expiresAt
    return res.status(200).json({ ok: true, expiresAt });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "OTP send failed" });
  }
});

router.post("/verify-otp-and-create-order", authRequired, async (req, res) => {
  try {
    const { studentId, email, otp } = req.body || {};
    if (!validateStudentId(studentId)) {
      return res.status(400).json({ error: "studentId is required" });
    }
    if (!email || typeof email !== "string") return res.status(400).json({ error: "email is required" });
    if (typeof otp !== "string") return res.status(400).json({ error: "otp is required" });

    const studentEmail = email;
    const record = await EmailOtp.findOne({ email: studentEmail });

    if (!record) {
      return res.status(400).json({ error: "OTP not found. Please request a new one." });
    }

    if (record.verified) {
      return res.status(400).json({ error: "OTP already verified" });
    }

    const now = new Date();
    if (!record.expiresAt || record.expiresAt < now) {
      await EmailOtp.deleteOne({ email: studentEmail });
      return res.status(400).json({ error: "OTP expired. Please request a new one." });
    }

    // Max 5 attempts
    record.attempts = Number(record.attempts || 0) + 1;
    await record.save();

    if (!isWithinAttempts(record, 5)) {
      await EmailOtp.deleteOne({ email: studentEmail });
      return res.status(400).json({ error: "Maximum OTP attempts reached. Please request a new OTP." });
    }

    const otpHash = crypto.createHash("sha256").update(String(otp)).digest("hex");
    if (String(record.otp) !== String(otpHash)) {
      // keep record until expiry; frontend can retry
      return res.status(400).json({ error: "Invalid OTP" });
    }

    // Mark verified but do NOT delete immediately; payment creation can follow immediately
    record.verified = true;
    record.verifiedAt = new Date();
    await record.save();

    // Create Razorpay order for ₹50
    const { client, keyId } = getRazorpayClient();

    const amount = 50;
    const currency = "INR";
    const orderAmountPaise = amountToPaise(amount);

    // Ensure idempotency: if a previous order exists in Resume, reuse? simplest create new.
    const order = await client.orders.create({
      amount: orderAmountPaise,
      currency,
      receipt: `resume_${studentId}_${Date.now()}`,
      payment_capture: 1,
    });

    // Store orderId on Resume as pending
    await Resume.findOneAndUpdate(
      { studentId },
      {
        premiumResumePayment: {
          status: "otp_verified_pending_payment",
          razorpay_order_id: order.id,
          razorpay_payment_id: "",
          razorpay_signature: "",
          updatedAt: new Date(),
          // Note: resume generation unlocked after verify-payment step.
        },
        // Keep a lightweight marker
        otpVerified: true,
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      ok: true,
      razorpayKeyId: keyId,
      orderId: order.id,
      amount,
      currency,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "OTP verify failed" });
  }
});

router.post("/verify-payment-and-generate", authRequired, async (req, res) => {
  try {
    const { studentId, razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body || {};

    if (!validateStudentId(studentId)) return res.status(400).json({ error: "studentId is required" });
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ error: "Missing payment fields" });
    }

    const razorpaySecret = requireEnv("RAZORPAY_KEY_SECRET");
    const expected = hmacSha256Hex(razorpaySecret, `${razorpay_order_id}|${razorpay_payment_id}`);

    if (expected !== razorpay_signature) {
      return res.status(400).json({ error: "Invalid Razorpay signature" });
    }

    // Generate PDF
    const resumeRecord = await Resume.findOne({ studentId });
    if (!resumeRecord) return res.status(404).json({ error: "Resume draft not found" });
    if (!resumeRecord.otpVerified) return res.status(403).json({ error: "OTP not verified" });

    const resumeData = resumeRecord.resume_json || resumeRecord.resumeData || {};
    const photoUrl = resumeRecord.photoUrl || "";

    // Choose template: if frontend sends it inside _raw use it; default "Modern Blue"
    const templateName =
      (resumeData && resumeData.templateName) ||
      (resumeData && resumeData._raw && resumeData._raw.templateName) ||
      "Modern Blue";

    // Output path
    const pdfDir = path.join(__dirname, "..", "uploads", "resumes");
    fs.mkdirSync(pdfDir, { recursive: true });
    const fileName = `${studentId}_${Date.now()}_${String(templateName).replace(/\s+/g, "-").toLowerCase()}.pdf`;
    const outputFilePath = path.join(pdfDir, fileName);

    // Note: current resumePdf service is minimal; templates will be improved later.
    await generateResumePdf({
      resumeData,
      photoUrl: photoUrl,
      outputFilePath,
      templateName, // ignored by current impl but kept for extensibility
    });

    const pdfPath = `/uploads/resumes/${fileName}`;

    // Mark payment success and store PDF path + resume JSON
    await Resume.findOneAndUpdate(
      { studentId },
      {
        pdf_path: pdfPath,
        pdfUrl: pdfPath,
        template_name: templateName,
        resume_json: resumeData,
        resumeData: resumeData,
        resume_generated: true,
        updatedAt: new Date(),
        premiumActive: true,
        premiumActivatedAt: new Date(),
        premiumOrderId: razorpay_order_id,
        premiumPaymentId: razorpay_payment_id,
        premiumSignature: razorpay_signature,
        premiumPaymentTimestamp: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      ok: true,
      pdfUrl: pdfPath,
      templateUsed: templateName,
      generatedAt: nowIso(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Payment verify/generate failed" });
  }
});

module.exports = router;
