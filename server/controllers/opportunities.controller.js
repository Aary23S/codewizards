const Opportunity = require("../models/Opportunities");

// GET /api/v1/opportunities
const getOpportunities = async (req, res) => {
  try {
    const filter = { isActive: true };
    if (req.query.type) filter.type = req.query.type;
    if (req.query.domain) filter.domain = req.query.domain;

    const opportunities = await Opportunity.find(filter)
      .populate("postedBy", "name role batch")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: opportunities });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(400).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
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
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getOpportunities, createOpportunity, updateOpportunity, deleteOpportunity };