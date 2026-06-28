const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    important: { type: Boolean, default: false },  // pinned/highlighted
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);