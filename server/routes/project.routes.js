const express = require("express");
const router = express.Router();
const { getProjects, getProject, createProject } = require("../controllers/project.controller");

router.get("/", getProjects);
router.get("/:id", getProject);
router.post("/", createProject);   // Will be protected in Phase 2

module.exports = router;