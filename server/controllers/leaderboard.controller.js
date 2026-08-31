//leaderboard.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const User = require("../models/User");
const PointLedger = require("../models/PointLedger");
const { computeStudentPoints, buildRuleMap } = require("../utils/pointsEngine");

// GET /api/v1/leaderboard?period=all|month
const getLeaderboard = async (req, res) => {
  try {
    const period = req.query.period === "month" ? "month" : "all";
    const currentMonth = new Date().toISOString().slice(0, 7); // "2026-06"

    const students = await User.find({ role: "student" }).select("-password").lean();
    const studentIds = students.map((s) => s._id);

    const ledgerFilter = { student: { $in: studentIds } };
    if (period === "month") ledgerFilter.month = currentMonth;

    // One query for every student's ledger entries + one for the rules, instead of 2 per student
    const [allLedgerEntries, ruleMap] = await Promise.all([
      PointLedger.find(ledgerFilter).lean(),
      buildRuleMap(),
    ]);

    const ledgerByStudent = {};
    for (const entry of allLedgerEntries) {
      const key = entry.student.toString();
      (ledgerByStudent[key] ||= []).push(entry);
    }

    const results = await Promise.all(
      students.map(async (student) => {
        const ledgerEntries = ledgerByStudent[student._id.toString()] || [];
        const { total, breakdown } = await computeStudentPoints(student, ledgerEntries, ruleMap);

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
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = { getLeaderboard };