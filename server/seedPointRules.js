const mongoose = require("mongoose");
const dotenv = require("dotenv");
const PointRule = require("./models/PointRule");

dotenv.config();

const defaultRules = [
    { key: "doubt_answered", label: "Doubt Answered", type: "flat", flatPoints: 5 },
    { key: "doubt_resolved", label: "Doubt Marked Resolved (your answer)", type: "flat", flatPoints: 15 },
    { key: "event_attended", label: "Event Attended", type: "flat", flatPoints: 10 },
    { key: "seminar_attended", label: "Seminar Attended", type: "flat", flatPoints: 10 },
    { key: "hackathon_participation", label: "Hackathon Participation", type: "flat", flatPoints: 50 },
    { key: "contest_participation", label: "Contest Participation", type: "flat", flatPoints: 35 },
    { key: "project_posted", label: "Project Posted", type: "flat", flatPoints: 20 },
    {
        key: "codeforces_rating", label: "Codeforces Rating", type: "tiered",
        tiers: [
            { label: "Newbie", min: 0, max: 1199, points: 10 },
            { label: "Pupil", min: 1200, max: 1399, points: 25 },
            { label: "Specialist", min: 1400, max: 1599, points: 50 },
            { label: "Expert", min: 1600, max: 1899, points: 100 },
            { label: "Master+", min: 1900, max: null, points: 200 },
        ],
    },
    {
        key: "leetcode_solve_score", label: "LeetCode Solve Score", type: "tiered",
        tiers: [
            { label: "Beginner", min: 0, max: 99, points: 10 },
            { label: "Active", min: 100, max: 299, points: 30 },
            { label: "Strong", min: 300, max: 599, points: 75 },
            { label: "Elite", min: 600, max: null, points: 150 },
        ],
    },
    {
        key: "github_contributions", label: "GitHub Contributions (past year)", type: "tiered",
        tiers: [
            { label: "Light", min: 0, max: 49, points: 10 },
            { label: "Regular", min: 50, max: 199, points: 30 },
            { label: "Active", min: 200, max: 499, points: 75 },
            { label: "Power User", min: 500, max: null, points: 150 },
        ],
    },
];

const seed = async () => {
    await mongoose.connect(process.env.MONGO_URI);
    await PointRule.deleteMany();
    await PointRule.insertMany(defaultRules);
    console.log("✅ Point rules seeded");
    process.exit();
};

seed().catch((err) => { console.error(err); process.exit(1); });