const mongoose = require("mongoose");

const teamMemberSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    role: { type: String, required: true },         // "Co-Founder", "Faculty Coordinator"
    category: {
      type: String,
      enum: ["founder", "faculty", "core", "mentor"],
      default: "core",
    },
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