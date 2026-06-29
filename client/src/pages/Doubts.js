import { useEffect, useState } from "react";
import { getDoubts, createDoubt, addReply, toggleResolve, upvoteDoubt } from "../services/api";
import { useAuth } from "../context/AuthContext";

const DOMAINS = ["All", "Web", "AI", "Machine Learning", "Flutter", "Backend",
  "Cyber Security", "Competitive Programming", "Research", "App Dev"];

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

// ── Reply Thread ──────────────────────────────────────────
const ReplyThread = ({ doubt, user, onReply, onResolve }) => {
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);

  const handleReply = async () => {
    if (!replyText.trim()) return;
    setSending(true);
    try {
      await onReply(doubt._id, replyText);
      setReplyText("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="mt-4 border-t border-gray-800 pt-4 flex flex-col gap-3">
      {doubt.replies?.map((r) => (
        <div key={r._id} className="flex gap-3">
          <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {r.author?.name?.charAt(0)}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-white text-xs font-semibold">{r.author?.name}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded capitalize ${
                r.author?.role === "senior" || r.author?.role === "alumni"
                  ? "bg-white text-black font-semibold"
                  : "bg-gray-800 text-gray-400"
              }`}>{r.author?.role}</span>
              <span className="text-gray-600 text-xs">{timeAgo(r.createdAt)}</span>
            </div>
            <p className="text-gray-300 text-sm leading-relaxed">{r.body}</p>
          </div>
        </div>
      ))}

      {user && (
        <div className="flex gap-2 mt-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReply()}
            placeholder="Write a reply..."
            className="flex-1 bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
          <button onClick={handleReply} disabled={sending || !replyText.trim()}
            className="bg-white text-black px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-40 transition-colors shrink-0">
            {sending ? "..." : "Reply"}
          </button>
        </div>
      )}

      {/* Resolve button — only for doubt author */}
      {user && doubt.author?._id === user._id && (
        <button onClick={() => onResolve(doubt._id)}
          className={`text-xs w-fit px-3 py-1 rounded-lg border transition-colors ${
            doubt.resolved
              ? "border-gray-700 text-gray-500 hover:border-red-900 hover:text-red-400"
              : "border-green-900 text-green-400 hover:border-green-400"
          }`}>
          {doubt.resolved ? "Mark Unresolved" : "Mark Resolved"}
        </button>
      )}
    </div>
  );
};

// ── Doubt Card ────────────────────────────────────────────
const DoubtCard = ({ doubt, user, onReply, onResolve, onUpvote }) => {
  const [expanded, setExpanded] = useState(false);
  const hasUpvoted = user && doubt.upvotes?.map((id) => id.toString()).includes(user._id);

  return (
    <div className={`border rounded-xl bg-gray-900 transition-colors ${
      doubt.resolved ? "border-green-900" : "border-gray-800 hover:border-gray-600"
    }`}>
      <div className="p-6">
        {/* Header */}
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button onClick={() => onUpvote(doubt._id)}
              className={`text-sm font-bold transition-colors ${hasUpvoted ? "text-white" : "text-gray-600 hover:text-gray-400"}`}>
              ▲
            </button>
            <span className="text-xs text-gray-500">{doubt.upvotes?.length || 0}</span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-2">
              {doubt.resolved && (
                <span className="text-xs bg-green-900 text-green-400 px-2 py-0.5 rounded-full font-semibold">
                  Resolved
                </span>
              )}
              {doubt.domain && (
                <span className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">{doubt.domain}</span>
              )}
              <span className="text-gray-600 text-xs">{timeAgo(doubt.createdAt)}</span>
            </div>

            <h3 className="text-white font-semibold text-base mb-1 cursor-pointer hover:text-gray-300"
              onClick={() => setExpanded(!expanded)}>
              {doubt.title}
            </h3>

            <p className={`text-gray-400 text-sm leading-relaxed ${!expanded ? "line-clamp-2" : ""}`}>
              {doubt.body}
            </p>

            <div className="flex items-center gap-3 mt-3">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
                  {doubt.author?.name?.charAt(0)}
                </div>
                <span className="text-gray-500 text-xs">{doubt.author?.name} · {doubt.author?.role}</span>
              </div>
              <button onClick={() => setExpanded(!expanded)}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors ml-auto">
                {expanded
                  ? "Collapse"
                  : `${doubt.replies?.length || 0} ${doubt.replies?.length === 1 ? "reply" : "replies"} ↓`}
              </button>
            </div>
          </div>
        </div>

        {/* Thread */}
        {expanded && (
          <ReplyThread doubt={doubt} user={user} onReply={onReply} onResolve={onResolve} />
        )}
      </div>
    </div>
  );
};

// ── Doubts Page ───────────────────────────────────────────
const Doubts = () => {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [domain, setDomain] = useState("All");
  const [resolvedFilter, setResolvedFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", body: "", domain: "" });
  const [posting, setPosting] = useState(false);

  const fetchDoubts = () => {
    const params = {};
    if (domain !== "All") params.domain = domain;
    if (resolvedFilter !== "all") params.resolved = resolvedFilter === "resolved";
    setLoading(true);
    getDoubts(params)
      .then((res) => setDoubts(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchDoubts(); }, [domain, resolvedFilter]);

  const handlePost = async () => {
    if (!form.title.trim() || !form.body.trim()) return;
    setPosting(true);
    try {
      const res = await createDoubt(form);
      setDoubts([res.data.data, ...doubts]);
      setForm({ title: "", body: "", domain: "" });
      setShowForm(false);
    } catch (err) {
      console.error(err);
    } finally {
      setPosting(false);
    }
  };

  const handleReply = async (doubtId, body) => {
    const res = await addReply(doubtId, { body });
    setDoubts((prev) =>
      prev.map((d) => d._id === doubtId ? res.data.data : d)
    );
  };

  const handleResolve = async (doubtId) => {
    const res = await toggleResolve(doubtId);
    setDoubts((prev) =>
      prev.map((d) => d._id === doubtId ? { ...d, resolved: res.data.data.resolved } : d)
    );
  };

  const handleUpvote = async (doubtId) => {
    if (!user) return;
    const res = await upvoteDoubt(doubtId);
    setDoubts((prev) =>
      prev.map((d) => {
        if (d._id !== doubtId) return d;
        const userId = user._id;
        const alreadyUpvoted = d.upvotes?.map((id) => id.toString()).includes(userId);
        return {
          ...d,
          upvotes: alreadyUpvoted
            ? d.upvotes.filter((id) => id.toString() !== userId)
            : [...(d.upvotes || []), userId],
        };
      })
    );
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-20">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Ask Anything</p>
          <h1 className="text-4xl font-bold text-white">Doubt Forum</h1>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)}
            className="border border-white text-white hover:bg-white hover:text-black px-5 py-2 rounded-lg text-sm font-semibold transition-all">
            {showForm ? "Cancel" : "+ Ask a Question"}
          </button>
        )}
      </div>

      {/* Post Form */}
      {showForm && (
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900 mb-8 flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">New Question</h2>
          <input
            placeholder="Title — be specific (e.g. 'How do I fix CORS in Express?') *"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400"
          />
          <textarea
            placeholder="Describe your problem in detail. Include what you tried... *"
            rows={4} value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400 resize-none"
          />
          <select
            value={form.domain} onChange={(e) => setForm({ ...form, domain: e.target.value })}
            className="bg-gray-800 border border-gray-700 text-white rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400">
            <option value="">Select Domain (optional)</option>
            {DOMAINS.filter((d) => d !== "All").map((d) => <option key={d}>{d}</option>)}
          </select>
          <button onClick={handlePost} disabled={posting || !form.title.trim() || !form.body.trim()}
            className="bg-white text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 disabled:opacity-40 w-fit transition-colors">
            {posting ? "Posting..." : "Post Question"}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-wrap gap-2 mb-4">
        {["all", "open", "resolved"].map((f) => (
          <button key={f} onClick={() => setResolvedFilter(f)}
            className={`text-xs px-4 py-2 rounded-full border capitalize transition-colors ${
              resolvedFilter === f ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {f === "all" ? "All" : f === "open" ? "Open" : "Resolved"}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-8">
        {DOMAINS.map((d) => (
          <button key={d} onClick={() => setDomain(d)}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              domain === d ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            {d}
          </button>
        ))}
      </div>

      {/* List */}
      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : doubts.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-sm">No questions yet.</p>
          {user && (
            <button onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-gray-400 hover:text-white underline">
              Be the first to ask →
            </button>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {doubts.map((d) => (
            <DoubtCard key={d._id} doubt={d} user={user}
              onReply={handleReply} onResolve={handleResolve} onUpvote={handleUpvote} />
          ))}
        </div>
      )}

      {!user && (
        <div className="mt-10 border border-gray-800 rounded-xl p-6 bg-gray-900 text-center">
          <p className="text-gray-400 text-sm">
            <a href="/login" className="text-white hover:underline">Login</a> to ask questions or reply.
          </p>
        </div>
      )}
    </div>
  );
};

export default Doubts;