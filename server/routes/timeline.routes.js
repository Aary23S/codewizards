const express = require("express");
const router = express.Router();
const { getTimeline, createMilestone } = require("../controllers/timeline.controller");

router.get("/", getTimeline);
router.post("/", createMilestone);

module.exports = router;