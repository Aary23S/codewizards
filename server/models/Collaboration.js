// codewizards/server/models/Collaboration.js
const mongoose = require("mongoose");

const RepresentativeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, required: true },
  avatar: { type: String },
  avatarColor: { type: String, default: "from-blue-400 to-indigo-600" },
});

const CollaborationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    type: { type: String, required: true },
    description: { type: String, required: true },
    website: { type: String, required: true },
    logoText: { type: String, required: true },
    representatives: { type: [RepresentativeSchema], default: [] },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Collaboration", CollaborationSchema);
