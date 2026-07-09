const jwt = require("jsonwebtoken");

/**
 * Admin-only auth.
 * This repo's admin frontend currently uses localStorage flags and backend admin auth is hardcoded.
 * This middleware supports optional admin JWT claims { role: "admin", isAdmin: true }.
 *
 * If the token doesn't have admin claims, access is denied.
 */
module.exports = function adminAuthRequired(req, res, next) {
  try {
    const header = req.headers["authorization"] || "";
    const token = String(header).startsWith("Bearer ")
      ? String(header).slice("Bearer ".length)
      : null;

    if (!token) return res.status(401).json({ error: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const role = decoded?.role;
    const isAdmin = decoded?.isAdmin;

    if (role !== "admin" && isAdmin !== true) {
      return res.status(403).json({ error: "Forbidden" });
    }

    req.admin = decoded;
    return next();
  } catch (err) {
    return res.status(401).json({ error: "Unauthorized" });
  }
};
