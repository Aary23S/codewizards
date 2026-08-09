//  codewizards/client/src/pages/ProfileView.js
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getUserById,
  createMentorshipRequest,
  getPublicCodingProfile,
  syncCodingProfile,
  getMyMentorshipRequests,
  updateMentorshipStatus,
} from "../services/api";
import { useAuth } from "../context/AuthContext";

const shellCard =
  "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]";

const ProfileView = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const isOwnProfile = currentUser?._id === id;

  const [profile, setProfile] = useState(null);
  const [codingProfile, setCodingProfile] = useState(null);
  const [selectedPlatform, setSelectedPlatform] = useState("leetcode");
  const [loading, setLoading] = useState(true);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState("");
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [reqError, setReqError] = useState("");

  const [requests, setRequests] = useState([]);

  const handleRequest = async () => {
    if (!message.trim()) return setReqError("Please write a message");
    try {
      await createMentorshipRequest({ mentorId: profile._id, message });
      setSent(true);
    } catch (err) {
      setReqError(err.response?.data?.message || "Failed to send request");
    }
  };

  useEffect(() => {
    Promise.all([
      getUserById(id),
      getPublicCodingProfile(id).catch(() => ({ data: { data: null } })),
    ])
      .then(([userRes, codingRes]) => {
        setProfile(userRes.data.data);
        setCodingProfile(codingRes.data.data || null);
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));

    if (isOwnProfile) {
      getMyMentorshipRequests()
        .then((res) => setRequests(res.data.data || []))
        .catch(console.error);
    }
  }, [id, navigate, isOwnProfile]);

  const handleStatus = async (requestId, status) => {
    try {
      await updateMentorshipStatus(requestId, status);
      setRequests((prev) =>
        prev.map((item) => (item._id === requestId ? { ...item, status } : item))
      );
    } catch (e) {
      console.error("Failed to update request status:", e);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#050816] px-4 py-24 text-center text-white/55">
        Loading...
      </div>
    );
  }

  if (!profile) return null;

  const profileImage =
    profile.imageUrl ||
    (isOwnProfile ? currentUser?.imageUrl : "") ||
    profile.image ||
    profile.avatar ||
    profile.photo ||
    "";

  const platformLinks = [
    { label: "GitHub", url: profile.github },
    { label: "LinkedIn", url: profile.linkedin },
    { label: "LeetCode", url: profile.leetcode },
    { label: "Codeforces", url: profile.codeforces },
    { label: "Portfolio", url: profile.portfolio },
  ].filter((item) => item.url);

  const hasCodingData = Boolean(
    codingProfile &&
      (
        codingProfile.leetcodeUsername ||
        codingProfile.codeforcesHandle ||
        codingProfile.githubUsername ||
        codingProfile.leetcode?.totalSolved != null ||
        codingProfile.leetcode?.recentSubmissions?.length ||
        codingProfile.codeforces?.rating != null ||
        codingProfile.codeforces?.recentSubmissions?.length ||
        codingProfile.github?.contributions != null ||
        codingProfile.github?.recentActivity?.length
      )
  );

  const codingInsight = buildCodingInsight(selectedPlatform, codingProfile);

  const refreshCodingProfile = async () => {
    if (!isOwnProfile) return;
    setSyncError("");
    setSyncing(true);
    try {
      await syncCodingProfile();
      const codingRes = await getPublicCodingProfile(id).catch(() => ({ data: { data: null } }));
      setCodingProfile(codingRes.data.data || null);
    } catch (err) {
      setSyncError(err.response?.data?.message || "Failed to sync coding stats");
    } finally {
      setSyncing(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-12 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-8 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className={`${shellCard} overflow-hidden`}>
          <div className="px-6 py-8 md:px-8 md:py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-start lg:justify-between">
              <div className="flex items-start gap-5">
                {profileImage ? (
                  <img
                    src={profileImage}
                    alt={profile.name}
                    className="h-20 w-20 rounded-3xl border border-white/10 object-cover ring-1 ring-white/10"
                  />
                ) : (
                  <div className="flex h-20 w-20 items-center justify-center rounded-3xl bg-gradient-to-br from-cyan-400 via-sky-500 to-indigo-500 text-3xl font-semibold text-black shadow-lg shadow-cyan-500/20">
                    {profile.name.charAt(0)}
                  </div>
                )}

                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">Profile</p>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                    {profile.name}
                  </h1>
                  <p className="mt-2 text-sm text-white/60 capitalize">
                    {profile.role}
                    {profile.batch ? ` · Batch ${profile.batch}` : ""}
                  </p>
                  {profile.isMentor && (
                    <span className="mt-4 inline-flex rounded-full border border-emerald-400/20 bg-emerald-400/10 px-3 py-1 text-[11px] uppercase tracking-[0.3em] text-emerald-200">
                      Open to mentor
                    </span>
                  )}
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                {isOwnProfile && (
                  <Link
                    to={`/profile/${id}/edit`}
                    className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
                  >
                    Edit profile
                  </Link>
                )}
                <Link
                  to="/connect"
                  className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-sm font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                >
                  Explore directory
                </Link>
              </div>
            </div>

            {profile.bio && (
              <p className="mt-8 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
                {profile.bio}
              </p>
            )}
          </div>
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {profile.domain?.length > 0 && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Domains</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {profile.domain.map((domain) => (
                    <span
                      key={domain}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-sm text-white/75"
                    >
                      {domain}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {platformLinks.length > 0 && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Links</p>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  {platformLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.url}
                      target="_blank"
                      rel="noreferrer"
                      className="group rounded-2xl border border-white/10 bg-black/20 px-4 py-4 transition duration-300 hover:-translate-y-0.5 hover:border-white/20 hover:bg-white/8"
                    >
                      <p className="text-sm font-semibold text-white">{item.label}</p>
                      <p className="mt-2 text-xs uppercase tracking-[0.3em] text-cyan-200/70">
                        Open profile
                      </p>
                    </a>
                  ))}
                </div>
              </div>
            )}

            {hasCodingData && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Coding tracker</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">One analytics card, switchable by platform.</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-6 text-white/60">
                      The web view now mirrors mobile: no noisy activity feed, just compact platform analytics with a cleaner desktop hierarchy.
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {CODING_PLATFORMS.map((platform) => {
                      const active = selectedPlatform === platform.key;
                      return (
                        <button
                          key={platform.key}
                          type="button"
                          onClick={() => setSelectedPlatform(platform.key)}
                          className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                            active
                              ? "border-white bg-white text-black"
                              : "border-white/10 bg-black/20 text-white/75 hover:border-white/20 hover:bg-white/8"
                          }`}
                        >
                          {platform.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-5 grid gap-3 sm:grid-cols-3">
                  <StatPill label="Total" value={formatCount(codingInsight.total)} />
                  <StatPill label={codingInsight.primaryLabel} value={formatCount(codingInsight.primaryValue)} />
                  <StatPill label="Last sync" value={syncAgeLabel(codingInsight.lastSync)} />
                </div>

                {isOwnProfile && (
                  <div className="mt-5 flex flex-wrap items-center gap-3">
                    <button
                      type="button"
                      onClick={refreshCodingProfile}
                      disabled={syncing}
                      className="rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:opacity-50"
                    >
                      {syncing ? "Syncing..." : "Sync now"}
                    </button>
                    <p className="text-sm text-white/55">
                      Refresh your LeetCode, Codeforces, and GitHub stats from the backend.
                    </p>
                  </div>
                )}

                {syncError && (
                  <p className="mt-3 text-sm text-rose-200">
                    {syncError}
                  </p>
                )}

                <div className="mt-6 rounded-3xl border border-white/10 bg-black/20 p-5 md:p-6">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">{codingInsight.eyebrow}</p>
                  <h4 className="mt-3 text-xl font-semibold text-white">{codingInsight.title}</h4>
                  <p className="mt-2 text-sm leading-6 text-white/60">{codingInsight.description}</p>

                  <div className="mt-6 space-y-4">
                    {codingInsight.metrics
                      .filter((metric) => metric.value != null)
                      .map((metric) => (
                        <BarMetric
                          key={metric.label}
                          metric={metric}
                          accent={codingInsight.accent}
                          maxValue={codingInsight.maxValue}
                        />
                      ))}
                  </div>

                  <div className="mt-5 flex flex-wrap gap-2">
                    {codingInsight.handles.map((handle) => (
                      <span
                        key={handle}
                        className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-white/70"
                      >
                        {handle}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {isOwnProfile && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Mentorship</p>
                    <h3 className="mt-2 text-2xl font-semibold text-white">Mentorship Requests</h3>
                  </div>
                  <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-semibold text-white/60">
                    {requests.length} total
                  </span>
                </div>

                {requests.length === 0 ? (
                  <p className="text-sm leading-7 text-white/55">
                    No mentorship requests yet. Send a request to a mentor in the directory to get started.
                  </p>
                ) : (
                  <div className="space-y-6">
                    {/* Incoming requests (where this user is the mentor) */}
                    {requests.filter((r) => r.mentorId?._id === currentUser?._id).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs uppercase tracking-[0.25em] text-cyan-200/70 border-b border-white/5 pb-2">
                          Incoming Requests (As Mentor)
                        </h4>
                        {requests
                          .filter((r) => r.mentorId?._id === currentUser?._id)
                          .map((request) => {
                            const showActions = request.status === "pending";
                            return (
                              <div
                                key={request._id}
                                className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20"
                              >
                                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                  <div>
                                    <div className="flex flex-wrap items-center gap-2">
                                      <p className="text-sm font-semibold text-white">
                                        {request.studentId?.name || "Student"}
                                      </p>
                                      {request.studentId?.batch && (
                                        <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] uppercase tracking-[0.2em] text-white/55">
                                          Batch {request.studentId.batch}
                                        </span>
                                      )}
                                    </div>
                                    <p className="mt-2 text-sm leading-6 text-white/65">{request.message}</p>
                                  </div>

                                  <div className="flex flex-col items-end gap-2">
                                    <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold ${
                                      request.status === "accepted"
                                        ? "bg-emerald-400/10 border border-emerald-400/20 text-emerald-200"
                                        : request.status === "rejected"
                                          ? "bg-rose-400/10 border border-rose-400/20 text-rose-200"
                                          : "bg-amber-400/10 border border-amber-400/20 text-amber-200"
                                    }`}>
                                      {request.status}
                                    </span>
                                  </div>
                                </div>

                                {showActions && (
                                  <div className="mt-4 flex flex-wrap gap-2 pt-2 border-t border-white/5">
                                    <button
                                      type="button"
                                      onClick={() => handleStatus(request._id, "accepted")}
                                      className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-cyan-100"
                                    >
                                      Accept
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleStatus(request._id, "rejected")}
                                      className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                                    >
                                      Reject
                                    </button>
                                  </div>
                                )}
                              </div>
                            );
                          })}
                      </div>
                    )}

                    {/* Outgoing requests (where this user is the student) */}
                    {requests.filter((r) => r.studentId?._id === currentUser?._id).length > 0 && (
                      <div className="space-y-3">
                        <h4 className="text-xs uppercase tracking-[0.25em] text-cyan-200/70 border-b border-white/5 pb-2">
                          Sent Requests (As Student)
                        </h4>
                        {requests
                          .filter((r) => r.studentId?._id === currentUser?._id)
                          .map((request) => (
                            <div
                              key={request._id}
                              className="rounded-2xl border border-white/10 bg-black/20 p-5 transition hover:border-white/20"
                            >
                              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                                <div>
                                  <p className="text-sm font-semibold text-white">
                                    To Mentor: {request.mentorId?.name || "Mentor"}
                                  </p>
                                  <p className="mt-2 text-sm leading-6 text-white/65">{request.message}</p>
                                </div>

                                <div className="flex flex-col items-end gap-2">
                                  <span className={`rounded-full px-3 py-1 text-[10px] uppercase tracking-[0.25em] font-semibold ${
                                    request.status === "accepted"
                                      ? "bg-emerald-400/10 border border-emerald-400/20 text-emerald-200"
                                      : request.status === "rejected"
                                        ? "bg-rose-400/10 border border-rose-400/20 text-rose-200"
                                        : "bg-amber-400/10 border border-amber-400/20 text-amber-200"
                                  }`}>
                                    {request.status}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          <aside className="space-y-6">
            <div className={`${shellCard} p-6 md:p-7`}>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Quick facts</p>
              <div className="mt-4 space-y-3 text-sm text-white/70">
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <span>Role</span>
                  <span className="capitalize text-white">{profile.role}</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <span>Batch</span>
                  <span className="text-white">{profile.batch || "N/A"}</span>
                </div>
                <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                  <span>Status</span>
                  <span className="text-white">{profile.isMentor ? "Mentor" : "Member"}</span>
                </div>
              </div>
            </div>

            {!isOwnProfile && profile.isMentor && currentUser && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Request mentorship</p>
                {sent ? (
                  <p className="mt-4 text-sm leading-6 text-white/70">
                    Request sent. {profile.name.split(" ")[0]} will respond soon.
                  </p>
                ) : (
                  <>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={4}
                      placeholder="Introduce yourself and what you'd like guidance on..."
                      className="mt-4 w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-cyan-300/60 focus:bg-white/8"
                    />
                    {reqError && <p className="mt-2 text-sm text-rose-200">{reqError}</p>}
                    <button
                      onClick={handleRequest}
                      className="mt-4 rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
                    >
                      Send request
                    </button>
                  </>
                )}
              </div>
            )}
          </aside>
        </section>
      </div>
    </div>
  );
};

const CODING_PLATFORMS = [
  { key: "leetcode", label: "LeetCode" },
  { key: "codeforces", label: "Codeforces" },
  { key: "github", label: "GitHub" },
];

const buildCodingInsight = (selectedPlatform, codingProfile) => {
  const leet = codingProfile?.leetcode || {};
  const cf = codingProfile?.codeforces || {};
  const gh = codingProfile?.github || {};
  const lastSync = gh.lastSyncedAt || cf.lastSyncedAt || leet.lastSyncedAt || null;

  switch (selectedPlatform) {
    case "codeforces":
      return {
        eyebrow: "Codeforces",
        title: "Contest and problem-solving strength at a glance.",
        description: "Performance is summarized as counts and rating rather than individual submissions.",
        primaryLabel: "Rating",
        primaryValue: cf.rating,
        total: cf.solvedCount,
        accent: "#7CE7B3",
        lastSync,
        handles: [codingProfile?.codeforcesHandle ? `Codeforces: ${codingProfile.codeforcesHandle}` : null].filter(Boolean),
        metrics: [
          { label: "Rating", value: cf.rating },
          { label: "Max rating", value: cf.maxRating },
          { label: "Solved", value: cf.solvedCount },
          { label: "Contests", value: cf.contestHistory?.length },
          { label: "Recent", value: cf.recentSubmissions?.length },
        ],
        maxValue: highestMetricValue([cf.rating, cf.maxRating, cf.solvedCount, cf.contestHistory?.length, cf.recentSubmissions?.length]),
      };
    case "github":
      return {
        eyebrow: "GitHub",
        title: "Contribution activity by engagement signals.",
        description: "A compact tracker for public repo activity and contribution volume.",
        primaryLabel: "Contribs",
        primaryValue: gh.contributions,
        total: gh.contributions,
        accent: "#6BCBFF",
        lastSync,
        handles: [codingProfile?.githubUsername ? `GitHub: ${codingProfile.githubUsername}` : null].filter(Boolean),
        metrics: [
          { label: "Contribs", value: gh.contributions },
          { label: "Projects", value: gh.projects },
          { label: "Repos", value: gh.publicRepos },
          { label: "Followers", value: gh.followers },
          { label: "Following", value: gh.following },
        ],
        maxValue: highestMetricValue([gh.contributions, gh.projects, gh.publicRepos, gh.followers, gh.following]),
      };
    case "leetcode":
    default:
      return {
        eyebrow: "LeetCode",
        title: "Solved problems, broken down by difficulty.",
        description: "A single tracker that shows your solved counts instead of raw activity noise.",
        primaryLabel: "Solved",
        primaryValue: leet.totalSolved,
        total: leet.totalSolved,
        accent: "#FFC857",
        lastSync,
        handles: [codingProfile?.leetcodeUsername ? `LeetCode: ${codingProfile.leetcodeUsername}` : null].filter(Boolean),
        metrics: [
          { label: "Easy", value: leet.easySolved },
          { label: "Medium", value: leet.mediumSolved },
          { label: "Hard", value: leet.hardSolved },
          { label: "Total", value: leet.totalSolved },
          { label: "Rank", value: leet.ranking },
        ],
        maxValue: highestMetricValue([leet.easySolved, leet.mediumSolved, leet.hardSolved, leet.totalSolved, leet.ranking]),
      };
  }
};

const StatPill = ({ label, value }) => (
  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
    <p className="text-xs uppercase tracking-[0.3em] text-cyan-200/70">{label}</p>
    <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
  </div>
);

const BarMetric = ({ metric, accent, maxValue }) => {
  const metricValue = Number(metric.value || 0);
  const width = metricValue <= 0 ? 8 : Math.min(100, Math.max(8, (metricValue / Math.max(maxValue || 1, 1)) * 100));
  return (
    <div>
      <div className="mb-2 flex items-center justify-between gap-4">
        <p className="text-sm font-semibold text-white/90">{metric.label}</p>
        <p className="text-sm text-white/55">{formatCount(metric.value)}</p>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: `linear-gradient(90deg, ${accent}, rgba(255,255,255,0.45))`,
          }}
        />
      </div>
    </div>
  );
};

const formatCount = (value) => (value == null ? "N/A" : String(value));

const highestMetricValue = (values) =>
  values.reduce((max, value) => {
    const numeric = Number(value || 0);
    return numeric > max ? numeric : max;
  }, 1);

const syncAgeLabel = (lastSync) => {
  if (!lastSync) return "Never";
  const syncedAt = new Date(lastSync);
  if (Number.isNaN(syncedAt.getTime())) return "Never";
  const diffMs = Date.now() - syncedAt.getTime();
  const diffMinutes = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  if (diffMinutes < 1) return "Now";
  if (diffMinutes < 60) return `${diffMinutes}m`;
  if (diffHours < 24) return `${diffHours}h`;
  return `${diffDays}d`;
};

export default ProfileView;
