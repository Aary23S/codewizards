const express = require("express");
const router = express.Router();
const { getBlogs, getBlog, createBlog, updateBlog, deleteBlog } = require("../controllers/blog.controller");
const { protect } = require("../middleware/auth");

router.get("/", getBlogs);
router.get("/:id", getBlog);
router.post("/", protect, createBlog);
router.patch("/:id", protect, updateBlog);
router.delete("/:id", protect, deleteBlog);

module.exports = router;