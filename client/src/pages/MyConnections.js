// codewizards/client/src/pages/MyConnections.js
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { getMyMentors, getMyMentees, getMentorshipContact } from "../services/api";
import { Link } from "react-router-dom";

const shellCard =
  "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:border-white/20";

const MyConnections = () => {
  const { user } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [mentees, setMentees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  
  // Expanded connection card to view details
  const [expandedId, setExpandedId] = useState(null);
  const [contacts, setContacts] = useState({});
  const [loadingContacts, setLoadingContacts] = useState({});

  useEffect(() => {
    const fetchConnections = async () => {
      try {
        if (user?.role === "student") {
          const res = await getMyMentors();
          setMentors(res.data.data || []);
        } else {
          // Fetch both since seniors/alumni/admins can be both mentors and mentees
          const [mentorsRes, menteesRes] = await Promise.all([
            getMyMentors().catch(() => ({ data: { data: [] } })),
            getMyMentees().catch(() => ({ data: { data: [] } })),
          ]);
          setMentors(mentorsRes.data.data || []);
          setMentees(menteesRes.data.data || []);
        }
      } catch (err) {
        setError(err.response?.data?.message || "Failed to load connections");
      } finally {
        setLoading(false);
      }
    };
    fetchConnections();
  }, [user]);

  const handleToggleExpand = async (connId) => {
    if (expandedId === connId) {
      setExpandedId(null);
      return;
    }

    setExpandedId(connId);

    // Fetch contact details if not already loaded
    if (!contacts[connId]) {
      setLoadingContacts((prev) => ({ ...prev, [connId]: true }));
      try {
        const res = await getMentorshipContact(connId);
        setContacts((prev) => ({ ...prev, [connId]: res.data.data || {} }));
      } catch (err) {
        console.error("Failed to load connection contacts:", err);
      } finally {
        setLoadingContacts((prev) => ({ ...prev, [connId]: false }));
      }
    }
  };

  const renderConnectionCard = (conn, isMentorCard) => {
    const targetUser = isMentorCard ? conn.mentorId : conn.studentId;
    if (!targetUser) return null;

    const isExpanded = expandedId === conn._id;
    const hasBio = !!targetUser.bio;
    const connContacts = contacts[conn._id] || {};
    const isLoadingC = loadingContacts[conn._id];

    return (
      <div key={conn._id} className={`${shellCard} overflow-hidden`}>
        <div className="p-6 md:p-7">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
            <div className="flex items-start gap-4">
              {targetUser.imageUrl ? (
                <img
                  src={targetUser.imageUrl}
                  alt={targetUser.name}
                  className="h-16 w-16 rounded-2xl border border-white/10 object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-cyan-400 to-indigo-500 text-xl font-bold text-black">
                  {targetUser.name.charAt(0)}
                </div>
              )}
              <div>
                <h3 className="text-lg font-semibold text-white">{targetUser.name}</h3>
                <p className="text-xs text-white/55 mt-1">
                  {isMentorCard ? "Mentor" : "Student"}
                  {targetUser.domain && targetUser.domain.length > 0 && (
                    <>
                      <span className="mx-2">·</span>
                      {targetUser.domain.slice(0, 3).join(", ")}
                    </>
                  )}
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {targetUser.linkedin && (
                    <a
                      href={targetUser.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 hover:border-white/20 hover:text-white"
                    >
                      LinkedIn
                    </a>
                  )}
                  {targetUser.github && (
                    <a
                      href={targetUser.github}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-white/70 hover:border-white/20 hover:text-white"
                    >
                      GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Link
                to={`/profile/${targetUser._id}`}
                className="rounded-full border border-white/10 bg-white/5 px-4 py-2.5 text-xs font-semibold text-white/80 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
              >
                View Profile
              </Link>
              <button
                onClick={() => handleToggleExpand(conn._id)}
                className="rounded-full bg-white px-4 py-2.5 text-xs font-semibold text-black transition hover:bg-cyan-100"
              >
                {isExpanded ? "Hide Details" : "View Details"}
              </button>
            </div>
          </div>

          {isExpanded && (
            <div className="mt-6 border-t border-white/10 pt-6">
              {hasBio && (
                <div className="mb-5">
                  <p className="text-[10px] uppercase tracking-[0.25em] text-white/45">Biography</p>
                  <p className="mt-2 text-sm leading-6 text-white/70">{targetUser.bio}</p>
                </div>
              )}

              {/* Mentee stats if available */}
              {!isMentorCard && targetUser.externalStats && (
                <div className="mb-5 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">LeetCode Solved</p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {targetUser.externalStats.leetcodeSolveScore ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">Codeforces Rating</p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {targetUser.externalStats.codeforcesRating ?? "N/A"}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <p className="text-[10px] uppercase tracking-[0.2em] text-cyan-200/70">GitHub Contributions</p>
                    <p className="mt-2 text-xl font-semibold text-white">
                      {targetUser.externalStats.githubContributions ?? "N/A"}
                    </p>
                  </div>
                </div>
              )}

              <div>
                <p className="text-[10px] uppercase tracking-[0.25em] text-white/45 mb-3">Shared Contact Information</p>
                {isLoadingC ? (
                  <p className="text-sm text-white/40">Loading contact information...</p>
                ) : Object.keys(connContacts).length === 0 ? (
                  <p className="text-sm text-white/40">
                    No private contact details are currently shared by this user.
                  </p>
                ) : (
                  <div className="grid gap-3 sm:grid-cols-2">
                    {connContacts.email && (
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-[10px] text-white/40 uppercase">Email Address</p>
                        <a href={`mailto:${connContacts.email}`} className="text-sm text-cyan-200 font-semibold block mt-1 hover:underline">
                          {connContacts.email}
                        </a>
                      </div>
                    )}
                    {connContacts.phone && (
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-[10px] text-white/40 uppercase">Phone Number</p>
                        <p className="text-sm text-white font-semibold mt-1">{connContacts.phone}</p>
                      </div>
                    )}
                    {connContacts.whatsapp && (
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-[10px] text-white/40 uppercase">WhatsApp</p>
                        <p className="text-sm text-white font-semibold mt-1">{connContacts.whatsapp}</p>
                      </div>
                    )}
                    {connContacts.discord && (
                      <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
                        <p className="text-[10px] text-white/40 uppercase">Discord</p>
                        <p className="text-sm text-white font-semibold mt-1">{connContacts.discord}</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const hasConnections = mentors.length > 0 || mentees.length > 0;

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-black px-4 py-24 text-center text-white/55">
        Loading connections...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-12 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-8 top-28 h-72 w-72 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <div className="mb-8">
          <p className="text-[11px] uppercase tracking-[0.35em] text-cyan-200/70">Mentorship</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight md:text-4xl">
            My Connections
          </h1>
          <p className="mt-3 max-w-3xl text-sm leading-6 text-white/60">
            View active mentorship connections. Click on any contact card to reveal shared communication channels like Email, Phone, WhatsApp, and Discord.
          </p>
        </div>

        {error && (
          <div className={`${shellCard} border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100 mb-6`}>
            {error}
          </div>
        )}

        {!hasConnections ? (
          <div className={`${shellCard} p-8 text-center text-white/55`}>
            <p className="text-base">No active connections found.</p>
            <p className="mt-2 text-sm text-white/40">
              Active connections will appear here once incoming requests are approved or when your sent requests are accepted.
            </p>
            <Link
              to="/connect"
              className="mt-5 inline-block rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100"
            >
              Explore Directory
            </Link>
          </div>
        ) : (
          <div className="space-y-10">
            {mentors.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.3em] text-cyan-200/70 border-b border-white/10 pb-2">
                  My Mentors ({mentors.length})
                </h2>
                <div className="grid gap-6">
                  {mentors.map((conn) => renderConnectionCard(conn, true))}
                </div>
              </div>
            )}

            {mentees.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-xs uppercase tracking-[0.3em] text-cyan-200/70 border-b border-white/10 pb-2">
                  My Mentees ({mentees.length})
                </h2>
                <div className="grid gap-6">
                  {mentees.map((conn) => renderConnectionCard(conn, false))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyConnections;
