const express = require("express");
const router = express.Router();

const UAHistory = require("../../Model/LoginHistory");
const authRequired = require("../../middleware/authRequired");

router.get("/login-history", authRequired, async (req, res) => {
  try {
    const userId = req.user?.userId;
    if (!userId) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const page = Math.max(1, Number(req.query.page || 1));
    const pageSize = Math.min(50, Math.max(1, Number(req.query.pageSize || 10)));

    const filter = { userId };

    const [total, items] = await Promise.all([
      UAHistory.countDocuments(filter),
      UAHistory.find(filter)
        .sort({ timestamp: -1 })
        .skip((page - 1) * pageSize)
        .limit(pageSize)
        .lean(),
    ]);

    return res.status(200).json({
      page,
      pageSize,
      total,
      items,
    });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ error: "Failed to fetch login history" });
  }
});

module.exports = router;
