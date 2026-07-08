const path = require("path");

module.exports.handler = async (event, context) => {
  // Standalone bundle copied into the publish root (dist/)
  const publishRoot = path.join(__dirname, "..", "..");
  const serverEntry = path.join(publishRoot, "server.js");

  let mod;
  try {
    mod = require(serverEntry);
  } catch (e) {
    console.error("Failed to require standalone server.js", e);
    return {
      statusCode: 500,
      body: "Server require failed: " + (e && e.message ? e.message : String(e)),
    };
  }

  // Netlify event shape differs; normalize URL.
  const method = event.httpMethod || "GET";
  const url = event.path || "/";
  const headers = event.headers || {};

  // If standalone exports a handler, use it.
  if (mod && typeof mod === "function") {
    return await mod({ method, url, headers }, {});
  }

  // If exports.handler exists, use it.
  if (mod && typeof mod.handler === "function") {
    return await mod.handler({ method, url, headers }, {});
  }

  // Fallback: standalone server.js in Next standalone often starts a server.
  // In that case, inform the user (this repo might need a different Netlify adapter).
  return {
    statusCode: 500,
    body:
      "Standalone server bootstrap not compatible with Netlify Functions in this setup. " +
      "Expected server.js to export a request handler.",
  };
};
