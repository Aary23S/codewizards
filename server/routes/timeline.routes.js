const express = require("express");
const router = express.Router();
const { getTimeline, createMilestone, updateMilestone, deleteMilestone } = require("../controllers/timeline.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getTimeline);
router.post("/", protect, requireRole("admin"), createMilestone);
router.patch("/:id", protect, requireRole("admin"), updateMilestone);
router.delete("/:id", protect, requireRole("admin"), deleteMilestone);

module.exports = router;