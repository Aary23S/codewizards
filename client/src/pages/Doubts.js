import { useEffect, useState } from "react";
import { getDoubts, createDoubt, addReply, toggleResolve, upvoteDoubt } from "../services/api";
import { useAuth } from "../context/AuthContext";

const DOMAINS = ["All", "Web", "AI", "Machine Learning", "Flutter", "Backend", "Cyber Security", "Competitive Programming", "Research", "App Dev"];

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 60) return "just now";
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

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
    <div className="mt-5 border-t border-white/10 pt-5">
      <div className="space-y-4">
        {doubt.replies?.map((reply) => (
          <div key={reply._id} className="flex gap-3 rounded-2xl border border-white/8 bg-black/20 p-4">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
              {reply.author?.name?.charAt(0)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-white">{reply.author?.name}</span>
                <span className={`rounded-full px-2 py-0.5 text-[11px] uppercase tracking-[0.16em] ${
                  reply.author?.role === "senior" || reply.author?.role === "alumni"
                    ? "bg-white text-black"
                    : "bg-white/8 text-white/55"
                }`}>
                  {reply.author?.role}
                </span>
                <span className="text-xs text-white/35">{timeAgo(reply.createdAt)}</span>
              </div>
              <p className="mt-2 text-sm leading-7 text-white/70">{reply.body}</p>
            </div>
          </div>
        ))}
      </div>

      {user && (
        <div className="mt-5 flex gap-2">
          <input
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleReply()}
            placeholder="Write a reply..."
            className="flex-1 rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
          />
          <button onClick={handleReply} disabled={sending || !replyText.trim()} className="rounded-full bg-white px-4 py-3 text-sm font-semibold text-black disabled:opacity-40">
            {sending ? "..." : "Reply"}
          </button>
        </div>
      )}

      {user && doubt.author?._id === user._id && (
        <button
          onClick={() => onResolve(doubt._id)}
          className={`mt-4 rounded-full border px-3 py-1.5 text-xs transition-colors ${
            doubt.resolved
              ? "border-white/10 text-white/45 hover:border-red-500/30 hover:text-red-300"
              : "border-green-500/20 text-green-200 hover:border-green-400/40"
          }`}
        >
          {doubt.resolved ? "Mark Unresolved" : "Mark Resolved"}
        </button>
      )}
    </div>
  );
};

const DoubtCard = ({ doubt, user, onReply, onResolve, onUpvote }) => {
  const [expanded, setExpanded] = useState(false);
  const hasUpvoted = user && doubt.upvotes?.map((id) => id.toString()).includes(user._id);

  return (
    <div className={`rounded-3xl border ${doubt.resolved ? "border-green-500/20" : "border-white/10"} bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)]`}>
      <div className="p-6">
        <div className="flex items-start gap-4">
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button onClick={() => onUpvote(doubt._id)} className={`text-sm font-bold transition-colors ${hasUpvoted ? "text-white" : "text-white/35 hover:text-white/70"}`}>
              ▲
            </button>
            <span className="text-xs text-white/35">{doubt.upvotes?.length || 0}</span>
          </div>

          <div className="min-w-0 flex-1">
            <div className="mb-2 flex flex-wrap items-center gap-2">
              {doubt.resolved && <span className="rounded-full bg-green-500/10 px-3 py-1 text-xs font-semibold text-green-200">Resolved</span>}
              {doubt.domain && <span className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">{doubt.domain}</span>}
              <span className="text-xs text-white/35">{timeAgo(doubt.createdAt)}</span>
            </div>

            <h3 onClick={() => setExpanded(!expanded)} className="cursor-pointer text-lg font-semibold text-white hover:text-white/75">
              {doubt.title}
            </h3>

            <p className={`mt-3 text-sm leading-7 text-white/60 ${!expanded ? "line-clamp-2" : ""}`}>
              {doubt.body}
            </p>

            <div className="mt-4 flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
                  {doubt.author?.name?.charAt(0)}
                </div>
                <span className="text-xs text-white/40">{doubt.author?.name} · {doubt.author?.role}</span>
              </div>
              <button onClick={() => setExpanded(!expanded)} className="ml-auto text-xs text-white/40 transition-colors hover:text-white">
                {expanded ? "Collapse" : `${doubt.replies?.length || 0} ${doubt.replies?.length === 1 ? "reply" : "replies"} ↓`}
              </button>
            </div>

            {expanded && <ReplyThread doubt={doubt} user={user} onReply={onReply} onResolve={onResolve} />}
          </div>
        </div>
      </div>
    </div>
  );
};

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

  useEffect(() => {
    fetchDoubts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, resolvedFilter]);

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
    setDoubts((prev) => prev.map((d) => (d._id === doubtId ? res.data.data : d)));
  };

  const handleResolve = async (doubtId) => {
    const res = await toggleResolve(doubtId);
    setDoubts((prev) => prev.map((d) => (d._id === doubtId ? { ...d, resolved: res.data.data.resolved } : d)));
  };

  const handleUpvote = async (doubtId) => {
    if (!user) return;
    await upvoteDoubt(doubtId);
    setDoubts((prev) =>
      prev.map((d) => {
        if (d._id !== doubtId) return d;
        const userId = user._id;
        const alreadyUpvoted = d.upvotes?.map((id) => id.toString()).includes(userId);
        return {
          ...d,
          upvotes: alreadyUpvoted ? d.upvotes.filter((id) => id.toString() !== userId) : [...(d.upvotes || []), userId],
        };
      })
    );
  };

  return (
    <div className="relative mx-auto max-w-5xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-sky-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-rose-500/10 blur-3xl" />

      <div className="relative mb-10 max-w-3xl">
        <p className="text-xs uppercase tracking-[0.3em] text-white/45">Ask Anything</p>
        <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
          Doubt forum, restyled without changing the flow.
        </h1>
      </div>

      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          {["all", "open", "resolved"].map((value) => (
            <button
              key={value}
              onClick={() => setResolvedFilter(value)}
              className={`rounded-full border px-4 py-2 text-xs uppercase tracking-[0.18em] transition-colors ${
                resolvedFilter === value
                  ? "border-white bg-white text-black"
                  : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
              }`}
            >
              {value === "all" ? "All" : value === "open" ? "Open" : "Resolved"}
            </button>
          ))}
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90">
            {showForm ? "Cancel" : "+ Ask a Question"}
          </button>
        )}
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {DOMAINS.map((value) => (
          <button
            key={value}
            onClick={() => setDomain(value)}
            className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors ${
              domain === value
                ? "border-white bg-white text-black"
                : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"
            }`}
          >
            {value}
          </button>
        ))}
      </div>

      {showForm && (
        <div className="mb-8 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">New Question</p>
          <div className="mt-5 flex flex-col gap-4">
            <input
              placeholder="Title — be specific (e.g. 'How do I fix CORS in Express?') *"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none"
            />
            <textarea
              placeholder="Describe your problem in detail. Include what you tried... *"
              rows={5}
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none resize-none"
            />
            <select
              value={form.domain}
              onChange={(e) => setForm({ ...form, domain: e.target.value })}
              className="rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white focus:border-white/30 focus:outline-none"
            >
              <option value="">Select Domain (optional)</option>
              {DOMAINS.filter((value) => value !== "All").map((value) => (
                <option key={value}>{value}</option>
              ))}
            </select>
            <button onClick={handlePost} disabled={posting || !form.title.trim() || !form.body.trim()} className="w-fit rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-40">
              {posting ? "Posting..." : "Post Question"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : doubts.length > 0 ? (
        <div className="flex flex-col gap-4">
          {doubts.map((doubt) => (
            <DoubtCard key={doubt._id} doubt={doubt} user={user} onReply={handleReply} onResolve={handleResolve} onUpvote={handleUpvote} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">
          No questions yet.
          {!user && (
            <p className="mt-3">
              <a href="/login" className="text-white underline underline-offset-4">Login</a> to ask questions or reply.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Doubts;
