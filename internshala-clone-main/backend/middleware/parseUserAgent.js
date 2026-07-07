const UAParser = require("ua-parser-js");

function classifyDevice(ua) {
  const s = (ua || "").toLowerCase();
  // Very light heuristic; deviceType is determined on the server from UA string.
  if (
    s.includes("mobile") ||
    s.includes("iphone") ||
    s.includes("ipad") ||
    s.includes("android") ||
    s.includes("android ") ||
    s.includes("windows phone")
  ) {
    return "mobile";
  }
  return "desktop"; // Will be refined by ua-parser when possible
}

function normalizeDeviceType(deviceType) {
  if (!deviceType) return null;
  const dt = String(deviceType).toLowerCase();
  if (dt.includes("mobile")) return "mobile";
  if (dt.includes("tablet")) return "mobile";
  if (dt.includes("laptop") || dt.includes("notebook")) return "laptop";
  return "desktop";
}

module.exports = function parseUserAgent(req, _res, next) {
  const uaString = req.headers["user-agent"] || "";
  const parser = new UAParser(uaString);
  const result = parser.getResult();

  const browserFamily = result?.ua?.browser?.name || result?.browser?.name || null;
  const browserType = browserFamily ? String(browserFamily) : null;

  const operatingSystem = result?.os?.name ? String(result.os.name) : null;

  let deviceType = normalizeDeviceType(result?.device?.type) || classifyDevice(uaString);
  if (deviceType !== "mobile" && deviceType !== "desktop" && deviceType !== "laptop") {
    deviceType = "desktop";
  }

  req.parsedUserAgent = {
    browserType,
    operatingSystem,
    deviceType,
  };

  next();
};
