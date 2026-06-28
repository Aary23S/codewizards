const mongoose = require("mongoose");

const mentorshipSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    message: { type: String, required: true },
    status: { type: String, enum: ["pending", "accepted", "rejected", "completed"], default: "pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorshipRequest", mentorshipSchema);