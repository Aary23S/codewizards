const EventRegistration = require("../models/EventRegistration");

// POST /api/v1/events/:id/register
const registerForEvent = async (req, res) => {
  try {
    const existing = await EventRegistration.findOne({
      eventId: req.params.id, studentId: req.user._id
    });
    if (existing) return res.status(400).json({ success: false, message: "Already registered" });

    const reg = await EventRegistration.create({
      eventId: req.params.id, studentId: req.user._id
    });
    res.status(201).json({ success: true, data: reg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/v1/events/:id/registrations (admin only)
const getRegistrations = async (req, res) => {
  try {
    const regs = await EventRegistration.find({ eventId: req.params.id })
      .populate("studentId", "name email batch");
    res.json({ success: true, data: regs });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { registerForEvent, getRegistrations };