//  codewizards/client/src/pages/ProfileView.js
import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  getUserById,
  createMentorshipRequest,
  getPublicCodingProfile,
  syncCodingProfile,
  getEvents,
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
  const [registeredEvents, setRegisteredEvents] = useState([]);
  const [requests, setRequests] = useState([]);
  const [selectedTopic, setSelectedTopic] = useState("");

  const handleRequest = async () => {
    if (!message.trim()) return setReqError("Please write a message");
    try {
      const finalMessage = selectedTopic 
        ? `[Mentorship Topic: ${selectedTopic}]\n\n${message}`
        : message;
      await createMentorshipRequest({ mentorId: profile._id, message: finalMessage });
      setSent(true);
    } catch (err) {
      setReqError(err.response?.data?.message || "Failed to send request");
    }
  };

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

  useEffect(() => {
    Promise.all([
      getUserById(id),
      getPublicCodingProfile(id).catch(() => ({ data: { data: null } })),
    ])
      .then(([userRes, codingRes]) => {
        const u = userRes.data.data;
        setProfile(u);
        setCodingProfile(codingRes.data.data || null);

        if (u) {
          getEvents({ studentId: id })
            .then((res) => {
              const allEvents = res.data.data || [];
              const registered = allEvents.filter((e) => e.registration?.isRegistered === true);
              setRegisteredEvents(registered);
            })
            .catch(console.error);
        }
      })
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));

    if (isOwnProfile) {
      getMyMentorshipRequests()
        .then((res) => setRequests(res.data.data || []))
        .catch(console.error);
    }
  }, [id, navigate, isOwnProfile]);

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

  const upcomingEvents = registeredEvents.filter((e) => e.status === "upcoming");
  const attendedEvents = registeredEvents.filter((e) => e.status === "completed");

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
                    {profile.name?.charAt(0) || "?"}
                  </div>
                )}

                <div>
                  <div className="flex items-center gap-2">
                    <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">
                      {profile.role?.toUpperCase()} • BATCH {profile.batch || "N/A"}
                    </p>
                    {profile.isVerified && (
                      <span className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-2 py-0.5 text-[9px] uppercase tracking-wider text-cyan-300">
                        ✓ Verified
                      </span>
                    )}
                  </div>
                  <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
                    {profile.name}
                  </h1>
                  {profile.headline && (
                    <p className="mt-2 text-base font-medium text-cyan-100/90">
                      {profile.headline}
                    </p>
                  )}
                  {profile.location && (
                    <p className="mt-1 text-xs text-white/50">
                      📍 {profile.location}
                    </p>
                  )}
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {profile.isMentor && (
                      <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[11px] uppercase tracking-[0.2em] font-semibold ${
                        profile.mentorshipAvailability === "open" ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" :
                        profile.mentorshipAvailability === "limited" ? "bg-amber-500/10 text-amber-300 border-amber-500/20" :
                        "bg-white/5 text-white/40 border-white/10"
                      }`}>
                        <span className={`h-2 w-2 rounded-full ${
                          profile.mentorshipAvailability === "open" ? "bg-emerald-400" :
                          profile.mentorshipAvailability === "limited" ? "bg-amber-400" :
                          "bg-white/30"
                        }`} />
                        {profile.mentorshipAvailability === "open" ? "Open for mentorship" :
                         profile.mentorshipAvailability === "limited" ? "Limited availability" :
                         "Unavailable"}
                      </span>
                    )}
                  </div>
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

        <section className="mt-8 grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="space-y-6">
            {(profile.designation || profile.currentCompany || profile.professionalExperience || profile.canHelpWith?.length > 0) && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Professional Career</p>
                <div className="mt-4">
                  {(profile.designation || profile.currentCompany) && (
                    <h3 className="text-xl font-bold text-white">
                      {profile.designation || "Professional"} {profile.currentCompany ? `at ${profile.currentCompany}` : ""}
                    </h3>
                  )}
                  {(profile.employmentType || profile.workMode || profile.startDateText) && (
                    <p className="mt-1 text-xs text-white/50">
                      {[
                        profile.employmentType,
                        profile.workMode,
                        profile.startDateText ? `Started ${profile.startDateText}` : null
                      ].filter(Boolean).join(" · ")}
                    </p>
                  )}
                  {profile.professionalExperience && (
                    <p className="mt-4 text-sm leading-7 text-white/65 whitespace-pre-line border-t border-white/5 pt-4">
                      {profile.professionalExperience}
                    </p>
                  )}
                  {profile.canHelpWith?.length > 0 && (
                    <div className="mt-6 border-t border-white/5 pt-5">
                      <p className="text-[10px] uppercase tracking-[0.3em] text-white/40 mb-3">I Can Help With</p>
                      <div className="flex flex-wrap gap-2">
                        {profile.canHelpWith.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-xs text-emerald-300 font-medium"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

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

            {/* Experience Section */}
            {profile.experiences?.length > 0 && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Experience</p>
                <div className="mt-6 space-y-6">
                  {profile.experiences.map((exp, idx) => (
                    <div key={idx} className="flex gap-4 border-l border-white/10 pl-5 relative before:content-[''] before:absolute before:left-[-5px] before:top-1.5 before:w-[9px] before:h-[9px] before:rounded-full before:bg-cyan-400">
                      <div className="flex-1 space-y-1">
                        <h4 className="text-base font-bold text-white leading-tight">{exp.title}</h4>
                        <p className="text-sm font-semibold text-cyan-200/90">{exp.company}</p>
                        <p className="text-xs text-white/50">
                          {exp.startDate} – {exp.endDate || "Present"} {exp.location ? `· ${exp.location}` : ""}
                        </p>
                        {exp.description && (
                          <p className="mt-2 text-xs leading-relaxed text-white/60 whitespace-pre-line">
                            {exp.description}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Education Section */}
            {profile.education?.length > 0 && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Education</p>
                <div className="mt-6 space-y-6">
                  {profile.education.map((edu, idx) => (
                    <div key={idx} className="flex gap-4 border-l border-white/10 pl-5 relative before:content-[''] before:absolute before:left-[-5px] before:top-1.5 before:w-[9px] before:h-[9px] before:rounded-full before:bg-indigo-400">
                      <div className="flex-1 space-y-0.5">
                        <h4 className="text-base font-bold text-white leading-tight">{edu.school}</h4>
                        <p className="text-sm font-semibold text-white/80">
                          {edu.degree} {edu.fieldOfStudy ? `in ${edu.fieldOfStudy}` : ""}
                        </p>
                        <p className="text-xs text-white/50">
                          {edu.startDate} – {edu.endDate}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Certifications Section */}
            {profile.certifications?.length > 0 && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Licenses & Certifications</p>
                <div className="mt-6 space-y-4">
                  {profile.certifications.map((cert, idx) => (
                    <div key={idx} className="flex items-start justify-between gap-4 rounded-2xl border border-white/5 bg-black/10 p-4">
                      <div className="space-y-1">
                        <h4 className="text-sm font-bold text-white">{cert.name}</h4>
                        <p className="text-xs text-white/70">{cert.issuer}</p>
                        <p className="text-[10px] text-white/45">Issued {cert.issueDate}</p>
                      </div>
                      {cert.credentialUrl && (
                        <a
                          href={cert.credentialUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="rounded-full bg-white/5 border border-white/10 px-3  py-1.5 text-xs text-cyan-300 font-semibold hover:bg-white/10"
                        >
                          View Credential
                        </a>
                      )}
                    </div>
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
                              ? "bg-white text-black"
                              : "border-white/10 bg-black/20 text-white/75 hover:border-white/20 hover:bg-white/8"
                          }`}
                        >
                          {platform.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {codingInsight && (
                  <div className="mt-8 border-t border-white/10 pt-8">
                    <div className="grid gap-8 xl:grid-cols-2">
                      <div>
                        <span
                          className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5 text-xs font-semibold tracking-wide"
                          style={{ color: codingInsight.accent }}
                        >
                          {codingInsight.eyebrow}
                        </span>
                        <h4 className="mt-5 text-xl font-bold text-white">{codingInsight.title}</h4>
                        <p className="mt-2 text-sm leading-6 text-white/65">{codingInsight.description}</p>

                        <div className="mt-6 flex flex-wrap gap-4 text-xs text-white/50">
                          {codingInsight.handles.map((h) => (
                            <span key={h} className="rounded-full border border-white/5 bg-white/4 px-3 py-1">
                              {h}
                            </span>
                          ))}
                          <span className="rounded-full border border-white/5 bg-white/4 px-3 py-1">
                            Synced: {syncAgeLabel(codingInsight.lastSync)}
                          </span>
                        </div>

                        {isOwnProfile && (
                          <button
                            onClick={refreshCodingProfile}
                            disabled={syncing}
                            className="mt-6 rounded-full border border-white/15 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-50"
                          >
                            {syncing ? "Syncing..." : "Sync Stats"}
                          </button>
                        )}
                        {syncError && <p className="mt-2 text-xs text-rose-300">{syncError}</p>}
                      </div>

                      <div>
                        <div className="mb-6 grid gap-4 sm:grid-cols-2">
                          <StatPill label={codingInsight.primaryLabel} value={formatCount(codingInsight.primaryValue)} />
                          <StatPill label="Platforms Synced" value={hasCodingData ? "Active" : "None"} />
                        </div>

                        <div className="space-y-4">
                          {codingInsight.metrics
                            .filter((m) => m.label !== codingInsight.primaryLabel)
                            .map((metric) => (
                              <BarMetric
                                key={metric.label}
                                metric={metric}
                                accent={codingInsight.accent}
                                maxValue={codingInsight.maxValue}
                              />
                            ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Mentorship Requests Card (only for own profile if they have requests) */}
            {isOwnProfile && requests.length > 0 && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <div className="mb-6 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.3em] text-white/45">Mentorship</p>
                    <h2 className="mt-2 text-2xl font-semibold text-white">Mentorship requests</h2>
                  </div>
                  <p className="text-xs uppercase tracking-[0.22em] text-white/35">{requests.length} items</p>
                </div>

                <div className="space-y-3">
                  {requests.map((request) => (
                    <div
                      key={request._id}
                      className="rounded-2xl border border-white/10 bg-black/35 p-4 transition-all duration-300 hover:border-white/20"
                    >
                      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-2">
                            <p className="text-sm font-semibold text-white">
                              {request.studentId?.name || "Student"}
                            </p>
                            {request.studentId?.batch && (
                              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] uppercase tracking-[0.2em] text-white/55">
                                Batch {request.studentId.batch}
                              </span>
                            )}
                          </div>
                          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/65">{request.message}</p>
                        </div>

                        <span className={`rounded-full px-3 py-1 text-[11px] uppercase tracking-[0.25em] font-semibold ${
                          request.status === "accepted" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                          request.status === "rejected" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                          "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                        }`}>
                          {request.status}
                        </span>
                      </div>

                      {request.status === "pending" && (
                        <div className="mt-4 flex flex-wrap gap-2">
                          <button
                            onClick={() => handleStatus(request._id, "accepted")}
                            className="rounded-full bg-white px-4 py-2 text-xs font-semibold text-black transition hover:bg-cyan-100"
                          >
                            Accept
                          </button>
                          <button
                            onClick={() => handleStatus(request._id, "rejected")}
                            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white/75 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* My Events Widget (for all profiles) */}
            {profile && (
              <div className={`${shellCard} p-6 md:p-7`}>
                <div className="flex items-center justify-between gap-4 mb-6">
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">My Events</p>
                  <Link to="/events" className="text-xs text-cyan-300 hover:underline">Explore Events</Link>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  {/* Upcoming Events */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Upcoming ({upcomingEvents.length})</h4>
                    {upcomingEvents.length === 0 ? (
                      <p className="text-xs text-white/40 bg-white/5 rounded-2xl p-4">No upcoming events registered.</p>
                    ) : (
                      <div className="space-y-3">
                        {upcomingEvents.map((event) => (
                          <div key={event._id} className="rounded-2xl border border-white/10 bg-black/25 p-4 flex flex-col gap-2">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 rounded-full px-2 py-0.5">Going</span>
                              <span className="text-[10px] text-white/40 uppercase">{event.type}</span>
                            </div>
                            <h5 className="text-sm font-bold text-white line-clamp-1">{event.title}</h5>
                            <p className="text-xs text-white/50">{new Date(event.date).toLocaleDateString()} at {event.venue || "Online"}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Attended Events */}
                  <div>
                    <h4 className="text-sm font-semibold text-white mb-3">Attended ({attendedEvents.length})</h4>
                    {attendedEvents.length === 0 ? (
                      <p className="text-xs text-white/40 bg-white/5 rounded-2xl p-4">No completed events attended yet.</p>
                    ) : (
                      <div className="space-y-3">
                        {attendedEvents.map((event) => (
                          <div key={event._id} className="rounded-2xl border border-white/10 bg-black/10 p-4 flex flex-col gap-1 opacity-70">
                            <h5 className="text-sm font-bold text-white line-clamp-1">{event.title}</h5>
                            <p className="text-xs text-white/45">{new Date(event.date).toLocaleDateString()}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
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
                    <div className="mt-4 space-y-4">
                      <div className="rounded-2xl bg-white/5 p-4 border border-white/5">
                        <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 mb-1.5">Availability Settings</p>
                        <p className="text-xs text-white/80">Response time: {profile.typicalResponseTime || "1-3 days"}</p>
                        <p className="text-xs text-white/80 mt-1">Accepting students limit: {profile.maxActiveStudents ?? 3}</p>
                        <p className="text-xs text-cyan-300 mt-1 capitalize">Preferred contact: {profile.preferredContactMethod || "LinkedIn"}</p>
                      </div>

                      {profile.canHelpWith?.length > 0 && (
                        <div className="flex flex-col gap-1.5">
                          <label className="text-[10px] uppercase tracking-[0.25em] text-white/45">Select Guidance Topic</label>
                          <select
                            value={selectedTopic}
                            onChange={(e) => setSelectedTopic(e.target.value)}
                            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60 focus:bg-white/8"
                          >
                            <option value="" className="bg-black">Choose a topic...</option>
                            {profile.canHelpWith.map((topic) => (
                              <option key={topic} value={topic} className="bg-black">{topic}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>

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
                      className="mt-4 w-full rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
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
