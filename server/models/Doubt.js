const mongoose = require("mongoose");

const replySchema = new mongoose.Schema(
  {
    body: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const doubtSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    body: { type: String, required: true },
    domain: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    replies: [replySchema],
    resolved: { type: Boolean, default: false },
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Doubt", doubtSchema);