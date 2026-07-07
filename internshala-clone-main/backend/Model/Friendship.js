const mongoose = require("mongoose");

const FriendshipSchema = new mongoose.Schema({
  requesterId: { type: String, index: true, required: true },
  accepterId: { type: String, index: true, required: true },

  status: {
    type: String,
    enum: ["pending", "accepted", "blocked"],
    default: "pending",
    index: true,
  },

  created_at: { type: Date, default: Date.now, index: true },
  approved_at: { type: Date, default: null },
});

// Prevent duplicates for the same directed pair
FriendshipSchema.index({ requesterId: 1, accepterId: 1 }, { unique: true });

module.exports = mongoose.model("Friendship", FriendshipSchema);
