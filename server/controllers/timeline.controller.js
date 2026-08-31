//timeline.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const Timeline = require("../models/Timeline");
const { parsePagination } = require("../utils/paginate");

// GET /api/v1/timeline
const getTimeline = async (req, res) => {
  try {
    const { active, limit, skip, page } = parsePagination(req.query);
    let query = Timeline.find().sort({ year: 1 }); // oldest first
    if (active) query = query.skip(skip).limit(limit);

    const milestones = await query;
    const response = { success: true, data: milestones };
    if (active) response.meta = { page, limit, total: await Timeline.countDocuments() };
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// POST /api/v1/timeline
const createMilestone = async (req, res) => {
  try {
    const milestone = await Timeline.create(req.body);
    res.status(201).json({ success: true, data: milestone });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// PATCH /api/v1/timeline/:id
const updateMilestone = async (req, res) => {
  try {
    const milestone = await Timeline.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    });
    if (!milestone) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: milestone });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// DELETE /api/v1/timeline/:id
const deleteMilestone = async (req, res) => {
  try {
    const milestone = await Timeline.findByIdAndDelete(req.params.id);
    if (!milestone) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = { getTimeline, createMilestone, updateMilestone, deleteMilestone };
