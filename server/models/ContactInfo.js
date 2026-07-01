const mongoose = require("mongoose");

const contactInfoSchema = new mongoose.Schema(
  {
    email: String,
    location: String,
    department: String,
    github: String,
    linkedin: String,
    instagram: String,
    twitter: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("ContactInfo", contactInfoSchema);