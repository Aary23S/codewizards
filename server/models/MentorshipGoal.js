const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date }
});

const mentorshipGoalSchema = new mongoose.Schema(
  {
    mentorshipId: { type: mongoose.Schema.Types.ObjectId, ref: "Mentorship", required: true },
    title: { type: String, required: true },
    description: { type: String },
    tasks: [taskSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("MentorshipGoal", mentorshipGoalSchema);
