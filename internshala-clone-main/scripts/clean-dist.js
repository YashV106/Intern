const fs = require("fs");
const path = require("path");

const distDir = path.join(__dirname, "..", "internarea", "dist");

function removeDirRecursive(targetPath) {
  if (!fs.existsSync(targetPath)) return;
  fs.rmSync(targetPath, { recursive: true, force: true });
}

removeDirRecursive(distDir);

console.log(`Cleaned dist directory: ${distDir}`);
