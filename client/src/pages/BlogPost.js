import { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getBlog, deleteBlog } from "../services/api";
import { useAuth } from "../context/AuthContext";

const BlogPost = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getBlog(id)
      .then((res) => setBlog(res.data.data))
      .catch(() => navigate("/blogs"))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  const handleDelete = async () => {
    await deleteBlog(id);
    navigate("/blogs");
  };

  if (loading) return <div className="text-center text-gray-500 py-32">Loading...</div>;
  if (!blog) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-20">

      {/* Back */}
      <Link to="/blogs" className="text-xs text-gray-500 hover:text-white transition-colors mb-8 block">
        ← Back to Blog
      </Link>

      {/* Cover */}
      {blog.coverImage && (
        <img src={blog.coverImage} alt={blog.title}
          className="w-full h-64 object-cover rounded-xl mb-8 border border-gray-800" />
      )}

      {/* Tags */}
      {blog.tags?.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {blog.tags.map((tag) => (
            <span key={tag} className="text-xs bg-gray-800 text-gray-400 px-2 py-0.5 rounded-md">
              {tag}
            </span>
          ))}
        </div>
      )}

      {/* Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4 leading-tight">
        {blog.title}
      </h1>

      {/* Author + meta */}
      <div className="flex items-center justify-between flex-wrap gap-4 mb-10 pb-6 border-b border-gray-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
            {blog.author?.name?.charAt(0)}
          </div>
          <div>
            <Link to={`/profile/${blog.author?._id}`}
              className="text-white text-sm font-medium hover:underline">
              {blog.author?.name}
            </Link>
            <p className="text-gray-500 text-xs capitalize">
              {blog.author?.role} {blog.author?.batch ? `· Batch ${blog.author.batch}` : ""}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-gray-600 text-xs">
            {new Date(blog.createdAt).toDateString()}
          </span>
          {user && (user._id === blog.author?._id || user.role === "admin") && (
            <button onClick={handleDelete}
              className="text-xs text-red-400 border border-red-900 hover:border-red-400 px-3 py-1.5 rounded-lg transition-colors">
              Delete Post
            </button>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="prose prose-invert max-w-none">
        {blog.content.split("\n").map((para, i) =>
          para.trim() ? (
            <p key={i} className="text-gray-300 leading-relaxed mb-4 text-base">
              {para}
            </p>
          ) : <br key={i} />
        )}
      </div>
    </div>
  );
};

export default BlogPost;