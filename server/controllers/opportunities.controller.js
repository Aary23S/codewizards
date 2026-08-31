//opportunities.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const Opportunity = require("../models/Opportunities");
const { parsePagination } = require("../utils/paginate");

// GET /api/v1/opportunities
const getOpportunities = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (typeof req.query.type === "string" && req.query.type) filter.type = req.query.type;
    if (typeof req.query.domain === "string" && req.query.domain) filter.domain = req.query.domain;

    const { active, limit, skip, page } = parsePagination(req.query);
    let query = Opportunity.find(filter)
      .populate("postedBy", "name role batch")
      .sort({ createdAt: -1 });
    if (active) query = query.skip(skip).limit(limit);

    const opportunities = await query;
    const response = { success: true, data: opportunities };
    if (active) response.meta = { page, limit, total: await Opportunity.countDocuments(filter) };
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// POST /api/v1/opportunities
const createOpportunity = async (req, res) => {
  try {
    const opportunity = await Opportunity.create({
      ...req.body,
      postedBy: req.user._id,
    });
    res.status(201).json({ success: true, data: opportunity });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// DELETE /api/v1/opportunities/:id
const deleteOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ success: false, message: "Not found" });

    // Only poster or admin can delete
    if (opp.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await opp.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// PATCH /api/v1/opportunities/:id
const updateOpportunity = async (req, res) => {
  try {
    const opp = await Opportunity.findById(req.params.id);
    if (!opp) return res.status(404).json({ success: false, message: "Not found" });

    if (opp.postedBy.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const updated = await Opportunity.findByIdAndUpdate(req.params.id, req.body, {
      new: true, runValidators: true,
    }).populate("postedBy", "name role batch");

    res.json({ success: true, data: updated });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity };