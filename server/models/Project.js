const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    techStack: [String],          // ["React", "Node", "MongoDB"]
    contributors: [String],       // Names for now; ObjectId refs in Phase 2
    githubUrl: String,
    demoUrl: String,
    imageUrl: String,             // Cloudinary URL
    featured: {
      type: Boolean,
      default: false,             // Featured projects show on Home page
    },
  },
  { timestamps: true }            // Adds createdAt, updatedAt automatically
);

module.exports = mongoose.model("Project", projectSchema);