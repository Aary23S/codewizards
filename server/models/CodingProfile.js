// codingProfile.js
const mongoose = require("mongoose");

const submissionSchema = new mongoose.Schema(
  {
    title: { type: String, default: "" },
    titleSlug: { type: String, default: "" },
    problem: { type: String, default: "" },
    contestName: { type: String, default: "" },
    verdict: { type: String, default: "" },
    language: { type: String, default: "" },
    url: { type: String, default: "" },
    solvedAt: { type: Date, default: null },
  },
  { _id: false }
);

const contestSchema = new mongoose.Schema(
  {
    contestId: { type: Number, default: null },
    contestName: { type: String, default: "" },
    oldRating: { type: Number, default: null },
    newRating: { type: Number, default: null },
    rank: { type: Number, default: null },
    ratingUpdateTimeSeconds: { type: Number, default: null },
  },
  { _id: false }
);

const codingProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      unique: true,
      index: true,
      required: true,
    },
    leetcodeUsername: { type: String, default: "" },
    codeforcesHandle: { type: String, default: "" },
    githubUsername: { type: String, default: "" },
    leetcode: {
      totalSolved: { type: Number, default: null },
      easySolved: { type: Number, default: null },
      mediumSolved: { type: Number, default: null },
      hardSolved: { type: Number, default: null },
      ranking: { type: Number, default: null },
      recentSubmissions: { type: [submissionSchema], default: [] },
      lastSyncedAt: { type: Date, default: null },
      verified: { type: Boolean, default: false },
      error: { type: String, default: "" },
    },
    codeforces: {
      handle: { type: String, default: "" },
      rating: { type: Number, default: null },
      maxRating: { type: Number, default: null },
      rank: { type: String, default: "" },
      maxRank: { type: String, default: "" },
      solvedCount: { type: Number, default: null },
      recentSubmissions: { type: [submissionSchema], default: [] },
      contestHistory: { type: [contestSchema], default: [] },
      lastSyncedAt: { type: Date, default: null },
      verified: { type: Boolean, default: false },
      error: { type: String, default: "" },
    },
    github: {
      username: { type: String, default: "" },
      contributions: { type: Number, default: null },
      projects: { type: Number, default: null },
      followers: { type: Number, default: null },
      following: { type: Number, default: null },
      publicRepos: { type: Number, default: null },
      recentActivity: { type: [submissionSchema], default: [] },
      lastSyncedAt: { type: Date, default: null },
      verified: { type: Boolean, default: false },
      error: { type: String, default: "" },
    },
    lastManualSyncAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("CodingProfile", codingProfileSchema);
