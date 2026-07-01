import { useEffect, useState } from "react";
import { getOpportunities, createOpportunity, deleteOpportunity } from "../services/api";
import { useAuth } from "../context/AuthContext";

const TYPES = ["all", "internship", "job", "freelance", "open_source"];
const DOMAINS = ["All", "Web", "AI", "Machine Learning", "Flutter", "Backend", "Cyber Security", "Competitive Programming", "Research", "App Dev"];

const typeLabel = {
  internship: "Internship",
  job: "Full-time Job",
  freelance: "Freelance",
  open_source: "Open Source",
};

const canPost = (role) => ["senior", "alumni", "admin"].includes(role);

const OpportunityCard = ({ opp, user, onDelete }) => (
  <div className="group rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20">
    <div className="flex items-start justify-between gap-4 flex-wrap">
      <div className="min-w-0 flex-1">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-white/8 px-3 py-1 text-xs uppercase tracking-[0.18em] text-white/60">
            {typeLabel[opp.type] || opp.type}
          </span>
          {opp.domain && <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">{opp.domain}</span>}
          {opp.deadline && <span className="text-xs text-white/40">Deadline: {new Date(opp.deadline).toDateString()}</span>}
        </div>
        <h3 className="text-xl font-semibold text-white">{opp.title}</h3>
        <p className="mt-1 text-sm text-white/55">{opp.company}</p>
        {opp.description && <p className="mt-4 text-sm leading-7 text-white/60">{opp.description}</p>}
        <p className="mt-4 text-xs text-white/40">Posted by {opp.postedBy?.name} · {opp.postedBy?.role}</p>
      </div>

      <div className="flex shrink-0 flex-col gap-2">
        <a href={opp.applyLink} target="_blank" rel="noreferrer" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90 text-center">
          Apply →
        </a>
        {user && (user._id === opp.postedBy?._id || user.role === "admin") && (
          <button onClick={() => onDelete(opp._id)} className="rounded-full border border-red-500/20 bg-red-500/10 px-4 py-1.5 text-xs text-red-200 transition-colors hover:border-red-400/40">
            Delete
          </button>
        )}
      </div>
    </div>
  </div>
);

const Opportunities = () => {
  const { user } = useAuth();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [domainFilter, setDomainFilter] = useState("All");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", company: "", type: "internship", domain: "", description: "", applyLink: "", deadline: "" });
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const params = {};
    if (typeFilter !== "all") params.type = typeFilter;
    if (domainFilter !== "All") params.domain = domainFilter;

    setLoading(true);
    getOpportunities(params)
      .then((res) => setItems(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [typeFilter, domainFilter]);

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
      setTypeFilter("all");
      setDomainFilter("All");
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteOpportunity(id);
    setItems((prev) => prev.filter((item) => item._id !== id));
  };

  const inputClass = "rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none w-full";

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mb-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Grow Your Career</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Opportunities in a cleaner, premium feed.
        </h1>
        <p className="mt-5 max-w-2xl text-sm leading-7 text-white/60 md:text-base">
          Same posting and delete behavior, but with a stronger layout and better pacing.
        </p>
      </div>

      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {TYPES.map((type) => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
                typeFilter === type
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
              }`}
            >
              {type === "all" ? "All" : typeLabel[type]}
            </button>
          ))}
        </div>
        {user && canPost(user.role) && (
          <button
            onClick={() => setShowForm(!showForm)}
            className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90"
          >
            {showForm ? "Cancel" : "+ Post Opportunity"}
          </button>
        )}
      </div>

      <div className="mb-10 flex flex-wrap gap-2">
        {DOMAINS.map((domain) => (
          <button
            key={domain}
            onClick={() => setDomainFilter(domain)}
            className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors ${
              domainFilter === domain
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
            }`}
          >
            {domain}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">New Opportunity</p>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2">
            <input className={inputClass} name="title" placeholder="Role / Title *" value={form.title} onChange={handleChange} />
            <input className={inputClass} name="company" placeholder="Company *" value={form.company} onChange={handleChange} />
            <select className={inputClass} name="type" value={form.type} onChange={handleChange}>
              {TYPES.filter((type) => type !== "all").map((type) => (
                <option key={type} value={type}>{typeLabel[type]}</option>
              ))}
            </select>
            <input className={inputClass} name="domain" placeholder="Domain (e.g. Web, AI)" value={form.domain} onChange={handleChange} />
            <input className={inputClass} name="applyLink" placeholder="Apply Link *" value={form.applyLink} onChange={handleChange} />
            <input className={inputClass} type="date" name="deadline" value={form.deadline} onChange={handleChange} />
          </div>
          <textarea className={`${inputClass} mt-4`} name="description" rows={3} placeholder="Description (what's the role, stipend, duration...)" value={form.description} onChange={handleChange} />
          {formError && <p className="mt-3 text-xs text-red-400">{formError}</p>}
          <button onClick={handleSubmit} disabled={posting} className="mt-4 rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90 disabled:opacity-50">
            {posting ? "Posting..." : "Post Opportunity"}
          </button>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : items.length > 0 ? (
        <div className="flex flex-col gap-5">
          {items.map((opp) => (
            <OpportunityCard key={opp._id} opp={opp} user={user} onDelete={handleDelete} />
          ))}
        </div>
      ) : (
        <p className="text-sm text-white/45">No opportunities found. Check back soon.</p>
      )}
    </div>
  );
};

export default Opportunities;
