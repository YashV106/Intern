const mongoose = require("mongoose");
require("dotenv").config();

const normalizeMongoUri = (value) => {
  if (typeof value !== "string") return "";
  // Remove surrounding whitespace
  let v = value.trim();

  // Remove common accidental wrapping quotes
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    v = v.slice(1, -1).trim();
  }

  // Remove any hidden trailing spaces/newlines again
  return v.trim();
};

const envCandidates = {
  DATABASE_URL: normalizeMongoUri(process.env.DATABASE_URL),
  MONGODB_URI: normalizeMongoUri(process.env.MONGODB_URI),
  MONGO_URL: normalizeMongoUri(process.env.MONGO_URL),
};

const database =
  envCandidates.DATABASE_URL ||
  envCandidates.MONGODB_URI ||
  envCandidates.MONGO_URL ||
  "";

const detectUriMeta = (uri) => {
  const safe = typeof uri === "string" ? uri : "";
  const trimmed = safe.trim();
  const scheme = trimmed.startsWith("mongodb+srv://")
    ? "mongodb+srv://"
    : trimmed.startsWith("mongodb://")
      ? "mongodb://"
      : trimmed.startsWith("mongodb+srv:")
        ? "mongodb+srv:"
        : trimmed.startsWith("mongodb:")
          ? "mongodb:"
          : "unknown";

  // Mask credentials: mongodb(s)://user:pass@host/...
  // Keep only host:port and/or db name (no user/pass).
  let maskedHost = "";
  try {
    const withoutScheme = trimmed.replace(/^mongodb\+srv:\/\//, "").replace(/^mongodb:\/\//, "");
    const afterAt = withoutScheme.includes("@") ? withoutScheme.split("@").slice(1).join("@") : withoutScheme;
    maskedHost = afterAt.split("/")[0];
  } catch {
    maskedHost = "";
  }

  return { scheme, maskedHost };
};

const activeEnvVar =
  envCandidates.DATABASE_URL
    ? "DATABASE_URL"
    : envCandidates.MONGODB_URI
      ? "MONGODB_URI"
      : envCandidates.MONGO_URL
        ? "MONGO_URL"
        : "MISSING";

const { scheme: detectedScheme, maskedHost: detectedMaskedHost } = detectUriMeta(database);

// Avoid logging full URI credentials
if (!database) {
  console.warn("MongoDB URI is not set. Expected DATABASE_URL (or MONGODB_URI / MONGO_URL).");
} else {
  console.log(
    `MongoDB URI env: ${activeEnvVar}, scheme: ${detectedScheme}, host: ${detectedMaskedHost || "(unknown)"}`
  );
}

let isDbConnected = false;
let connectingPromise = null;

// Avoid Mongoose buffering timeouts when DB isn't available
mongoose.set("bufferCommands", false);

// Allow passing options later without rewriting the whole function
module.exports.connect = async () => {
  if (isDbConnected) return;

  if (!database || typeof database !== "string") {
    console.warn(
      "MongoDB URI is not set/invalid. Backend will start without DB connection. Expected DATABASE_URL (or MONGODB_URI / MONGO_URL)."
    );
    isDbConnected = false;
    return;
  }

  // Prevent multiple simultaneous connection attempts
  if (connectingPromise) {
    await connectingPromise;
    return;
  }

  connectingPromise = (async () => {
    try {
      // Use recommended options; harmless if ignored by current Mongoose
      await mongoose.connect(database, {
        autoIndex: false,
        serverSelectionTimeoutMS: 10000,
        // If Atlas requires TLS, this is typically fine; driver will use defaults when omitted.
        // tls: true,
      });

      isDbConnected = true;
      console.log("Database is connected");
    } catch (err) {
      isDbConnected = false;
      console.error("DB connection error:", err?.message || err);
      // If connect fails, allow future retry attempts
      throw err;
    } finally {
      connectingPromise = null;
    }
  })();

  await connectingPromise;
};

module.exports.isDbConnected = () => isDbConnected;
