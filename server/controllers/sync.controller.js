//sync.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const { syncLegacyPlatform, checkSyncCooldown } = require("../services/coding/coding.service");

const cooldownResponse = (remaining, cooldownMs) => ({
  success: false,
  message: `Please wait ${Math.ceil(remaining / 1000)}s before syncing again.`,
  meta: { cooldownRemainingMs: remaining, cooldownMs },
});

// POST /api/v1/sync/codeforces
const syncCodeforces = async (req, res) => {
  try {
    const { handle } = req.body;
    if (!handle) return res.status(400).json({ success: false, message: "Handle required" });
    const { remaining, cooldownMs } = await checkSyncCooldown(req.user._id);
    if (remaining > 0) return res.status(429).json(cooldownResponse(remaining, cooldownMs));
    const result = await syncLegacyPlatform({ user: req.user, platform: "codeforces", handle });
    res.json({ success: true, data: result.profile, meta: result.result });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) || "Failed to fetch Codeforces data" });
  }
};

// POST /api/v1/sync/leetcode
const syncLeetcode = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: "Username required" });
    const { remaining, cooldownMs } = await checkSyncCooldown(req.user._id);
    if (remaining > 0) return res.status(429).json(cooldownResponse(remaining, cooldownMs));
    const result = await syncLegacyPlatform({ user: req.user, platform: "leetcode", handle: username });
    res.json({ success: true, data: result.profile, meta: result.result });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) || "Failed to fetch LeetCode data — their API may be temporarily unavailable" });
  }
};

// POST /api/v1/sync/github
const syncGithub = async (req, res) => {
  try {
    const { username } = req.body;
    if (!username) return res.status(400).json({ success: false, message: "Username required" });
    const { remaining, cooldownMs } = await checkSyncCooldown(req.user._id);
    if (remaining > 0) return res.status(429).json(cooldownResponse(remaining, cooldownMs));
    const result = await syncLegacyPlatform({ user: req.user, platform: "github", handle: username });
    res.json({ success: true, data: result.profile, meta: result.result });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) || "Failed to fetch GitHub data — check the username" });
  }
};

module.exports = { syncCodeforces, syncLeetcode, syncGithub };
