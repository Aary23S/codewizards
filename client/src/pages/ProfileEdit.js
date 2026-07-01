import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getUserById,
  updateUser,
  syncCodeforces,
  syncLeetcode,
  syncGithub,
} from "../services/api";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";

const DOMAIN_OPTIONS = [
  "Web",
  "AI",
  "Machine Learning",
  "Flutter",
  "Backend",
  "Cyber Security",
  "Competitive Programming",
  "Research",
  "Open Source",
  "App Dev",
];

const shellCard =
  "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]";

const ProfileEdit = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    bio: "",
    github: "",
    linkedin: "",
    leetcode: "",
    codeforces: "",
    portfolio: "",
    domain: [],
    isMentor: false,
    codeforcesHandle: "",
    leetcodeUsername: "",
    githubUsername: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [syncStatus, setSyncStatus] = useState({
    codeforces: "",
    leetcode: "",
    github: "",
  });

  const [syncing, setSyncing] = useState({
    codeforces: false,
    leetcode: false,
    github: false,
  });

  useEffect(() => {
    if (currentUser && currentUser._id !== id) {
      navigate("/");
      return;
    }

    getUserById(id)
      .then((res) => {
        const u = res.data.data;

        setForm({
          name: u.name || "",
          bio: u.bio || "",
          github: u.github || "",
          linkedin: u.linkedin || "",
          leetcode: u.leetcode || "",
          codeforces: u.codeforces || "",
          portfolio: u.portfolio || "",
          domain: Array.isArray(u.domain) ? u.domain : [],
          isMentor: !!u.isMentor,
          codeforcesHandle: u.codeforcesHandle || u.externalStats?.codeforces?.handle || "",
          leetcodeUsername: u.leetcodeUsername || u.externalStats?.leetcode?.username || "",
          githubUsername: u.githubUsername || u.externalStats?.github?.username || "",
        });
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [id, currentUser, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleDomain = (domain) => {
    setForm((prev) => ({
      ...prev,
      domain: prev.domain.includes(domain)
        ? prev.domain.filter((item) => item !== domain)
        : [...prev.domain, domain],
    }));
  };

  const handleSync = async (platform, syncFn, handleKey) => {
    const handle = form[handleKey];

    if (!handle?.trim()) {
      setSyncStatus((prev) => ({ ...prev, [platform]: "Enter a username first" }));
      return;
    }

    setSyncing((prev) => ({ ...prev, [platform]: true }));
    setSyncStatus((prev) => ({ ...prev, [platform]: "" }));

    try {
      await syncFn(handle.trim());
      setSyncStatus((prev) => ({ ...prev, [platform]: "✓ Synced successfully" }));
    } catch (err) {
      setSyncStatus((prev) => ({
        ...prev,
        [platform]: err.response?.data?.message || "Sync failed",
      }));
    } finally {
      setSyncing((prev) => ({ ...prev, [platform]: false }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      await updateUser(id, form);
      navigate(`/profile/${id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[70vh] bg-[#050816] px-4 py-24 text-center text-white/55">
        Loading...
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-black px-4 py-12 text-white md:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-0 top-12 h-56 w-56 rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute right-8 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-6xl">
        <section className={`${shellCard} overflow-hidden`}>
          <div className="px-6 py-8 md:px-8 md:py-10">
            <p className="text-[11px] uppercase tracking-[0.4em] text-cyan-200/70">Your profile</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight md:text-5xl">Edit Profile</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/65 md:text-base">
              Keep your identity, domains, social links, and competition handles current without changing the existing data flow.
            </p>
          </div>
        </section>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          <section className={`${shellCard} p-6 md:p-7`}>
            <div className="grid gap-5">
              <FormInput
                label="Full Name"
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                required
              />

              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={form.bio}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Tell others about yourself..."
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-cyan-300/60 focus:bg-white/8"
                />
              </div>
            </div>
          </section>

          <section className={`${shellCard} p-6 md:p-7`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Domains</p>
                <p className="mt-2 text-sm text-white/60">Choose the areas that best represent your work.</p>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {DOMAIN_OPTIONS.map((domain) => (
                <button
                  key={domain}
                  type="button"
                  onClick={() => toggleDomain(domain)}
                  className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.25em] transition ${
                    form.domain.includes(domain)
                      ? "border-white bg-white text-black"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  {domain}
                </button>
              ))}
            </div>
          </section>

          <section className={`${shellCard} p-6 md:p-7`}>
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isMentor"
                checked={form.isMentor}
                onChange={(e) => setForm({ ...form, isMentor: e.target.checked })}
                className="h-4 w-4 accent-cyan-300"
              />
              <label htmlFor="isMentor" className="text-sm text-white/75">
                I&apos;m open to mentoring juniors
              </label>
            </div>
          </section>

          <section className={`${shellCard} p-6 md:p-7`}>
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Platform links</p>
                <p className="mt-2 text-sm text-white/60">Add public links for discovery and profile visibility.</p>
              </div>
            </div>

            <div className="mt-5 grid gap-4">
              <FormInput label="GitHub URL" type="url" name="github" value={form.github} onChange={handleChange} placeholder="https://github.com/username" />
              <FormInput label="LinkedIn URL" type="url" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
              <FormInput label="LeetCode URL" type="url" name="leetcode" value={form.leetcode} onChange={handleChange} placeholder="https://leetcode.com/username" />
              <FormInput label="Codeforces URL" type="url" name="codeforces" value={form.codeforces} onChange={handleChange} placeholder="https://codeforces.com/profile/username" />
              <FormInput label="Portfolio URL" type="url" name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="https://yourportfolio.com" />
            </div>
          </section>

          <section className={`${shellCard} p-6 md:p-7`}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Sync competitive stats</p>
              <p className="mt-2 text-sm text-white/60">
                Connect your profiles to count toward the leaderboard. Re-sync anytime to update your stats.
              </p>
            </div>

            <div className="mt-6 space-y-5">
              {[
                {
                  label: "Codeforces Handle",
                  name: "codeforcesHandle",
                  placeholder: "tourist",
                  syncKey: "codeforces",
                  syncFn: syncCodeforces,
                },
                {
                  label: "LeetCode Username",
                  name: "leetcodeUsername",
                  placeholder: "your_username",
                  syncKey: "leetcode",
                  syncFn: syncLeetcode,
                },
                {
                  label: "GitHub Username",
                  name: "githubUsername",
                  placeholder: "octocat",
                  syncKey: "github",
                  syncFn: syncGithub,
                },
              ].map((item) => (
                <div key={item.name} className="space-y-2">
                  <label className="text-xs uppercase tracking-[0.3em] text-white/45">{item.label}</label>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <input
                      name={item.name}
                      value={form[item.name] || ""}
                      onChange={handleChange}
                      placeholder={item.placeholder}
                      className="flex-1 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-cyan-300/60 focus:bg-white/8"
                    />
                    <button
                      type="button"
                      onClick={() => handleSync(item.syncKey, item.syncFn, item.name)}
                      disabled={syncing[item.syncKey]}
                      className="rounded-full border border-white/10 bg-white/5 px-5 py-3 text-xs uppercase tracking-[0.3em] text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white disabled:opacity-40"
                    >
                      {syncing[item.syncKey] ? "Syncing..." : "Sync"}
                    </button>
                  </div>

                  {syncStatus[item.syncKey] && (
                    <p
                      className={`text-xs ${
                        syncStatus[item.syncKey].startsWith("✓") ? "text-emerald-200" : "text-rose-200"
                      }`}
                    >
                      {syncStatus[item.syncKey]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {error && (
            <div className={`${shellCard} border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100`}>
              {error}
            </div>
          )}

          <section className="flex flex-wrap gap-3 pb-4">
            <button
              type="submit"
              disabled={saving}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:opacity-50"
            >
              {saving ? "Saving..." : "Save Changes"}
            </button>
            <button
              type="button"
              onClick={() => navigate(`/profile/${id}`)}
              className="rounded-full border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white/70 transition hover:border-white/20 hover:bg-white/10 hover:text-white"
            >
              Cancel
            </button>
          </section>
        </form>
      </div>
    </div>
  );
};

export default ProfileEdit;
