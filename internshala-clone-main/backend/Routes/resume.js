const express = require("express");
const router = express.Router();

const Resume = require("../Model/Resume");
const Premium = require("../Model/Premium");

function nowIso() {
  return new Date().toISOString();
}

function validateRequiredString(value, name) {
  if (typeof value !== "string" || value.trim().length === 0) {
    throw new Error(`${name} is required`);
  }
}

// This route stores the resume data and returns stored resumeUrl.
// PDF generation in this codebase will be incremental: we keep the ATS-friendly
// content as resumeData; PDF generation can be plugged in later if/when
// a PDF tool is added.
router.post("/create", async (req, res) => {
  try {
    const { studentId, resumeData, photoUrl, resumeUrl } = req.body;

    if (!studentId) return res.status(400).json({ error: "studentId is required" });
    if (!resumeData || typeof resumeData !== "object") {
      return res.status(400).json({ error: "resumeData is required" });
    }

    // Premium check (resume creation requires premium per spec)
    const premium = await Premium.findOne({ studentId });
    if (!premium || premium.status !== "active") {
      return res.status(403).json({ error: "Premium is required" });
    }

    const updated = await Resume.findOneAndUpdate(
      { studentId },
      {
        resumeData,
        photoUrl: photoUrl || "",
        resumeUrl: resumeUrl || "",
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      ok: true,
      resumeUrl: updated.resumeUrl,
      createdAt: updated.createdAt,
      updatedAt: updated.updatedAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Resume create failed" });
  }
});

// Generate an ATS-friendly single-column resume (PDF placeholder).
// If PDF generation library is later added, this route is the correct place.
router.post("/generate", async (req, res) => {
  try {
    const { studentId, resumeData, photoUrl } = req.body;

    if (!studentId) return res.status(400).json({ error: "studentId is required" });
    if (!resumeData || typeof resumeData !== "object") {
      return res.status(400).json({ error: "resumeData is required" });
    }

    const premium = await Premium.findOne({ studentId });
    if (!premium || premium.status !== "active") {
      return res.status(403).json({ error: "Premium is required" });
    }

    // Minimal placeholder resumeUrl: client can still preview using resumeData.
    // For now we store empty url; PDF generation integration can be done later.
    const created = await Resume.findOneAndUpdate(
      { studentId },
      {
        resumeData,
        photoUrl: photoUrl || "",
        resumeUrl: "",
        updatedAt: new Date(),
      },
      { upsert: true, new: true }
    );

    return res.status(200).json({
      ok: true,
      resumeUrl: created.resumeUrl,
      generatedAt: nowIso(),
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Resume generation failed" });
  }
});

router.get("/latest", async (req, res) => {
  try {
    const { studentId } = req.query;
    if (!studentId) return res.status(400).json({ error: "studentId is required" });

    const record = await Resume.findOne({ studentId }).sort({ createdAt: -1 });
    if (!record) {
      return res.status(200).json({ resumeExists: false });
    }

    return res.status(200).json({
      resumeExists: true,
      resumeUrl: record.resumeUrl,
      photoUrl: record.photoUrl,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: err.message || "Failed to fetch latest resume" });
  }
});

module.exports = router;

