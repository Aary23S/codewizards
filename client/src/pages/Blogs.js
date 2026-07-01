import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { getBlogs, createBlog, deleteBlog } from "../services/api";
import { useAuth } from "../context/AuthContext";

const timeAgo = (date) => {
  const diff = Math.floor((Date.now() - new Date(date)) / 1000);
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
};

const BlogCard = ({ blog, user, onDelete, index }) => (
  <div
    className="group overflow-hidden rounded-3xl border border-white/10 bg-white/5 shadow-[0_20px_80px_rgba(0,0,0,0.22)] transition-all duration-300 hover:-translate-y-1 hover:border-white/20"
    style={{ transitionDelay: `${index * 50}ms` }}
  >
    {blog.coverImage && <img src={blog.coverImage} alt={blog.title} className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
    <div className="p-6">
      {blog.tags?.length > 0 && (
        <div className="mb-3 flex flex-wrap gap-2">
          {blog.tags.map((tag) => (
            <span key={tag} className="rounded-full bg-white/8 px-3 py-1 text-xs text-white/60">
              {tag}
            </span>
          ))}
        </div>
      )}
      <Link to={`/blogs/${blog._id}`}>
        <h3 className="mb-2 text-xl font-semibold text-white transition-colors group-hover:text-white/75">
          {blog.title}
        </h3>
      </Link>
      <p className="line-clamp-3 text-sm leading-7 text-white/60">
        {blog.content.replace(/<[^>]+>/g, "").slice(0, 160)}...
      </p>
      <div className="mt-5 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-xs font-semibold text-white">
            {blog.author?.name?.charAt(0)}
          </div>
          <span className="text-xs text-white/40">
            {blog.author?.name} · {timeAgo(blog.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/blogs/${blog._id}`} className="text-xs text-white/55 transition-colors hover:text-white">
            Read →
          </Link>
          {user && (user._id === blog.author?._id || user.role === "admin") && (
            <button onClick={() => onDelete(blog._id)} className="text-xs text-red-300 transition-colors hover:text-red-200">
              Delete
            </button>
          )}
        </div>
      </div>
    </div>
  </div>
);

const Blogs = () => {
  const { user } = useAuth();
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [tagFilter, setTagFilter] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: "", content: "", coverImage: "", tags: "" });
  const [posting, setPosting] = useState(false);
  const [formError, setFormError] = useState("");

  useEffect(() => {
    const params = {};
    if (tagFilter) params.tag = tagFilter;

    setLoading(true);
    getBlogs(params)
      .then((res) => setBlogs(res.data.data || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [tagFilter]);

  const handleSubmit = async () => {
    if (!form.title.trim() || !form.content.trim()) {
      setFormError("Title and content are required");
      return;
    }
    setPosting(true);
    setFormError("");
    try {
      const payload = {
        title: form.title,
        content: form.content,
        coverImage: form.coverImage || undefined,
        tags: form.tags ? form.tags.split(",").map((tag) => tag.trim()).filter(Boolean) : [],
      };
      const res = await createBlog(payload);
      setBlogs([res.data.data, ...blogs]);
      setForm({ title: "", content: "", coverImage: "", tags: "" });
      setShowForm(false);
    } catch (err) {
      setFormError(err.response?.data?.message || "Failed to post");
    } finally {
      setPosting(false);
    }
  };

  const handleDelete = async (id) => {
    await deleteBlog(id);
    setBlogs((prev) => prev.filter((blog) => blog._id !== id));
  };

  const allTags = [...new Set(blogs.flatMap((blog) => blog.tags || []))];
  const inputClass = "rounded-2xl border border-white/10 bg-black/40 px-4 py-3 text-sm text-white placeholder:text-white/30 focus:border-white/30 focus:outline-none w-full";

  return (
    <div className="relative mx-auto max-w-6xl px-4 py-20">
      <div className="absolute left-0 top-16 h-64 w-64 rounded-full bg-amber-500/10 blur-3xl" />
      <div className="absolute right-0 top-28 h-72 w-72 rounded-full bg-sky-500/10 blur-3xl" />

      <div className="relative mb-10 flex items-start justify-between gap-4 flex-wrap">
        <div className="max-w-3xl">
          <p className="text-xs uppercase tracking-[0.3em] text-white/45">Ideas & Learnings</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-white md:text-6xl">
            Blog feed, upgraded visually.
          </h1>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)} className="rounded-full bg-white px-5 py-2.5 text-sm font-semibold text-black transition-transform duration-300 hover:-translate-y-0.5 hover:bg-white/90">
            {showForm ? "Cancel" : "+ Write Post"}
          </button>
        )}
      </div>

      {showForm && (
        <div className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-7 shadow-[0_20px_80px_rgba(0,0,0,0.22)]">
          <p className="text-xs uppercase tracking-[0.28em] text-white/45">New Post</p>
          <div className="mt-5 flex flex-col gap-4">
            <input className={inputClass} placeholder="Title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            <textarea className={inputClass} placeholder="Write your article here... *" rows={8} value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} style={{ resize: "vertical" }} />
            <input className={inputClass} placeholder="Cover image URL (optional)" value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
            <input className={inputClass} placeholder="Tags — comma separated (e.g. React, Tips, DSA)" value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
            {formError && <p className="text-xs text-red-400">{formError}</p>}
            <button onClick={handleSubmit} disabled={posting} className="w-fit rounded-full bg-white px-6 py-2.5 text-sm font-semibold text-black disabled:opacity-50">
              {posting ? "Publishing..." : "Publish Post"}
            </button>
          </div>
        </div>
      )}

      {allTags.length > 0 && (
        <div className="mb-8 flex flex-wrap gap-2">
          <button onClick={() => setTagFilter("")} className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors ${!tagFilter ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"}`}>
            All
          </button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setTagFilter(tag === tagFilter ? "" : tag)} className={`rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.18em] transition-colors ${tagFilter === tag ? "border-white bg-white text-black" : "border-white/10 bg-white/5 text-white/55 hover:border-white/20 hover:text-white"}`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <p className="text-sm text-white/45">Loading...</p>
      ) : blogs.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          {blogs.map((blog, index) => (
            <BlogCard key={blog._id} blog={blog} user={user} onDelete={handleDelete} index={index} />
          ))}
        </div>
      ) : (
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-sm text-white/55">
          No posts yet.
          {user && (
            <div className="mt-4">
              <button onClick={() => setShowForm(true)} className="text-sm text-white/70 underline underline-offset-4">
                Write the first one →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Blogs;
