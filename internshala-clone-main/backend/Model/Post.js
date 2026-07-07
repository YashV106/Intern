const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  user_id: { type: String, index: true, required: true },
  username: { type: String, default: "" },
  photo: { type: String, default: "" },

  caption: { type: String, default: "" },
  media_url: { type: String, default: "" },
  media_type: {
    type: String,
    enum: ["image", "video", ""],
    default: "",
  },

  created_at: { type: Date, default: Date.now, index: true },
});

module.exports = mongoose.model("Post", PostSchema);

