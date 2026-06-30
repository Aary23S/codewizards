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

const BlogCard = ({ blog, user, onDelete }) => (
  <div className="border border-gray-800 rounded-xl bg-gray-900 hover:border-gray-600 transition-colors overflow-hidden">
    {blog.coverImage && (
      <img src={blog.coverImage} alt={blog.title}
        className="w-full h-44 object-cover" />
    )}
    <div className="p-6">
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {blog.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      )}
      <Link to={`/blogs/${blog._id}`}>
        <h3 className="text-white font-semibold text-lg mb-2 hover:text-gray-300 transition-colors">
          {blog.title}
        </h3>
      </Link>
      <p className="text-gray-400 text-sm leading-relaxed line-clamp-3">
        {blog.content.replace(/<[^>]+>/g, "").slice(0, 160)}...
      </p>
      <div className="flex items-center justify-between mt-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-full bg-gray-700 flex items-center justify-center text-white text-xs font-bold">
            {blog.author?.name?.charAt(0)}
          </div>
          <span className="text-gray-500 text-xs">
            {blog.author?.name} · {timeAgo(blog.createdAt)}
          </span>
        </div>
        <div className="flex items-center gap-3">
          <Link to={`/blogs/${blog._id}`}
            className="text-xs text-gray-400 hover:text-white transition-colors">
            Read →
          </Link>
          {user && (user._id === blog.author?._id || user.role === "admin") && (
            <button onClick={() => onDelete(blog._id)}
              className="text-xs text-red-400 hover:text-red-300 transition-colors">
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

  const fetchBlogs = () => {
    const params = {};
    if (tagFilter) params.tag = tagFilter;
    setLoading(true);
    getBlogs(params)
      .then((res) => setBlogs(res.data.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(() => { fetchBlogs(); }, [tagFilter]);

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
        tags: form.tags
          ? form.tags.split(",").map((t) => t.trim()).filter(Boolean)
          : [],
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
    setBlogs((prev) => prev.filter((b) => b._id !== id));
  };

  // Collect all unique tags across posts for filter chips
  const allTags = [...new Set(blogs.flatMap((b) => b.tags || []))];

  const inputClass = "bg-gray-800 border border-gray-700 text-white placeholder-gray-500 rounded-lg px-4 py-2 text-sm focus:outline-none focus:border-gray-400 w-full";

  return (
    <div className="max-w-5xl mx-auto px-4 py-20">
      <div className="flex items-start justify-between flex-wrap gap-4 mb-10">
        <div>
          <p className="text-xs uppercase tracking-widest text-gray-500 mb-2">Ideas & Learnings</p>
          <h1 className="text-4xl font-bold text-white">Blog</h1>
        </div>
        {user && (
          <button onClick={() => setShowForm(!showForm)}
            className="border border-white text-white hover:bg-white hover:text-black px-5 py-2 rounded-lg text-sm font-semibold transition-all">
            {showForm ? "Cancel" : "+ Write Post"}
          </button>
        )}
      </div>

      {/* Write Form */}
      {showForm && (
        <div className="border border-gray-700 rounded-xl p-6 bg-gray-900 mb-10 flex flex-col gap-4">
          <h2 className="text-xs uppercase tracking-widest text-gray-500">New Post</h2>
          <input className={inputClass} placeholder="Title *"
            value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <textarea className={inputClass} placeholder="Write your article here... *"
            rows={8} value={form.content}
            onChange={(e) => setForm({ ...form, content: e.target.value })}
            style={{ resize: "vertical" }} />
          <input className={inputClass} placeholder="Cover image URL (optional)"
            value={form.coverImage} onChange={(e) => setForm({ ...form, coverImage: e.target.value })} />
          <input className={inputClass} placeholder="Tags — comma separated (e.g. React, Tips, DSA)"
            value={form.tags} onChange={(e) => setForm({ ...form, tags: e.target.value })} />
          {formError && <p className="text-red-400 text-xs">{formError}</p>}
          <button onClick={handleSubmit} disabled={posting}
            className="bg-white text-black px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-200 w-fit disabled:opacity-50 transition-colors">
            {posting ? "Publishing..." : "Publish Post"}
          </button>
        </div>
      )}

      {/* Tag filters — only show if tags exist */}
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-8">
          <button onClick={() => setTagFilter("")}
            className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
              !tagFilter ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
            }`}>
            All
          </button>
          {allTags.map((tag) => (
            <button key={tag} onClick={() => setTagFilter(tag === tagFilter ? "" : tag)}
              className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                tagFilter === tag ? "bg-white text-black border-white font-semibold" : "border-gray-700 text-gray-400 hover:border-gray-500"
              }`}>
              {tag}
            </button>
          ))}
        </div>
      )}

      {/* List */}
      {loading ? (
        <p className="text-gray-600 text-sm">Loading...</p>
      ) : blogs.length === 0 ? (
        <div className="text-center py-20">
          <p className="text-gray-600 text-sm">No posts yet.</p>
          {user && (
            <button onClick={() => setShowForm(true)}
              className="mt-4 text-sm text-gray-400 hover:text-white underline">
              Write the first one →
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {blogs.map((b) => (
            <BlogCard key={b._id} blog={b} user={user} onDelete={handleDelete} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Blogs;