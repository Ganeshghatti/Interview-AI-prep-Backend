const mongoose = require("mongoose");

const InterviewPrepSchema = new mongoose.Schema({
  jobRoleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "JobRole",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  difficulty: {
    type: String,
    required: true,
    enum: ["Easy", "Medium", "Hard"],
  },
  duration: {
    type: Number,
    required: true, // Duration in minutes
    enum: [5, 10, 15],
  },
  conversation: [Object],
  analytics: {
    type: Object,
    default: {},
  },
  status: {
    type: String,
    required: true,
    enum: ["in-progress", "completed", "failed"],
    default: "in-progress",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  startTime: {
    type: Date,
    default: Date.now,
  },
  endTime: {
    type: Date,
    default: null,
  },
});
module.exports = mongoose.model("InterviewPrep", InterviewPrepSchema);
