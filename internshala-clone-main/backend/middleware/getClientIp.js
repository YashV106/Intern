module.exports = function getClientIp(req, _res, next) {
  const xForwardedFor = req.headers["x-forwarded-for"];
  if (typeof xForwardedFor === "string" && xForwardedFor.length > 0) {
    // x-forwarded-for can be a comma separated list; take the first
    req.clientIp = xForwardedFor.split(",")[0].trim();
    return next();
  }

  // Fallback
  const ip =
    req.socket?.remoteAddress ||
    req.connection?.remoteAddress ||
    (req.connection && req.connection.socket && req.connection.socket.remoteAddress) ||
    null;

  req.clientIp = ip;
  next();
};
