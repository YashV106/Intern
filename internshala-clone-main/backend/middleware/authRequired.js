const jwt = require("jsonwebtoken");

module.exports = function authRequired(req, res, next) {
  try {
    const header = req.headers["authorization"] || "";
    const token = String(header).startsWith("Bearer ")
      ? String(header).slice("Bearer ".length)
      : null;

    if (!token) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { userId, email }
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
