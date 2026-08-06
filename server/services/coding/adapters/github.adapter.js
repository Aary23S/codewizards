// codewizards/server/services/coding/adapters/github.adapter.js
const axios = require("axios");

const githubClient = axios.create({
  baseURL: "https://api.github.com",
  timeout: 10000,
  headers: {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "CodeWizardsApp",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  },
});

async function fetchGithub(username) {
  const safeUsername = username?.trim();
  if (!safeUsername) {
    throw new Error("GitHub username required");
  }

  const [profileRes, reposRes, eventsRes] = await Promise.all([
    githubClient.get(`/users/${encodeURIComponent(safeUsername)}`),
    githubClient.get(`/users/${encodeURIComponent(safeUsername)}/repos`, {
      params: { sort: "pushed", direction: "desc", per_page: 5 },
    }),
    githubClient.get(`/users/${encodeURIComponent(safeUsername)}/events/public`, {
      params: { per_page: 10 },
    }),
  ]);

  const profile = profileRes.data || {};
  const repos = Array.isArray(reposRes.data) ? reposRes.data : [];
  const events = Array.isArray(eventsRes.data) ? eventsRes.data : [];

  const recentActivity = events.slice(0, 5).map((event) => ({
    title: event.type || "",
    titleSlug: "",
    problem: event.repo?.name || "",
    contestName: "",
    verdict: event.type || "",
    language: "",
    url: event.repo?.url ? `https://github.com/${event.repo.name}` : `https://github.com/${safeUsername}`,
    solvedAt: event.created_at ? new Date(event.created_at) : null,
  }));

  return {
    username: safeUsername,
    contributions: events.length,
    projects: profile.public_repos ?? repos.length ?? null,
    followers: profile.followers ?? null,
    following: profile.following ?? null,
    publicRepos: profile.public_repos ?? null,
    recentActivity,
    verified: true,
  };
}

module.exports = {
  fetchGithub,
};
