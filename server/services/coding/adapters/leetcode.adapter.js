// codewizards/server/services/coding/adapters/leetcode.adapter.js
const axios = require("axios");

const leetcodeClient = axios.create({
  baseURL: "https://leetcode.com",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
    Referer: "https://leetcode.com",
    Origin: "https://leetcode.com",
  },
});

async function fetchLeetcode(username) {
  const safeUsername = username?.trim();
  if (!safeUsername) {
    throw new Error("LeetCode username required");
  }

  const query = {
    query: `
      query codingProfile($username: String!) {
        matchedUser(username: $username) {
          profile {
            ranking
          }
          submitStatsGlobal {
            acSubmissionNum {
              difficulty
              count
            }
          }
          recentAcSubmissionList(limit: 5) {
            title
            titleSlug
            timestamp
            statusDisplay
            lang
          }
        }
      }
    `,
    variables: { username: safeUsername },
  };

  const response = await leetcodeClient.post("/graphql", query);
  const matchedUser = response.data?.data?.matchedUser;

  if (!matchedUser) {
    throw new Error("LeetCode username not found");
  }

  const counts = new Map(
    (matchedUser.submitStatsGlobal?.acSubmissionNum || []).map((item) => [String(item.difficulty).toLowerCase(), item.count ?? null])
  );

  const recentSubmissions = (matchedUser.recentAcSubmissionList || []).map((item) => ({
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
    totalSolved: counts.get("all") ?? counts.get("total") ?? null,
    easySolved: counts.get("easy") ?? null,
    mediumSolved: counts.get("medium") ?? null,
    hardSolved: counts.get("hard") ?? null,
    ranking: matchedUser.profile?.ranking ?? null,
    recentSubmissions,
    verified: true,
  };
}

module.exports = {
  fetchLeetcode,
};
