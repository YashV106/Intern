const mongoose = require("mongoose");

const CommentSchema = new mongoose.Schema({
  post_id: { type: mongoose.Schema.Types.ObjectId, ref: "Post", index: true, required: true },
  user_id: { type: String, index: true, required: true },
  username: { type: String, default: "" },
  created_at: { type: Date, default: Date.now, index: true },
  comment: { type: String, default: "" },
});

module.exports = mongoose.model("Comment", CommentSchema);

