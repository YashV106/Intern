const mongoose = require("mongoose");

const LikeSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: "Post", index: true, required: true },
  user_id: { type: String, index: true, required: true },
  created_at: { type: Date, default: Date.now },
});

LikeSchema.index({ post_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("Like", LikeSchema);

