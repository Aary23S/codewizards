const axios = require("axios");
const User = require("../models/User");

// POST /api/v1/sync/codeforces
const syncCodeforces = async (req, res) => {
  try {
    const { handle } = req.body;
    if (!handle) return res.status(400).json({ success: false, message: "Handle required" });

    const { data } = await axios.get(`https://codeforces.com/api/user.info?handles=${handle}`);
    if (data.status !== "OK") {
      return res.status(400).json({ success: false, message: "Codeforces handle not found" });
    }

    const rating = data.result[0].rating || 0;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        codeforcesHandle: handle,
        "externalStats.codeforcesRating": rating,
        "externalStats.lastSynced": new Date(),
      },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to fetch Codeforces data" });
  }
};

// POST /api/v1/sync/leetcode
const syncLeetcode = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: "Username required" });

    // LeetCode has no official API — using their public GraphQL endpoint that
    // powers their own profile page. This is unofficial and may break if
    // LeetCode changes their frontend without notice.
    const query = {
      query: `
        query userProblemsSolved($username: String!) {
          matchedUser(username: $username) {
            submitStatsGlobal {
              acSubmissionNum { difficulty count }
            }
          }
        }`,
      variables: { username },
    };

    const { data } = await axios.post("https://leetcode.com/graphql", query, {
      headers: { "Content-Type": "application/json" },
    });

    const stats = data?.data?.matchedUser?.submitStatsGlobal?.acSubmissionNum;
    if (!stats) return res.status(400).json({ success: false, message: "LeetCode username not found" });

    const counts = Object.fromEntries(stats.map((s) => [s.difficulty, s.count]));
    const solveScore =
      (counts.Easy || 0) * 1 + (counts.Medium || 0) * 3 + (counts.Hard || 0) * 5;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        leetcodeUsername: username,
        "externalStats.leetcodeSolveScore": solveScore,
        "externalStats.lastSynced": new Date(),
      },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to fetch LeetCode data — their API may be temporarily unavailable" });
  }
};

// POST /api/v1/sync/github
const syncGithub = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: "Username required" });

    // GitHub's REST API doesn't expose total contribution count directly without
    // a token-authenticated GraphQL call. Using public events as an approximation —
    // this undercounts older activity (events API only returns last 90 days),
    // which is a known limitation, not a bug.
    const { data } = await axios.get(`https://api.github.com/users/${username}/events/public?per_page=100`);
    const contributions = data.length; // approximation: recent public event count

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        githubUsername: username,
        "externalStats.githubContributions": contributions,
        "externalStats.lastSynced": new Date(),
      },
      { new: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: "Failed to fetch GitHub data — check the username" });
  }
};

module.exports = { syncCodeforces, syncLeetcode, syncGithub };