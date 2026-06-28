const mongoose = require("mongoose");

const gallerySchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },  // Cloudinary URL
    category: {
      type: String,
      enum: ["event", "poster", "team", "other"],
      default: "event",
    },
    eventRef: String,   // Just a label like "Web Dev Workshop 2024"
  },
  { timestamps: true }
);

module.exports = mongoose.model("Gallery", gallerySchema);