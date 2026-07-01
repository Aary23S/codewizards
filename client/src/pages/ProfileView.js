import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { getUserById, createMentorshipRequest } from "../services/api";
import { useAuth } from "../context/AuthContext";

const shellCard =
  "rounded-[28px] border border-white/10 bg-white/[0.03] shadow-[0_12px_36px_rgba(0,0,0,0.18)]";

const ProfileView = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [sent, setSent] = useState(false);
  const [reqError, setReqError] = useState("");

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
    getUserById(id)
      .then((res) => setProfile(res.data.data))
      .catch(() => navigate("/"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#050816] px-4 py-24 text-center text-white/55">
        Loading...
      </div>
    );
  }

  if (!profile) return null;

  const isOwnProfile = currentUser?._id === id;
  const profileImage = profile.image || profile.avatar || profile.photo || "";

  const platformLinks = [
    { label: "GitHub", url: profile.github },
    { label: "LinkedIn", url: profile.linkedin },
    { label: "LeetCode", url: profile.leetcode },
    { label: "Codeforces", url: profile.codeforces },
    { label: "Portfolio", url: profile.portfolio },
  ].filter((item) => item.url);

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#050816] px-4 py-12 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-[-8%] top-0 h-72 w-72 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute right-[-8%] top-[18%] h-80 w-80 rounded-full bg-indigo-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className={`${shellCard} overflow-hidden`}>
          <div className="bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.08),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(99,102,241,0.06),transparent_35%)] px-6 py-8 md:px-8 md:py-10">
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

export default ProfileView;
