const fs = require("fs");
const path = require("path");
const { spawnSync } = require("child_process");

function ensureDir(dir) {
  fs.mkdirSync(dir, { recursive: true });
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  const stat = fs.statSync(src);
  if (!stat.isDirectory()) throw new Error(`Expected directory: ${src}`);

  ensureDir(dest);
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else if (entry.isSymbolicLink()) {
      const link = fs.readlinkSync(srcPath);
      fs.symlinkSync(link, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

function copyFileSyncSafe(src, dest) {
  if (!fs.existsSync(src)) return;
  ensureDir(path.dirname(dest));
  fs.copyFileSync(src, dest);
}

const rootDir = path.join(__dirname, "..");
const nextAppDir = path.join(rootDir, "internarea");
const nextDistDir = path.join(nextAppDir, "dist");

const standaloneDir = path.join(nextAppDir, ".next", "standalone");
const staticDir = path.join(nextAppDir, ".next", "static");
const publicDir = path.join(nextAppDir, "public");

console.log("Building Netlify deployable dist…");

if (!fs.existsSync(standaloneDir)) {
  throw new Error(
    `Missing Next standalone output. Expected at: ${standaloneDir}\n` +
      `Run "npm --prefix ./internarea run build" first.`
  );
}

ensureDir(nextDistDir);

// 1) Copy Next standalone server bundle (includes server.js + required files)
copyDirSync(standaloneDir, nextDistDir);

// 2) Copy static assets
copyDirSync(staticDir, path.join(nextDistDir, ".next", "static"));

// 3) Copy public assets to dist (so Netlify can serve them as static)
copyDirSync(publicDir, path.join(nextDistDir, "public"));

// 4) Create Netlify Function bootstrap
const netlifyFunctionsDir = path.join(nextDistDir, ".netlify", "functions");
ensureDir(netlifyFunctionsDir);

const bootstrapPath = path.join(netlifyFunctionsDir, "server.js");

// Next standalone typically has server.js at dist/server.js after copy.
// We'll invoke it from the Function by forking a child process listening on the
// function's response cycle. Simpler pattern: require the standalone server.js
// which exports a handler in newer Next versions, but we can't assume.
// So we spin up a tiny Express wrapper that delegates to Next's standalone server.
// However standalone server.js already creates and listens; that doesn't fit well
// into Netlify Functions. Instead, use the server's exported handler if present.
// We'll implement robust loading: if module exports handler, use it; else fallback.

const functionCode = `const path = require("path");

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
`;

fs.writeFileSync(bootstrapPath, functionCode, "utf8");

console.log("Created Netlify Function bootstrap at:", bootstrapPath);

// Create a basic netlify redirects config (optional)
copyFileSyncSafe(
  path.join(nextAppDir, "next.config.ts"),
  path.join(nextDistDir, "next.config.ts.bak")
);

console.log("dist created at:", nextDistDir);
console.log("Publish directory for Netlify should be:", nextDistDir);
