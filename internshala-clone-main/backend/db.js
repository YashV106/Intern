const mongoose = require("mongoose");
require("dotenv").config();

const database = process.env.DATABASE_URL;

let isDbConnected = false;

// Avoid Mongoose buffering timeouts when DB isn't available
mongoose.set("bufferCommands", false);

module.exports.connect = async () => {
  if (!database || typeof database !== "string") {
    console.warn("DATABASE_URL is not set. Backend will start without DB connection.");
    isDbConnected = false;
    return;
  }

  try {
    await mongoose.connect(database);
    isDbConnected = true;
    console.log("Database is connected");
  } catch (err) {
    isDbConnected = false;
    console.error("DB connection error:", err);
  }
};

module.exports.isDbConnected = () => isDbConnected;

