const mongoose = require("mongoose");

const opportunitySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    company: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["internship", "job", "freelance", "open_source"],
      default: "internship",
    },
    domain: String,                    // "Web", "AI", etc.
    description: String,
    applyLink: { type: String, required: true },
    deadline: Date,
    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Opportunity", opportunitySchema);