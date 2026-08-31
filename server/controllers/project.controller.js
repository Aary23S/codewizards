//project.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const Project = require("../models/Project");
const { parsePagination } = require("../utils/paginate");

// GET /api/v1/projects
// Returns all projects; ?featured=true filters to featured only
const getProjects = async (req, res) => {
  try {
    const filter = {};
    if (req.query.featured === "true") filter.featured = true;

    const { active, limit, skip, page } = parsePagination(req.query);
    let query = Project.find(filter).sort({ createdAt: -1 });
    if (active) query = query.skip(skip).limit(limit);

    const projects = await query;
    const response = { success: true, data: projects };
    if (active) response.meta = { page, limit, total: await Project.countDocuments(filter) };
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// GET /api/v1/projects/:id
const getProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: project });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// POST /api/v1/projects  (admin only — middleware added in Phase 2)
const createProject = async (req, res) => {
  try {
    const project = await Project.create(req.body);
    res.status(201).json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

const updateProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!project) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: project });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

const deleteProject = async (req, res) => {
  try {
    const project = await Project.findByIdAndDelete(req.params.id);
    if (!project) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = { getProjects, getProject, createProject, updateProject, deleteProject };
