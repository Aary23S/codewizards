const mongoose = require("mongoose");

const pointLedgerSchema = new mongoose.Schema(
  {
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    ruleKey: { type: String, required: true },      // matches PointRule.key
    sourceType: { type: String, enum: ["in_house", "external"], required: true },
    sourceId: { type: mongoose.Schema.Types.ObjectId, default: null }, // e.g. the Doubt._id, Event._id
    rawValue: { type: Number, default: null },        // e.g. codeforces rating at sync time, for re-tiering
    month: { type: String, required: true },          // "2026-06" — for monthly leaderboard bucketing
  },
  { timestamps: true }
);

// Prevent double-counting the same action (e.g. same doubt resolved twice)
pointLedgerSchema.index({ student: 1, ruleKey: 1, sourceId: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model("PointLedger", pointLedgerSchema);