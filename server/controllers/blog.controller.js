//blog.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const Blog = require("../models/Blogs");
const { parsePagination } = require("../utils/paginate");

// GET /api/v1/blogs
const getBlogs = async (req, res) => {
  try {
    const filter = { published: true };
    if (typeof req.query.tag === "string" && req.query.tag) filter.tags = req.query.tag;

    const { active, limit, skip, page } = parsePagination(req.query);
    let query = Blog.find(filter)
      .populate("author", "name role batch")
      .sort({ createdAt: -1 });
    if (active) query = query.skip(skip).limit(limit);

    const blogs = await query;
    const response = { success: true, data: blogs };
    if (active) response.meta = { page, limit, total: await Blog.countDocuments(filter) };
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// GET /api/v1/blogs/:id
const getBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name role batch domain");
    if (!blog) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: blog });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// POST /api/v1/blogs
const createBlog = async (req, res) => {
  try {
    const blog = await Blog.create({ ...req.body, author: req.user._id });
    await blog.populate("author", "name role batch");
    res.status(201).json({ success: true, data: blog });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// PATCH /api/v1/blogs/:id
const updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Not found" });

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const updated = await Blog.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate("author", "name role batch");

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// DELETE /api/v1/blogs/:id
const deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ success: false, message: "Not found" });

    if (blog.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await blog.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = { getBlogs, getBlog, createBlog, updateBlog, deleteBlog };