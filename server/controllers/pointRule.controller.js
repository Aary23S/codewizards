const PointRule = require("../models/PointRule");

// GET /api/v1/point-rules
const getPointRules = async (req, res) => {
  try {
    const rules = await PointRule.find().sort({ key: 1 });
    res.json({ success: true, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/v1/point-rules/:id
const updatePointRule = async (req, res) => {
  try {
    const { flatPoints, tiers } = req.body;
    const update = {};
    if (flatPoints !== undefined) update.flatPoints = flatPoints;
    if (tiers !== undefined) update.tiers = tiers;

    const rule = await PointRule.findByIdAndUpdate(req.params.id, update, {
      new: true,
      runValidators: true,
    });
    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getPointRules, updatePointRule };