const express = require("express");
const router = express.Router();
const application = require("../Model/Application");

router.post("/", async (req, res) => {
  try {
    const Premium = require("../Model/Premium");
    const Resume = require("../Model/Resume");
    const { currentIstMonthKey } = require("./istTime");

    const studentId =
      req.body.studentId ||
      (req.body.user && (req.body.user.studentId || req.body.user.id)) ||
      (req.body.user && req.body.user._id) ||
      "";

    if (!studentId) {
      return res.status(400).json({ error: "studentId is required" });
    }

    const monthKey = currentIstMonthKey();

    const subscription = await Premium.findOne({ studentId });

    // Lazy reset when month changes
    let applicationsPerMonth = subscription ? subscription.applicationsPerMonth : 1;
    let usageCount = subscription ? subscription.usageCount || 0 : 0;

    if (!subscription || subscription.monthKey !== monthKey) {
      applicationsPerMonth = subscription ? subscription.applicationsPerMonth : 1;
      usageCount = 0;
      // reset usageCount for current month (if record exists)
      if (subscription) {
        await Premium.findOneAndUpdate(
          { studentId },
          { $set: { monthKey, usageCount: 0 } },
          { new: true }
        );
      }
    }

    const plan = subscription?.plan || "free";

    const isUnlimited = applicationsPerMonth === -1;
    if (!isUnlimited && usageCount >= applicationsPerMonth) {
      const remaining = 0;
      return res.status(403).json({
        error: `Monthly application quota exhausted for plan. Allowed: ${applicationsPerMonth} per month.`,
        plan,
        monthKey,
        applicationsUsed: usageCount,
        applicationsRemaining: remaining,
        applicationsPerMonth,
      });
    }

    // Attach PREMIUM generated resume (PDF) only
    const resumeRecord = await Resume.findOne({ studentId }).sort({ createdAt: -1 });
    if (
      !resumeRecord ||
      resumeRecord.premiumActive !== true ||
      !resumeRecord.pdfUrl
    ) {
      return res.status(403).json({
        error: "Please generate your Premium Resume before applying.",
      });
    }

    const applicationipdata = new application({
      company: req.body.company,
      category: req.body.category,
      coverLetter: req.body.coverLetter,
      user: req.body.user,
      Application: req.body.Application,
      body: req.body.body,
      studentId,

      // Premium Resume attachment for recruiters
      resumeUrl: resumeRecord.pdfUrl,
      resumePhotoUrl: resumeRecord.photoUrl,
      resumeUpdatedAt: resumeRecord.pdfGeneratedAt || resumeRecord.updatedAt,
    });













    const saved = await applicationipdata.save();

    // increment usage for this IST month
    await Premium.findOneAndUpdate(
      { studentId },
      {
        $set: {
          monthKey,
          plan: subscription && subscription.plan ? subscription.plan : "free",
          status: subscription && subscription.status ? subscription.status : "active",
        },
        $inc: { usageCount: isUnlimited ? 0 : 1 },
        $setOnInsert: {
          applicationsPerMonth: applicationsPerMonth === undefined ? 1 : applicationsPerMonth,
        },
      },
      { upsert: true, new: true }
    );

    return res.status(200).send(saved);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "internal server error" });
  }
});

router.get("/", async (req, res) => {
  try {
    const data = await application.find();
    res.json(data).status(200);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});
router.get("/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const data = await application.findById(id);
    if (!data) {
      res.status(404).json({ error: "application not found" });
    }
    res.json(data).status(200);
  } catch (error) {
    console.log(error);
    res.status(404).json({ error: "internal server error" });
  }
});
router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { action } = req.body;
  let status;
  if (action === "accepted") {
    status = "accepted";
  } else if (action === "rejected") {
    status = "rejected";
  } else {
    res.status(404).json({ error: "Invalid action" });
    return;
  }
  try {
    const updateapplication = await application.findByIdAndUpdate(
      id,
      { $set: { status } },
      { new: true }
    );
    if (!updateapplication) {
      res.status(404).json({ error: "Not able to update the application" });
      return;
    }
    res.status(200).json({ sucess: true, data: updateapplication });
  } catch (error) {
    res.status(500).json({ error: "internal server error" });
  }
});
module.exports = router;
