const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true },         // "Co-Founder", "Faculty Coordinator"
    subtitle: { type: String, default: "" },        // "Computer Science & Engineering", "Batch 2026", etc.
    category: {
      type: String,
      enum: ["founder", "faculty", "core", "mentor"],
      default: "core",
    },
    teamYear: { type: Number, default: null },     // display year for annual teams
    batch: Number,
    domain: [String],
    imageUrl: String,
    linkedin: String,
    github: String,
    order: { type: Number, default: 0 },             // controls display order
  },
  { timestamps: true }
);

module.exports = mongoose.model("TeamMember", teamMemberSchema);
