const mongoose = require("mongoose");

const eventSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ["workshop", "hackathon", "contest", "seminar", "other"],
      default: "other",
    },
    description: String,
    date: { type: Date, required: true },
    venue: String,
    imageUrl: String,                 // Cloudinary
    registrationLink: String,         // External form link for now
    status: {
      type: String,
      enum: ["upcoming", "completed"],
      default: "upcoming",
    },
    featured: { type: Boolean, default: false },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Event", eventSchema);