// codewizards/client/src/pages/ProfileEdit.js
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  // getUserById,
  updateUser,
  connectCodingProfile,
  syncCodeforces,
  syncLeetcode,
  syncGithub,
  getMe,
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

const HELP_TOPICS = [
  "DSA & Competitive Programming",
  "Web Development",
  "App Development",
  "AI/ML",
  "Backend Development",
  "Project Guidance",
  "Resume Review",
  "Interview Preparation",
  "Internship Preparation",
  "Career Guidance",
  "Higher Studies",
  "Entrepreneurship"
];

const shellCard =
  "group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]";

const ProfileEdit = () => {
  const { id } = useParams();
  const { user: currentUser, reloadUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "",
    batch: "",
    bio: "",
    currentCompany: "",
    designation: "",
    professionalExperience: "",
    location: "",
    headline: "",
    isVerified: false,
    employmentType: "",
    workMode: "",
    startDateText: "",
    canHelpWith: [],
    mentorshipAvailability: "open",
    maxActiveStudents: 3,
    typicalResponseTime: "1-3 days",
    preferredContactMethod: "linkedin",
    github: "",
    linkedin: "",
    leetcode: "",
    codeforces: "",
    portfolio: "",
    domain: [],
    isMentor: false,
    experiences: [],
    education: [],
    certifications: [],
    codeforcesHandle: "",
    leetcodeUsername: "",
    githubUsername: "",
    phone: "",
    whatsapp: "",
    discord: "",
    contactPreferences: {
      email: true,
      phone: false,
      whatsapp: false,
      discord: false,
    },
  });
  const [imagePreview, setImagePreview] = useState("");
  const [imageFile, setImageFile] = useState(null);

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

    getMe()
      .then((res) => {
        const u = res.data.data;

        setForm({
          name: u.name || "",
          batch: u.batch ?? "",
          bio: u.bio || "",
          currentCompany: u.currentCompany || "",
          designation: u.designation || "",
          professionalExperience: u.professionalExperience || "",
          location: u.location || "",
          headline: u.headline || "",
          isVerified: !!u.isVerified,
          employmentType: u.employmentType || "",
          workMode: u.workMode || "",
          startDateText: u.startDateText || "",
          canHelpWith: Array.isArray(u.canHelpWith) ? u.canHelpWith : [],
          mentorshipAvailability: u.mentorshipAvailability || "open",
          maxActiveStudents: u.maxActiveStudents ?? 3,
          typicalResponseTime: u.typicalResponseTime || "1-3 days",
          preferredContactMethod: u.preferredContactMethod || "linkedin",
          github: u.github || "",
          linkedin: u.linkedin || "",
          leetcode: u.leetcode || "",
          codeforces: u.codeforces || "",
          portfolio: u.portfolio || "",
          domain: Array.isArray(u.domain) ? u.domain : [],
          isMentor: !!u.isMentor,
          experiences: Array.isArray(u.experiences) ? u.experiences : [],
          education: Array.isArray(u.education) ? u.education : [],
          certifications: Array.isArray(u.certifications) ? u.certifications : [],
          codeforcesHandle: u.codeforcesHandle || u.externalStats?.codeforces?.handle || "",
          leetcodeUsername: u.leetcodeUsername || u.externalStats?.leetcode?.username || "",
          githubUsername: u.githubUsername || u.externalStats?.github?.username || "",
          phone: u.phone || "",
          whatsapp: u.whatsapp || "",
          discord: u.discord || "",
          contactPreferences: u.contactPreferences || {
            email: true,
            phone: false,
            whatsapp: false,
            discord: false,
          },
        });
        setImagePreview(u.imageUrl || "");
        setImageFile(null);
      })
      .catch((err) => {
        setError(err.response?.data?.message || "Failed to load profile");
      })
      .finally(() => setLoading(false));
  }, [id, currentUser, navigate]);

  useEffect(() => {
    return () => {
      if (imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }
    };
  }, [imagePreview]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (imagePreview?.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }

    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const toggleDomain = (domain) => {
    setForm((prev) => ({
      ...prev,
      domain: prev.domain.includes(domain)
        ? prev.domain.filter((item) => item !== domain)
        : [...prev.domain, domain],
    }));
  };

  const toggleHelpTopic = (topic) => {
    setForm((prev) => ({
      ...prev,
      canHelpWith: prev.canHelpWith.includes(topic)
        ? prev.canHelpWith.filter((item) => item !== topic)
        : [...prev.canHelpWith, topic],
    }));
  };

  const addExperience = () => {
    setForm((prev) => ({
      ...prev,
      experiences: [...prev.experiences, { title: "", company: "", location: "", startDate: "", endDate: "", description: "" }],
    }));
  };
  const updateExperience = (index, field, value) => {
    setForm((prev) => {
      const list = [...prev.experiences];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, experiences: list };
    });
  };
  const removeExperience = (index) => {
    setForm((prev) => ({
      ...prev,
      experiences: prev.experiences.filter((_, i) => i !== index),
    }));
  };

  const addEducation = () => {
    setForm((prev) => ({
      ...prev,
      education: [...prev.education, { school: "", degree: "", fieldOfStudy: "", startDate: "", endDate: "" }],
    }));
  };
  const updateEducation = (index, field, value) => {
    setForm((prev) => {
      const list = [...prev.education];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, education: list };
    });
  };
  const removeEducation = (index) => {
    setForm((prev) => ({
      ...prev,
      education: prev.education.filter((_, i) => i !== index),
    }));
  };

  const addCertification = () => {
    setForm((prev) => ({
      ...prev,
      certifications: [...prev.certifications, { name: "", issuer: "", issueDate: "", credentialUrl: "" }],
    }));
  };
  const updateCertification = (index, field, value) => {
    setForm((prev) => {
      const list = [...prev.certifications];
      list[index] = { ...list[index], [field]: value };
      return { ...prev, certifications: list };
    });
  };
  const removeCertification = (index) => {
    setForm((prev) => ({
      ...prev,
      certifications: prev.certifications.filter((_, i) => i !== index),
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
      const formData = new FormData();
      Object.entries(form).forEach(([key, value]) => {
        if (key === "domain") {
          formData.append(key, Array.isArray(value) ? value.join(", ") : "");
          return;
        }
        if (key === "canHelpWith") {
          formData.append(key, Array.isArray(value) ? value.join(", ") : "");
          return;
        }
        if (key === "contactPreferences" || key === "experiences" || key === "education" || key === "certifications") {
          formData.append(key, JSON.stringify(value));
          return;
        }
        if (value === null || value === undefined) return;
        if (typeof value === "boolean") {
          formData.append(key, String(value));
          return;
        }
        formData.append(key, String(value));
      });
      if (imageFile) {
        formData.append("image", imageFile);
      }

      const res = await updateUser(id, formData);
      await connectCodingProfile({
        leetcodeUsername: form.leetcodeUsername || "",
        codeforcesHandle: form.codeforcesHandle || "",
        githubUsername: form.githubUsername || "",
      }).catch(() => { });

      if (res?.data?.data?.imageUrl) {
        setImagePreview(res.data.data.imageUrl);
      }

      await reloadUser();
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
              <div className="grid gap-4 md:grid-cols-[auto,1fr] md:items-center">
                <div className="h-20 w-20 overflow-hidden rounded-3xl border border-white/10 bg-white/5">
                  {imagePreview ? (
                    <img src={imagePreview} alt={form.name || "Profile"} className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-white/8 text-2xl font-semibold text-white/60">
                      {(form.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Profile image</p>
                  <p className="mt-2 text-sm text-white/60">
                    Upload an image from your device. The backend will store it and reuse the same avatar across web and mobile.
                  </p>
                </div>
              </div>

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
                  Upload Image
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white file:mr-4 file:rounded-full file:border-0 file:bg-white file:px-4 file:py-2 file:text-xs file:font-semibold file:text-black hover:file:bg-cyan-100"
                />
              </div>

              <FormInput
                label="Batch Year"
                type="number"
                name="batch"
                value={form.batch}
                onChange={handleChange}
                placeholder="2026"
                min={2000}
                max={new Date().getFullYear() + 10}
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
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Professional Career</p>
              <p className="mt-2 text-sm text-white/60">
                Share your current company, designation, and professional background so juniors can seek guidance.
              </p>
            </div>
            <div className="mt-5 grid gap-4">
              <FormInput
                label="Professional Headline"
                type="text"
                name="headline"
                value={form.headline}
                onChange={handleChange}
                placeholder="e.g. Full-Stack Development | AI | Backend"
              />
              <FormInput
                label="Location"
                type="text"
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Pune, India"
              />
              <div className="grid gap-4 sm:grid-cols-2">
                <FormInput
                  label="Current Designation"
                  type="text"
                  name="designation"
                  value={form.designation}
                  onChange={handleChange}
                  placeholder="e.g. Software Engineer II"
                />
                <FormInput
                  label="Current Company"
                  type="text"
                  name="currentCompany"
                  value={form.currentCompany}
                  onChange={handleChange}
                  placeholder="e.g. Google / Microsoft"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                    Employment Type
                  </label>
                  <select
                    name="employmentType"
                    value={form.employmentType}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60 focus:bg-white/8"
                  >
                    <option value="" className="bg-black">Select type...</option>
                    <option value="Full-time" className="bg-black">Full-time</option>
                    <option value="Part-time" className="bg-black">Part-time</option>
                    <option value="Internship" className="bg-black">Internship</option>
                    <option value="Contract" className="bg-black">Contract</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                    Work Mode
                  </label>
                  <select
                    name="workMode"
                    value={form.workMode}
                    onChange={handleChange}
                    className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60 focus:bg-white/8"
                  >
                    <option value="" className="bg-black">Select mode...</option>
                    <option value="Remote" className="bg-black">Remote</option>
                    <option value="Hybrid" className="bg-black">Hybrid</option>
                    <option value="On-site" className="bg-black">On-site</option>
                  </select>
                </div>
                <FormInput
                  label="Start Date"
                  type="text"
                  name="startDateText"
                  value={form.startDateText}
                  onChange={handleChange}
                  placeholder="e.g. Aug 2026"
                />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                  Professional Experience / Work History
                </label>
                <textarea
                  name="professionalExperience"
                  value={form.professionalExperience}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Share a brief overview of your internships, work history, tech stacks, or guidance topics..."
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
                  className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.25em] transition ${form.domain.includes(domain)
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
              <label htmlFor="isMentor" className="text-sm font-semibold text-white/75">
                I&apos;m open to mentoring juniors
              </label>
            </div>

            {form.isMentor && (
              <div className="mt-6 border-t border-white/10 pt-5 space-y-5">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                      Mentorship Availability
                    </label>
                    <select
                      name="mentorshipAvailability"
                      value={form.mentorshipAvailability}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60 focus:bg-white/8"
                    >
                      <option value="open" className="bg-black">🟢 Open for mentorship</option>
                      <option value="limited" className="bg-black">🟡 Limited availability</option>
                      <option value="unavailable" className="bg-black">⚪ Currently unavailable</option>
                    </select>
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-[0.35em] text-white/50">
                      Preferred Connection Method
                    </label>
                    <select
                      name="preferredContactMethod"
                      value={form.preferredContactMethod}
                      onChange={handleChange}
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white outline-none focus:border-cyan-300/60 focus:bg-white/8"
                    >
                      <option value="linkedin" className="bg-black">LinkedIn Profile</option>
                      <option value="email" className="bg-black">Professional Email</option>
                      <option value="whatsapp" className="bg-black">WhatsApp Chat</option>
                      <option value="discord" className="bg-black">Discord Server/DM</option>
                    </select>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <FormInput
                    label="Typical Response Time"
                    type="text"
                    name="typicalResponseTime"
                    value={form.typicalResponseTime}
                    onChange={handleChange}
                    placeholder="e.g. 1-2 days"
                  />
                  <FormInput
                    label="Maximum Active Students"
                    type="number"
                    name="maxActiveStudents"
                    value={form.maxActiveStudents}
                    onChange={handleChange}
                    placeholder="3"
                    min={1}
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-[11px] uppercase tracking-[0.35em] text-white/50 mb-1">
                    I Can Help With
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {HELP_TOPICS.map((topic) => (
                      <button
                        key={topic}
                        type="button"
                        onClick={() => toggleHelpTopic(topic)}
                        className={`rounded-full border px-3 py-2 text-xs uppercase tracking-[0.25em] transition ${
                          form.canHelpWith.includes(topic)
                            ? "border-emerald-400 bg-emerald-400/10 text-emerald-300"
                            : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white"
                        }`}
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
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
                      className={`text-xs ${syncStatus[item.syncKey].startsWith("✓") ? "text-emerald-200" : "text-rose-200"
                        }`}
                    >
                      {syncStatus[item.syncKey]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* Work Experience Section */}
          <section className={`${shellCard} p-6 md:p-7`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Work Experience</p>
                <p className="mt-2 text-sm text-white/60">Add internships, part-time, or full-time roles.</p>
              </div>
              <button
                type="button"
                onClick={addExperience}
                className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20"
              >
                + Add Experience
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {form.experiences.map((exp, idx) => (
                <div key={idx} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/45 font-bold">Role #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeExperience(idx)}
                      className="text-xs text-rose-300 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      label="Title / Designation"
                      type="text"
                      value={exp.title}
                      onChange={(e) => updateExperience(idx, "title", e.target.value)}
                      placeholder="e.g. Frontend Intern"
                    />
                    <FormInput
                      label="Company / Organisation"
                      type="text"
                      value={exp.company}
                      onChange={(e) => updateExperience(idx, "company", e.target.value)}
                      placeholder="e.g. Acme Corp"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormInput
                      label="Location"
                      type="text"
                      value={exp.location}
                      onChange={(e) => updateExperience(idx, "location", e.target.value)}
                      placeholder="e.g. Mumbai, India / Remote"
                    />
                    <FormInput
                      label="Start Date"
                      type="text"
                      value={exp.startDate}
                      onChange={(e) => updateExperience(idx, "startDate", e.target.value)}
                      placeholder="e.g. May 2026"
                    />
                    <FormInput
                      label="End Date"
                      type="text"
                      value={exp.endDate}
                      onChange={(e) => updateExperience(idx, "endDate", e.target.value)}
                      placeholder="e.g. Aug 2026 / Present"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-[11px] uppercase tracking-[0.35em] text-white/50">Description</label>
                    <textarea
                      value={exp.description}
                      onChange={(e) => updateExperience(idx, "description", e.target.value)}
                      rows={3}
                      placeholder="List key achievements, tech stack, or guidance points..."
                      className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none transition focus:border-cyan-300/60 focus:bg-white/8"
                    />
                  </div>
                </div>
              ))}
              {form.experiences.length === 0 && (
                <p className="text-center text-xs text-white/30 py-4">No experience items added yet.</p>
              )}
            </div>
          </section>

          {/* Education Section */}
          <section className={`${shellCard} p-6 md:p-7`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Education</p>
                <p className="mt-2 text-sm text-white/60">Share your university, degree, and study background.</p>
              </div>
              <button
                type="button"
                onClick={addEducation}
                className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20"
              >
                + Add Education
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {form.education.map((edu, idx) => (
                <div key={idx} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/45 font-bold">School #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeEducation(idx)}
                      className="text-xs text-rose-300 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <FormInput
                        label="School / University"
                        type="text"
                        value={edu.school}
                        onChange={(e) => updateEducation(idx, "school", e.target.value)}
                        placeholder="e.g. DYP ATU"
                      />
                    </div>
                    <FormInput
                      label="Degree"
                      type="text"
                      value={edu.degree}
                      onChange={(e) => updateEducation(idx, "degree", e.target.value)}
                      placeholder="e.g. B.Tech"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <div className="sm:col-span-2">
                      <FormInput
                        label="Field of Study"
                        type="text"
                        value={edu.fieldOfStudy}
                        onChange={(e) => updateEducation(idx, "fieldOfStudy", e.target.value)}
                        placeholder="e.g. Computer Engineering"
                      />
                    </div>
                    <div className="grid gap-2 grid-cols-2">
                      <FormInput
                        label="Start Year"
                        type="text"
                        value={edu.startDate}
                        onChange={(e) => updateEducation(idx, "startDate", e.target.value)}
                        placeholder="2022"
                      />
                      <FormInput
                        label="End Year"
                        type="text"
                        value={edu.endDate}
                        onChange={(e) => updateEducation(idx, "endDate", e.target.value)}
                        placeholder="2026"
                      />
                    </div>
                  </div>
                </div>
              ))}
              {form.education.length === 0 && (
                <p className="text-center text-xs text-white/30 py-4">No education items added yet.</p>
              )}
            </div>
          </section>

          {/* Certifications Section */}
          <section className={`${shellCard} p-6 md:p-7`}>
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Licenses & Certifications</p>
                <p className="mt-2 text-sm text-white/60">List courses, test scores, or vendor credentials.</p>
              </div>
              <button
                type="button"
                onClick={addCertification}
                className="rounded-full bg-cyan-400/10 border border-cyan-400/20 px-4 py-2 text-xs font-semibold text-cyan-300 hover:bg-cyan-400/20"
              >
                + Add Certification
              </button>
            </div>

            <div className="mt-6 space-y-6">
              {form.certifications.map((cert, idx) => (
                <div key={idx} className="relative rounded-2xl border border-white/10 bg-white/5 p-4 space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-white/45 font-bold">Credential #{idx + 1}</span>
                    <button
                      type="button"
                      onClick={() => removeCertification(idx)}
                      className="text-xs text-rose-300 hover:underline"
                    >
                      Remove
                    </button>
                  </div>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <FormInput
                      label="Certification Name"
                      type="text"
                      value={cert.name}
                      onChange={(e) => updateCertification(idx, "name", e.target.value)}
                      placeholder="e.g. AWS Solutions Architect"
                    />
                    <FormInput
                      label="Issuing Organisation"
                      type="text"
                      value={cert.issuer}
                      onChange={(e) => updateCertification(idx, "issuer", e.target.value)}
                      placeholder="e.g. Amazon Web Services"
                    />
                  </div>
                  <div className="grid gap-4 sm:grid-cols-3">
                    <FormInput
                      label="Issue Date"
                      type="text"
                      value={cert.issueDate}
                      onChange={(e) => updateCertification(idx, "issueDate", e.target.value)}
                      placeholder="e.g. Aug 2026"
                    />
                    <div className="sm:col-span-2">
                      <FormInput
                        label="Credential URL"
                        type="url"
                        value={cert.credentialUrl}
                        onChange={(e) => updateCertification(idx, "credentialUrl", e.target.value)}
                        placeholder="https://credly.com/..."
                      />
                    </div>
                  </div>
                </div>
              ))}
              {form.certifications.length === 0 && (
                <p className="text-center text-xs text-white/30 py-4">No certifications added yet.</p>
              )}
            </div>
          </section>

          <section className={`${shellCard} p-6 md:p-7`}>
            <div>
              <p className="text-[11px] uppercase tracking-[0.35em] text-white/45">Contact & Privacy Details</p>
              <p className="mt-2 text-sm text-white/60">
                These contact details are kept fully private. They will only be visible to mentors or mentees with whom you have an <strong>active accepted mentorship connection</strong>.
              </p>
            </div>

            <div className="mt-5 grid gap-4">
              <FormInput label="Phone Number" type="tel" name="phone" value={form.phone || ""} onChange={handleChange} placeholder="+1234567890" />
              <FormInput label="WhatsApp" type="text" name="whatsapp" value={form.whatsapp || ""} onChange={handleChange} placeholder="WhatsApp details" />
              <FormInput label="Discord Username" type="text" name="discord" value={form.discord || ""} onChange={handleChange} placeholder="username#1234" />
            </div>

            <div className="mt-6 border-t border-white/10 pt-5">
              <p className="text-xs uppercase tracking-[0.3em] text-white/45 mb-4">Choose which contacts are visible to active connections:</p>
              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  { key: "email", label: "Share Email Address" },
                  { key: "phone", label: "Share Phone Number" },
                  { key: "whatsapp", label: "Share WhatsApp" },
                  { key: "discord", label: "Share Discord" },
                ].map((item) => (
                  <label key={item.key} className="flex items-center gap-3 text-sm text-white/75 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.contactPreferences?.[item.key] ?? false}
                      onChange={(e) =>
                        setForm((prev) => ({
                          ...prev,
                          contactPreferences: {
                            ...prev.contactPreferences,
                            [item.key]: e.target.checked,
                          },
                        }))
                      }
                      className="h-4 w-4 accent-cyan-300"
                    />
                    {item.label}
                  </label>
                ))}
              </div>
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
