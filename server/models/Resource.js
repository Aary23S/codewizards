const mongoose = require("mongoose");

const resourceSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    url: { type: String, required: true },
    category: { type: String, enum: ["PDF", "GitHub", "YouTube", "Docs", "Other"], default: "Other" },
    domain: String,
    description: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Resource", resourceSchema);