const Timeline = require("../models/Timeline");

// GET /api/v1/timeline
const getTimeline = async (req, res) => {
  try {
    const milestones = await Timeline.find().sort({ year: 1 }); // oldest first
    res.json({ success: true, data: milestones });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/timeline
const createMilestone = async (req, res) => {
  try {
    const milestone = await Timeline.create(req.body);
    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getTimeline, createMilestone };