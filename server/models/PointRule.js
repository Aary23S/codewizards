const mongoose = require("mongoose");

// A single tier/bracket within a rule (e.g. "Specialist: 1400-1599 rating = 50 pts")
const tierSchema = new mongoose.Schema({
    label: { type: String, required: true },       // "Specialist"
    min: { type: Number, required: true },          // 1400
    max: { type: Number, default: null },           // 1599, null = no upper bound
    points: { type: Number, required: true },       // 50
});

const pointRuleSchema = new mongoose.Schema(
    {
        key: {
            type: String,
            required: true,
            unique: true,
            enum: [
                "doubt_answered", "doubt_resolved", "event_attended",
                "project_posted", "seminar_attended", "hackathon_participation",
                "contest_participation",
                "codeforces_rating", "leetcode_solve_score", "github_contributions",
            ],
        },
        label: { type: String, required: true },       // "Hackathon Participation"
        type: { type: String, enum: ["flat", "tiered"], required: true },
        flatPoints: { type: Number, default: 0 },       // used when type === "flat"
        tiers: [tierSchema],                             // used when type === "tiered"
    },
    { timestamps: true }
);

module.exports = mongoose.model("PointRule", pointRuleSchema);