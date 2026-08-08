// codewizards/server/services/coding/adapters/leetcode.adapter.js
const axios = require("axios");

async function fetchLeetcode(username) {
  const safeUsername = username?.trim();
  if (!safeUsername) {
    throw new Error("LeetCode username required");
  }

  try {
    // Primary API: Faisal Shohag LeetCode API
    const response = await axios.get(`https://leetcode-api-faisalshohag.vercel.app/${safeUsername}`, { timeout: 8000 });
    const data = response.data;

    if (data && data.totalSolved !== undefined) {
      const recentSubmissions = (data.recentSubmissions || []).map((item) => ({
        title: item.title || "",
        titleSlug: item.titleSlug || "",
        problem: item.title || "",
        contestName: "",
        verdict: item.statusDisplay || "",
        language: item.lang || "",
        url: item.titleSlug ? `https://leetcode.com/problems/${item.titleSlug}/` : "",
        solvedAt: item.timestamp ? new Date(Number(item.timestamp) * 1000) : null,
      }));

      return {
        username: safeUsername,
        totalSolved: data.totalSolved ?? null,
        easySolved: data.easySolved ?? null,
        mediumSolved: data.mediumSolved ?? null,
        hardSolved: data.hardSolved ?? null,
        ranking: data.ranking ?? null,
        recentSubmissions,
        verified: true,
      };
    }
  } catch (error) {
    console.warn(`Primary LeetCode API failed for ${safeUsername}, trying backup...`, error.message);
  }

  try {
    // Backup API: Alfa Leetcode API
    const response = await axios.get(`https://alfa-leetcode-api.onrender.com/${safeUsername}`, { timeout: 8000 });
    const data = response.data;

    if (data && data.totalSolved !== undefined) {
      const recentSubmissions = (data.recentSubmissions || []).map((item) => ({
        title: item.title || "",
        titleSlug: item.titleSlug || "",
        problem: item.title || "",
        contestName: "",
        verdict: item.statusDisplay || "",
        language: item.lang || "",
        url: item.titleSlug ? `https://leetcode.com/problems/${item.titleSlug}/` : "",
        solvedAt: item.timestamp ? new Date(Number(item.timestamp) * 1000) : null,
      }));

      return {
        username: safeUsername,
        totalSolved: data.totalSolved ?? null,
        easySolved: data.easySolved ?? null,
        mediumSolved: data.mediumSolved ?? null,
        hardSolved: data.hardSolved ?? null,
        ranking: data.ranking ?? null,
        recentSubmissions,
        verified: true,
      };
    }
  } catch (error) {
    console.error(`Backup LeetCode API failed for ${safeUsername}`, error.message);
  }

  throw new Error("Unable to fetch LeetCode profile statistics");
}

module.exports = {
  fetchLeetcode,
};
