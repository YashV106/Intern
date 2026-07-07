const mongoose = require("mongoose");
const Applicationipschema = new mongoose.Schema({
  company: String,
  category: String,
  coverLetter: String,
  user: Object,
  // normalized applicant id for quota enforcement
  studentId: {
    type: String,
    index: true,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: ["accepted", "pending", "rejected"],
    default: "pending",
  },
  Application: Object,

  // Premium Resume attachment (auto-attached on apply)
  resumeUrl: {
    type: String,
    default: "",
  },
  resumePhotoUrl: {
    type: String,
    default: "",
  },
  resumeUpdatedAt: {
    type: Date,
    default: null,
  },
});
module.exports = mongoose.model("Application", Applicationipschema);

