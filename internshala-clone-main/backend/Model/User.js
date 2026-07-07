const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    index: true,
    unique: true,
    default: null,
  },
  phone: {
    type: String,
    index: true,
    unique: true,
    default: null,
  },
  // For this semester feature we store the latest generated password directly.
  // In a production system you must store hashes instead.
  password: {
    type: String,
    default: "",
  },
  lastPasswordResetAt: {
    type: Date,
    default: null,
  },
});

module.exports = mongoose.model("User", UserSchema);

