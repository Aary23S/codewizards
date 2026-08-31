// codewizards/server/utils/pointsEngine.js
const PointRule = require("../models/PointRule");

// Given a rule and a raw value, find the matching tier and return its points
const resolveTierPoints = (rule, rawValue) => {
  if (rawValue == null) return 0;
  const tier = rule.tiers.find(
    (t) => rawValue >= t.min && (t.max === null || rawValue <= t.max)
  );
  return tier ? tier.points : 0;
};

// Fetch once and reuse across every student, instead of re-querying per student
const buildRuleMap = async () => {
  const rules = await PointRule.find();
  return Object.fromEntries(rules.map((r) => [r.key, r]));
};

// Compute total points for one student across all ledger entries + current external stats.
// Pass a pre-built map (via buildRuleMap) when scoring many students at once to avoid N+1 queries.
const computeStudentPoints = async (student, ledgerEntries, ruleMap) => {
  const map = ruleMap || (await buildRuleMap());

  let total = 0;
  const breakdown = {};

  // In-house actions from the ledger — flat points, current weight applied live
  for (const entry of ledgerEntries) {
    const rule = map[entry.ruleKey];
    if (!rule) continue;
    const pts = rule.type === "flat" ? rule.flatPoints : resolveTierPoints(rule, entry.rawValue);
    total += pts;
    breakdown[entry.ruleKey] = (breakdown[entry.ruleKey] || 0) + pts;
  }

  // External stats — always computed live from cached rawValue, not from ledger
  if (student.externalStats?.codeforcesRating != null && map.codeforces_rating) {
    const pts = resolveTierPoints(map.codeforces_rating, student.externalStats.codeforcesRating);
    total += pts;
    breakdown.codeforces_rating = pts;
  }
  if (student.externalStats?.leetcodeSolveScore != null && map.leetcode_solve_score) {
    const pts = resolveTierPoints(map.leetcode_solve_score, student.externalStats.leetcodeSolveScore);
    total += pts;
    breakdown.leetcode_solve_score = pts;
  }
  if (student.externalStats?.githubContributions != null && map.github_contributions) {
    const pts = resolveTierPoints(map.github_contributions, student.externalStats.githubContributions);
    total += pts;
    breakdown.github_contributions = pts;
  }

  return { total, breakdown };
};

module.exports = { computeStudentPoints, resolveTierPoints, buildRuleMap };