//coding.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const CodingProfile = require("../models/CodingProfile");
const {
  connectCodingProfile,
  getMyCodingProfile,
  getPublicCodingProfile,
  syncCurrentUserCodingProfile,
  sanitizeHandle,
  cooldownRemainingMs,
  checkSyncCooldown,
  DEFAULT_COOLDOWN_MS,
} = require("../services/coding/coding.service");

function parseBodyHandles(body = {}) {
  const leetcodeUsername = body.leetcodeUsername ?? body.leetcode ?? body.leetcodeHandle;
  const codeforcesHandle = body.codeforcesHandle ?? body.codeforces ?? body.codeforcesUsername;
  const githubUsername = body.githubUsername ?? body.github ?? body.githubHandle;

  const payload = {};
  if (leetcodeUsername !== undefined) payload.leetcodeUsername = leetcodeUsername;
  if (codeforcesHandle !== undefined) payload.codeforcesHandle = codeforcesHandle;
  if (githubUsername !== undefined) payload.githubUsername = githubUsername;
  return payload;
}

async function connectCoding(req, res) {
  try {
    const payload = parseBodyHandles(req.body);
    if (
      payload.leetcodeUsername === undefined &&
      payload.codeforcesHandle === undefined &&
      payload.githubUsername === undefined
    ) {
      return res.status(400).json({
        success: false,
        message: "Provide at least one username or handle.",
      });
    }

    const { remaining, cooldownMs } = await checkSyncCooldown(req.user._id);
    if (remaining > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${Math.ceil(remaining / 1000)}s before syncing again.`,
        meta: { cooldownRemainingMs: remaining, cooldownMs },
      });
    }

    const result = await connectCodingProfile({ user: req.user, ...payload });
    return res.json({
      success: true,
      data: result.profile,
      meta: {
        results: result.results,
        user: result.user,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: safeErrorMessage(error) || "Unable to connect coding profiles" });
  }
}

async function getMyCodingProfileController(req, res) {
  try {
    const profile = await getMyCodingProfile(req.user._id);
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
}

async function syncCoding(req, res) {
  try {
    const existing = await CodingProfile.findOne({ userId: req.user._id });
    const remaining = cooldownRemainingMs(existing?.lastManualSyncAt);
    if (remaining > 0) {
      return res.status(429).json({
        success: false,
        message: `Please wait ${Math.ceil(remaining / 1000)}s before syncing again.`,
        data: existing ? await getMyCodingProfile(req.user._id) : null,
        meta: {
          cooldownRemainingMs: remaining,
          cooldownMs: DEFAULT_COOLDOWN_MS,
        },
      });
    }

    const result = await syncCurrentUserCodingProfile(req.user);
    return res.json({
      success: true,
      data: result.profile,
      meta: {
        results: result.results,
        cooldownRemainingMs: result.cooldownRemainingMs,
        user: result.user,
      },
    });
  } catch (error) {
    return res.status(400).json({ success: false, message: safeErrorMessage(error) || "Unable to sync coding profile" });
  }
}

async function getPublicCodingProfileController(req, res) {
  try {
    const profile = await getPublicCodingProfile(req.params.id || req.query.userId);
    if (!profile) {
      return res.status(404).json({ success: false, message: "Coding profile not found" });
    }
    return res.json({ success: true, data: profile });
  } catch (error) {
    return res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
}

module.exports = {
  connectCoding,
  getMyCodingProfileController,
  syncCoding,
  getPublicCodingProfileController,
};
