// user.js
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
    programName: { type: String, default: "" },
    programDurationYears: { type: Number, default: 4 },
    domain: [String],               // ["Web", "AI", "Flutter"]
    bio: String,
    imageUrl: String,               // Cloudinary
    isMentor: { type: Boolean, default: false },

    currentCompany: { type: String, default: "" },
    designation: { type: String, default: "" },
    professionalExperience: { type: String, default: "" },
    
    // Phase 1 Professional fields
    location: { type: String, default: "" },
    headline: { type: String, default: "" },
    isVerified: { type: Boolean, default: false },
    employmentType: { type: String, default: "" },
    workMode: { type: String, default: "" },
    startDateText: { type: String, default: "" },
    canHelpWith: [String],
    mentorshipAvailability: { type: String, enum: ["open", "limited", "unavailable"], default: "open" },
    maxActiveStudents: { type: Number, default: 3 },
    typicalResponseTime: { type: String, default: "1-3 days" },
    preferredContactMethod: { type: String, default: "linkedin" },

    // LinkedIn-Style Subsections
    experiences: [
      {
        title: { type: String, default: "" },
        company: { type: String, default: "" },
        location: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" },
        description: { type: String, default: "" }
      }
    ],
    education: [
      {
        school: { type: String, default: "" },
        degree: { type: String, default: "" },
        fieldOfStudy: { type: String, default: "" },
        startDate: { type: String, default: "" },
        endDate: { type: String, default: "" }
      }
    ],
    certifications: [
      {
        name: { type: String, default: "" },
        issuer: { type: String, default: "" },
        issueDate: { type: String, default: "" },
        credentialUrl: { type: String, default: "" }
      }
    ],

    // Social / platform links
    linkedin: String,
    github: String,
    leetcode: String,
    codeforces: String,
    portfolio: String,

    codeforcesHandle: String,
    leetcodeUsername: String,
    githubUsername: String,

    phone: { type: String, default: "" },
    whatsapp: { type: String, default: "" },
    discord: { type: String, default: "" },
    contactPreferences: {
      email: { type: Boolean, default: true },
      phone: { type: Boolean, default: false },
      whatsapp: { type: Boolean, default: false },
      discord: { type: Boolean, default: false },
    },

    isSuspended: { type: Boolean, default: false },
    suspendedReason: { type: String, default: "" },

    resetPasswordToken: { type: String, select: false },
    resetPasswordExpire: { type: Date, select: false },
    // Bumped on password reset / logout-everywhere so previously issued JWTs stop working
    tokenVersion: { type: Number, default: 0, select: false },

    externalStats: {
      codeforcesRating: { type: Number, default: null },
      leetcodeSolveScore: { type: Number, default: null }, // easy*1 + medium*3 + hard*5
      githubContributions: { type: Number, default: null },
      lastSynced: { type: Date, default: null },
    },
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
