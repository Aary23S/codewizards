import { useEffect, useState } from "react";
import { getOpportunities, createOpportunity, deleteOpportunity } from "../services/api";
import { useAuth } from "../context/AuthContext";

const TYPES = ["all", "internship", "job", "freelance", "open_source"];
const DOMAINS = ["All", "Web", "AI", "Machine Learning", "Flutter", "Backend",
  "Cyber Security", "Competitive Programming", "Research", "App Dev"];

const typeLabel = {
  internship: "Internship",
  job: "Full-time Job",
  freelance: "Freelance",
  open_source: "Open Source",
};

const canPost = (role) => ["senior", "alumni", "admin"].includes(role);

const Opportunities = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    title: "", company: "", type: "internship",
    domain: "", description: "", applyLink: "", deadline: "",
  });
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchItems = () => {
    const params = {};
    if (typeFilter !== "all") params.type = typeFilter;
    if (domainFilter !== "All") params.domain = domainFilter;
    setLoading(true);
    getOpportunities(params)
      .then((res) => setItems(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchItems(); }, [typeFilter, domainFilter]);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.applyLink) {
      setFormError("Title, company, and apply link are required");
      return;
    }
    setPosting(true);
    setFormError("");
    try {
      const payload = { ...form };
      if (!payload.deadline) delete payload.deadline;
      await createOpportunity(payload);
      setForm({ title: "", company: "", type: "internship", domain: "", description: "", applyLink: "", deadline: "" });
      setShowForm(false);
      fetchItems();
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteOpportunity(id);
    setItems((prev) => prev.filter((i) => i._id !== id));
  };

  const inputClass = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400 w-full";

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Grow Your Career</p>
          <h1 className="text-4xl font-bold text-white">Opportunities</h1>
        </div>
        {user && canPost(user.role) && (
          <button onClick={() => setShowForm(!showForm)}
            className="border border-white text-white hover:bg-white hover:text-black px-5 py-2 rounded-lg text-sm font-semibold transition-all">
            {showForm ? "Cancel" : "+ Post Opportunity"}
          </button>
        )}
      </div>

      {/* Post Form */}
      {showForm && (
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900 mb-10 flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">New Opportunity</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input className={inputClass} name="title" placeholder="Role / Title *" value={form.title} onChange={handleChange} />
            <input className={inputClass} name="company" placeholder="Company *" value={form.company} onChange={handleChange} />
            <select className={inputClass} name="type" value={form.type} onChange={handleChange}>
              {TYPES.filter((t) => t !== "all").map((t) => (
                <option key={t} value={t}>{typeLabel[t]}</option>
              ))}
            </select>
            <input className={inputClass} name="domain" placeholder="Domain (e.g. Web, AI)" value={form.domain} onChange={handleChange} />
            <input className={inputClass} name="applyLink" placeholder="Apply Link *" value={form.applyLink} onChange={handleChange} />
            <input className={inputClass} type="date" name="deadline" value={form.deadline} onChange={handleChange} />
          </div>
          <textarea className={inputClass} name="description" rows={3} placeholder="Description (what's the role, stipend, duration...)" value={form.description} onChange={handleChange} />
          {formError && <p className="text-red-400 text-xs">{formError}</p>}
          <button onClick={handleSubmit} disabled={posting}
            className="bg-white text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit disabled:opacity-50">
            {posting ? "Posting..." : "Post Opportunity"}
          </button>
        </div>
      )}

      {/* Type Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        {TYPES.map((t) => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={`text-xs px-4 py-2 rounded-full border capitalize transition-colors ${
              typeFilter === t ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {t === "all" ? "All" : typeLabel[t]}
          </button>
        ))}
      </div>

      {/* Domain Filter */}
      <div className="flex flex-wrap gap-2 mb-10">
        {DOMAINS.map((d) => (
          <button key={d} onClick={() => setDomainFilter(d)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              domainFilter === d ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {d}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600 text-sm">No opportunities found. Check back soon.</p>
      ) : (
        <div className="flex flex-col gap-5">
          {items.map((opp) => (
            <div key={opp._id}
              className="border border-gray-800 rounded-xl p-6 bg-gray-900 hover:border-gray-600 transition-colors">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md capitalize">
                      {typeLabel[opp.type] || opp.type}
                    </span>
                    {opp.domain && (
                      <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">{opp.domain}</span>
                    )}
                    {opp.deadline && (
                      <span className="text-xs text-gray-500">
                        Deadline: {new Date(opp.deadline).toDateString()}
                      </span>
                    )}
                  </div>
                  <h3 className="text-white font-semibold text-lg">{opp.title}</h3>
                  <p className="text-gray-400 text-sm mt-0.5">{opp.company}</p>
                  {opp.description && (
                    <p className="text-gray-400 text-sm mt-3 leading-relaxed">{opp.description}</p>
                  )}
                  <p className="text-gray-600 text-xs mt-3">
                    Posted by {opp.postedBy?.name} · {opp.postedBy?.role}
                  </p>
                </div>

                <div className="flex flex-col gap-2 shrink-0">
                  <a href={opp.applyLink} target="_blank" rel="noreferrer"
                    className="bg-white text-black px-5 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 transition-colors text-center">
                    Apply →
                  </a>
                  {/* Delete — own post or admin */}
                  {user && (user._id === opp.postedBy?._id || user.role === "admin") && (
                    <button onClick={() => handleDelete(opp._id)}
                      className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-4 py-1.5 rounded-lg transition-colors">
                      Delete
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Opportunities;