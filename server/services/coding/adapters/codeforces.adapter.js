const axios = require("axios");

const codeforcesClient = axios.create({
  baseURL: "https://codeforces.com/api",
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

function normalizeRank(value) {
  return value ? value.toString().trim() : "";
}

function toSubmissionUrl(problem) {
  if (!problem) return "";
  const contestId = problem.contestId ?? "";
  const index = problem.index ?? "";
  if (!contestId || !index) return "";
  return `https://codeforces.com/contest/${contestId}/problem/${index}`;
}

async function fetchCodeforces(handle) {
  const safeHandle = handle?.trim();
  if (!safeHandle) {
    throw new Error("Codeforces handle required");
  }

  const [infoRes, statusRes, ratingRes] = await Promise.all([
    codeforcesClient.get("/user.info", { params: { handles: safeHandle } }),
    codeforcesClient.get("/user.status", { params: { handle: safeHandle, from: 1, count: 100 } }),
    codeforcesClient.get("/user.rating", { params: { handle: safeHandle } }),
  ]);

  if (infoRes.data?.status !== "OK" || !Array.isArray(infoRes.data?.result) || !infoRes.data.result.length) {
    throw new Error("Codeforces handle not found");
  }

  const info = infoRes.data.result[0];
  const submissions = Array.isArray(statusRes.data?.result) ? statusRes.data.result : [];
  const ratings = Array.isArray(ratingRes.data?.result) ? ratingRes.data.result : [];

  const accepted = submissions.filter((submission) => submission.verdict === "OK");
  const uniqueSolved = new Set(
    accepted.map((submission) => {
      const problem = submission.problem || {};
      return [problem.contestId ?? "", problem.index ?? "", problem.name ?? ""].join(":");
    })
  );

  const recentSubmissions = submissions.slice(0, 5).map((submission) => {
    const problem = submission.problem || {};
    return {
      title: problem.name || "",
      titleSlug: "",
      problem: problem.name || "",
      contestName: problem.contestName || "",
      verdict: submission.verdict || "",
      language: submission.programmingLanguage || "",
      url: toSubmissionUrl(problem),
      solvedAt: submission.creationTimeSeconds ? new Date(submission.creationTimeSeconds * 1000) : null,
    };
  });

  const contestHistory = ratings.slice(-10).map((entry) => ({
    contestId: entry.contestId ?? null,
    contestName: entry.contestName || "",
    oldRating: entry.oldRating ?? null,
    newRating: entry.newRating ?? null,
    rank: entry.rank ?? null,
    ratingUpdateTimeSeconds: entry.ratingUpdateTimeSeconds ?? null,
  }));

  return {
    handle: safeHandle,
    rating: info.rating ?? null,
    maxRating: info.maxRating ?? null,
    rank: normalizeRank(info.rank),
    maxRank: normalizeRank(info.maxRank),
    solvedCount: uniqueSolved.size,
    recentSubmissions,
    contestHistory,
    verified: true,
  };
}

module.exports = {
  fetchCodeforces,
};
