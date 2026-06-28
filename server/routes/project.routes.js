const express = require("express");
const router = express.Router();
const { getProjects, getProject, createProject, updateProject, deleteProject } = require("../controllers/project.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", protect, requireRole("admin"), createProject);
router.patch("/:id", protect, requireRole("admin"), updateProject);
router.delete("/:id", protect, requireRole("admin"), deleteProject);

module.exports = router;
