const mongoose = require("mongoose");

const mentorshipSchema = new mongoose.Schema(
  {
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    mentorId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    requestId: { type: mongoose.Schema.Types.ObjectId, ref: "MentorshipRequest", required: true },
    status: { type: String, enum: ["active", "ended"], default: "active" },
    startedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate active mentorships between the same student and mentor
mentorshipSchema.index({ studentId: 1, mentorId: 1, status: 1 }, { unique: true });

module.exports = mongoose.model("Mentorship", mentorshipSchema);
