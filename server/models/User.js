const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ["student", "senior", "alumni", "admin"],
      default: "student",
    },
    batch: Number,                  // Graduation year e.g. 2026
    domain: [String],               // ["Web", "AI", "Flutter"]
    bio: String,
    imageUrl: String,               // Cloudinary
    isMentor: { type: Boolean, default: false },

    // Social / platform links
    linkedin: String,
    github: String,
    leetcode: String,
    codeforces: String,
    portfolio: String,
  },
  { timestamps: true }
);

// Hash password before saving — runs automatically on save()
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// Compare entered password with hashed one
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);