const User = require("../models/User");
const PointLedger = require("../models/PointLedger");
const { computeStudentPoints } = require("../utils/pointsEngine");

// GET /api/v1/leaderboard?period=all|month
const getLeaderboard = async (req, res) => {
  try {
    const period = req.query.period === "month" ? "month" : "all";
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-06"

    const students = await User.find({ role: "student" }).select("-password");

    const results = await Promise.all(
      students.map(async (student) => {
        const ledgerFilter = { student: student._id };
        if (period === "month") ledgerFilter.month = currentMonth;

        const ledgerEntries = await PointLedger.find(ledgerFilter);
        const { total, breakdown } = await computeStudentPoints(student, ledgerEntries);

        return {
          _id: student._id,
          name: student.name,
          batch: student.batch,
          domain: student.domain,
          points: total,
          breakdown,
        };
      })
    );

    results.sort((a, b) => b.points - a.points);
    res.json({ success: true, data: results });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getLeaderboard };