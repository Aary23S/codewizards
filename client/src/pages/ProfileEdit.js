import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getUserById, updateUser } from "../services/api";
import { useAuth } from "../context/AuthContext";
import FormInput from "../components/FormInput";

const DOMAIN_OPTIONS = [
  "Web", "AI", "Machine Learning", "Flutter", "Backend",
  "Cyber Security", "Competitive Programming", "Research",
  "Open Source", "App Dev",
];

const ProfileEdit = () => {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", bio: "", github: "", linkedin: "",
    leetcode: "", codeforces: "", portfolio: "",
    domain: [], isMentor: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Block if not own profile
    if (currentUser && currentUser._id !== id) {
      navigate("/");
      return;
    }

    getUserById(id).then((res) => {
      const u = res.data.data;
      setForm({
        name: u.name || "",
        bio: u.bio || "",
        github: u.github || "",
        linkedin: u.linkedin || "",
        leetcode: u.leetcode || "",
        codeforces: u.codeforces || "",
        portfolio: u.portfolio || "",
        domain: u.domain || [],
        isMentor: u.isMentor || false,
      });
    }).finally(() => setLoading(false));
  }, [id, currentUser, navigate]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const toggleDomain = (d) => {
    setForm((prev) => ({
      ...prev,
      domain: prev.domain.includes(d)
        ? prev.domain.filter((x) => x !== d)
        : [...prev.domain, d],
    }));
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

  if (loading) return <div className="text-center text-gray-500 py-32">Loading...</div>;

  return (
    <div className="max-w-2xl mx-auto px-4 py-20">
      <p className="text-xs uppercase tracking-widest text-gray-500 mb-4">Your Profile</p>
      <h1 className="text-3xl font-bold text-white mb-10">Edit Profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        <FormInput label="Full Name" type="text" name="name" value={form.name} onChange={handleChange} required />

        {/* Bio */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs uppercase tracking-widest text-gray-500">Bio</label>
          <textarea name="bio" value={form.bio} onChange={handleChange} rows={3}
            placeholder="Tell others about yourself..."
            className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-3 text-sm focus:outline-none focus:border-gray-400 resize-none" />
        </div>

        {/* Domains */}
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-widest text-gray-500">Domains</label>
          <div className="flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map((d) => (
              <button key={d} type="button" onClick={() => toggleDomain(d)}
                className={`text-xs px-3 py-1.5 rounded-lg border transition-colors ${
                  form.domain.includes(d)
                    ? "bg-white text-black border-white font-semibold"
                    : "border-gray-700 text-gray-400 hover:border-gray-500"
                }`}>
                {d}
              </button>
            ))}
          </div>
        </div>

        {/* Mentor toggle */}
        <div className="flex items-center gap-3">
          <input type="checkbox" id="isMentor" checked={form.isMentor}
            onChange={(e) => setForm({ ...form, isMentor: e.target.checked })}
            className="w-4 h-4 accent-white" />
          <label htmlFor="isMentor" className="text-sm text-gray-300">
            I'm open to mentoring juniors
          </label>
        </div>

        {/* Links */}
        <div className="border border-gray-800 rounded-xl p-6 bg-gray-900 flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">Platform Links</h2>
          <FormInput label="GitHub URL" type="url" name="github" value={form.github} onChange={handleChange} placeholder="https://github.com/username" />
          <FormInput label="LinkedIn URL" type="url" name="linkedin" value={form.linkedin} onChange={handleChange} placeholder="https://linkedin.com/in/username" />
          <FormInput label="LeetCode URL" type="url" name="leetcode" value={form.leetcode} onChange={handleChange} placeholder="https://leetcode.com/username" />
          <FormInput label="Codeforces URL" type="url" name="codeforces" value={form.codeforces} onChange={handleChange} placeholder="https://codeforces.com/profile/username" />
          <FormInput label="Portfolio URL" type="url" name="portfolio" value={form.portfolio} onChange={handleChange} placeholder="https://yourportfolio.com" />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        <div className="flex gap-4">
          <button type="submit" disabled={saving}
            className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors disabled:opacity-50">
            {saving ? "Saving..." : "Save Changes"}
          </button>
          <button type="button" onClick={() => navigate(`/profile/${id}`)}
            className="border border-gray-700 text-gray-400 hover:border-white hover:text-white px-6 py-3 rounded-lg transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default ProfileEdit;