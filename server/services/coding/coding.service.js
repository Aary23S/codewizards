// codewizards/server/services/coding/coding.service.js
const CodingProfile = require("../../models/CodingProfile");
const User = require("../../models/User");
const { fetchCodeforces } = require("./adapters/codeforces.adapter");
const { fetchLeetcode } = require("./adapters/leetcode.adapter");
const { fetchGithub } = require("./adapters/github.adapter");

const DEFAULT_COOLDOWN_MS = Number(process.env.CODING_SYNC_COOLDOWN_MS || 5 * 60 * 1000);

function sanitizeHandle(value, label) {
  const text = value == null ? "" : value.toString().trim();
  if (!text) return "";

  const patterns = {
    leetcode: /^[A-Za-z0-9_.-]{1,80}$/,
    codeforces: /^[A-Za-z0-9_.-]{1,40}$/,
    github: /^[A-Za-z0-9-]{1,39}$/,
  };

  const pattern = patterns[label];
  if (!pattern || !pattern.test(text)) {
    throw new Error(`Invalid ${label} identifier`);
  }

  return text;
}

function trimText(value) {
  return value == null ? "" : value.toString().trim();
}

async function getOrCreateProfile(userId) {
  const existing = await CodingProfile.findOne({ userId });
  if (existing) return existing;
  return CodingProfile.create({ userId });
}

function emptyPlatformState(platform) {
  if (platform === "leetcode") {
    return {
      username: "",
      totalSolved: null,
      easySolved: null,
      mediumSolved: null,
      hardSolved: null,
      ranking: null,
      recentSubmissions: [],
      lastSyncedAt: null,
      verified: false,
      error: "",
    };
  }
  if (platform === "codeforces") {
    return {
      handle: "",
      rating: null,
      maxRating: null,
      rank: "",
      maxRank: "",
      solvedCount: null,
      recentSubmissions: [],
      contestHistory: [],
      lastSyncedAt: null,
      verified: false,
      error: "",
    };
  }
  return {
    username: "",
    contributions: null,
    projects: null,
    followers: null,
    following: null,
    publicRepos: null,
    recentActivity: [],
    lastSyncedAt: null,
    verified: false,
    error: "",
  };
}

function cooldownRemainingMs(lastSyncedAt) {
  if (!lastSyncedAt) return 0;
  const delta = Date.now() - new Date(lastSyncedAt).getTime();
  return Math.max(0, DEFAULT_COOLDOWN_MS - delta);
}

function hasHandleChange(current, next) {
  return trimText(current) !== trimText(next);
}

function safeErrorMessage(error, fallback) {
  const message = error?.message || fallback || "Unavailable";
  if (message.includes("not found")) return message;
  if (message.includes("Invalid")) return message;
  return fallback || "Unavailable";
}

async function persistHandleUpdates(userId, handleUpdates) {
  const userUpdates = {};
  if (Object.prototype.hasOwnProperty.call(handleUpdates, "leetcodeUsername")) userUpdates.leetcodeUsername = handleUpdates.leetcodeUsername;
  if (Object.prototype.hasOwnProperty.call(handleUpdates, "codeforcesHandle")) userUpdates.codeforcesHandle = handleUpdates.codeforcesHandle;
  if (Object.prototype.hasOwnProperty.call(handleUpdates, "githubUsername")) userUpdates.githubUsername = handleUpdates.githubUsername;

  if (Object.keys(userUpdates).length === 0) return null;
  return User.findByIdAndUpdate(userId, userUpdates, { new: true }).select("-password");
}

function buildExternalStatsPatch(profile) {
  const leetcodeSynced = !!profile.leetcode?.lastSyncedAt;
  const codeforcesSynced = !!profile.codeforces?.lastSyncedAt;
  const githubSynced = !!profile.github?.lastSyncedAt;

  return {
    externalStats: {
      codeforcesRating: codeforcesSynced ? (profile.codeforces?.rating ?? null) : null,
      leetcodeSolveScore: leetcodeSynced
        ? (Number(profile.leetcode.easySolved || 0) * 1) +
          (Number(profile.leetcode.mediumSolved || 0) * 3) +
          (Number(profile.leetcode.hardSolved || 0) * 5)
        : null,
      githubContributions: githubSynced ? (profile.github?.contributions ?? null) : null,
      lastSynced: new Date(),
    },
  };
}

async function persistExternalStats(userId, profile) {
  const patch = buildExternalStatsPatch(profile);
  return User.findByIdAndUpdate(userId, patch, { new: true }).select("-password");
}

async function syncPlatform(profile, userId, platform, handle, force = false) {
  const platformState = profile[platform] || {};
  const lastSyncedAt = platformState.lastSyncedAt;
  const remaining = cooldownRemainingMs(lastSyncedAt);

  if (!force && remaining > 0) {
    return {
      platform,
      status: "cached",
      cooldownRemainingMs: remaining,
      data: platformState,
    };
  }

  if (!handle) {
    profile.set(platform, {
      ...emptyPlatformState(platform),
    });
    return {
      platform,
      status: "cleared",
      data: profile[platform],
    };
  }

  try {
    const fetched = await (platform === "codeforces"
      ? fetchCodeforces(handle)
      : platform === "leetcode"
        ? fetchLeetcode(handle)
        : fetchGithub(handle));

    profile.set(platform, {
      ...platformState,
      ...fetched,
      lastSyncedAt: new Date(),
      error: "",
    });

    if (platform === "codeforces") {
      profile.codeforcesHandle = fetched.handle;
    } else if (platform === "leetcode") {
      profile.leetcodeUsername = fetched.username;
    } else if (platform === "github") {
      profile.githubUsername = fetched.username;
    }

    return {
      platform,
      status: "synced",
      data: profile[platform],
    };
  } catch (error) {
    console.warn(`[coding] ${platform} sync failed for user ${userId}:`, error?.message || error);
    profile.set(platform, {
      ...platformState,
      error: safeErrorMessage(error, `Unable to sync ${platform}`),
      verified: false,
    });
    return {
      platform,
      status: "failed",
      error: safeErrorMessage(error, `Unable to sync ${platform}`),
      data: profile[platform],
    };
  }
}

function normalizePublicProfile(profile) {
  if (!profile) return null;
  return {
    userId: profile.userId,
    leetcodeUsername: profile.leetcodeUsername || "",
    codeforcesHandle: profile.codeforcesHandle || "",
    githubUsername: profile.githubUsername || "",
    leetcode: {
      totalSolved: profile.leetcode?.totalSolved ?? null,
      easySolved: profile.leetcode?.easySolved ?? null,
      mediumSolved: profile.leetcode?.mediumSolved ?? null,
      hardSolved: profile.leetcode?.hardSolved ?? null,
      ranking: profile.leetcode?.ranking ?? null,
      recentSubmissions: profile.leetcode?.recentSubmissions ?? [],
      lastSyncedAt: profile.leetcode?.lastSyncedAt ?? null,
      verified: !!profile.leetcode?.verified,
    },
    codeforces: {
      handle: profile.codeforces?.handle || "",
      rating: profile.codeforces?.rating ?? null,
      maxRating: profile.codeforces?.maxRating ?? null,
      rank: profile.codeforces?.rank || "",
      maxRank: profile.codeforces?.maxRank || "",
      solvedCount: profile.codeforces?.solvedCount ?? null,
      recentSubmissions: profile.codeforces?.recentSubmissions ?? [],
      contestHistory: profile.codeforces?.contestHistory ?? [],
      lastSyncedAt: profile.codeforces?.lastSyncedAt ?? null,
      verified: !!profile.codeforces?.verified,
    },
    github: {
      username: profile.github?.username || "",
      contributions: profile.github?.contributions ?? null,
      projects: profile.github?.projects ?? null,
      followers: profile.github?.followers ?? null,
      following: profile.github?.following ?? null,
      publicRepos: profile.github?.publicRepos ?? null,
      recentActivity: profile.github?.recentActivity ?? [],
      lastSyncedAt: profile.github?.lastSyncedAt ?? null,
      verified: !!profile.github?.verified,
    },
    updatedAt: profile.updatedAt,
    createdAt: profile.createdAt,
  };
}

async function connectCodingProfile({ user, leetcodeUsername, codeforcesHandle, githubUsername }) {
  const profile = await getOrCreateProfile(user._id);
  const handleUpdates = {};

  if (leetcodeUsername !== undefined) {
    handleUpdates.leetcodeUsername = sanitizeHandle(leetcodeUsername, "leetcode");
    profile.leetcodeUsername = handleUpdates.leetcodeUsername;
  }
  if (codeforcesHandle !== undefined) {
    handleUpdates.codeforcesHandle = sanitizeHandle(codeforcesHandle, "codeforces");
    profile.codeforcesHandle = handleUpdates.codeforcesHandle;
  }
  if (githubUsername !== undefined) {
    handleUpdates.githubUsername = sanitizeHandle(githubUsername, "github");
    profile.githubUsername = handleUpdates.githubUsername;
  }

  await persistHandleUpdates(user._id, handleUpdates);

  const results = [];
  if (Object.prototype.hasOwnProperty.call(handleUpdates, "leetcodeUsername")) {
    results.push(await syncPlatform(profile, user._id, "leetcode", profile.leetcodeUsername, true));
  }
  if (Object.prototype.hasOwnProperty.call(handleUpdates, "codeforcesHandle")) {
    results.push(await syncPlatform(profile, user._id, "codeforces", profile.codeforcesHandle, true));
  }
  if (Object.prototype.hasOwnProperty.call(handleUpdates, "githubUsername")) {
    results.push(await syncPlatform(profile, user._id, "github", profile.githubUsername, true));
  }

  profile.lastManualSyncAt = new Date();
  await profile.save();
  await persistExternalStats(user._id, profile);

  const refreshedUser = await User.findById(user._id).select("-password");

  return {
    profile: normalizePublicProfile(profile),
    user: refreshedUser,
    results,
  };
}

async function syncCurrentUserCodingProfile(user) {
  const profile = await getOrCreateProfile(user._id);
  const leetcodeHandle = trimText(user.leetcodeUsername);
  const codeforcesHandle = trimText(user.codeforcesHandle);
  const githubHandle = trimText(user.githubUsername);

  if (hasHandleChange(profile.leetcodeUsername, leetcodeHandle)) {
    profile.leetcodeUsername = leetcodeHandle;
  }
  if (hasHandleChange(profile.codeforcesHandle, codeforcesHandle)) {
    profile.codeforcesHandle = codeforcesHandle;
  }
  if (hasHandleChange(profile.githubUsername, githubHandle)) {
    profile.githubUsername = githubHandle;
  }

  const results = [];
  results.push(await syncPlatform(profile, user._id, "leetcode", profile.leetcodeUsername, true));
  results.push(await syncPlatform(profile, user._id, "codeforces", profile.codeforcesHandle, true));
  results.push(await syncPlatform(profile, user._id, "github", profile.githubUsername, true));

  profile.lastManualSyncAt = new Date();
  await profile.save();
  await persistExternalStats(user._id, profile);

  const refreshedUser = await persistHandleUpdates(user._id, {
    leetcodeUsername: profile.leetcodeUsername,
    codeforcesHandle: profile.codeforcesHandle,
    githubUsername: profile.githubUsername,
  });

  return {
    profile: normalizePublicProfile(profile),
    user: refreshedUser,
    results,
    cooldownRemainingMs: 0,
  };
}

async function getMyCodingProfile(userId) {
  const profile = await CodingProfile.findOne({ userId });
  return normalizePublicProfile(profile);
}

async function getPublicCodingProfile(userId) {
  const profile = await CodingProfile.findOne({ userId });
  if (!profile) return null;
  return normalizePublicProfile(profile);
}

async function syncLegacyPlatform({ user, platform, handle }) {
  const profile = await getOrCreateProfile(user._id);
  if (platform === "leetcode") {
    profile.leetcodeUsername = sanitizeHandle(handle, "leetcode");
  } else if (platform === "codeforces") {
    profile.codeforcesHandle = sanitizeHandle(handle, "codeforces");
  } else if (platform === "github") {
    profile.githubUsername = sanitizeHandle(handle, "github");
  } else {
    throw new Error("Unsupported platform");
  }

  await persistHandleUpdates(user._id, {
    ...(platform === "leetcode" ? { leetcodeUsername: profile.leetcodeUsername } : {}),
    ...(platform === "codeforces" ? { codeforcesHandle: profile.codeforcesHandle } : {}),
    ...(platform === "github" ? { githubUsername: profile.githubUsername } : {}),
  });

  const result = await syncPlatform(profile, user._id, platform, handle, true);
  profile.lastManualSyncAt = new Date();
  await profile.save();
  await persistExternalStats(user._id, profile);
  return {
    profile: normalizePublicProfile(profile),
    result,
  };
}

module.exports = {
  DEFAULT_COOLDOWN_MS,
  connectCodingProfile,
  getMyCodingProfile,
  getPublicCodingProfile,
  syncCurrentUserCodingProfile,
  syncLegacyPlatform,
  sanitizeHandle,
  cooldownRemainingMs,
};
