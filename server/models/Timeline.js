const mongoose = require("mongoose");

const timelineSchema = new mongoose.Schema(
  {
    year: { type: Number, required: true },
    month: String,                    // "June" — optional, for precision
    title: { type: String, required: true, trim: true },
    description: String,
    imageUrl: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Timeline", timelineSchema);