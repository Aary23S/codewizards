const EventRegistration = require("../models/EventRegistration");
const Event = require("../models/Event");
const PointLedger = require("../models/PointLedger");

// POST /api/v1/events/:id/register
const registerForEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const existing = await EventRegistration.findOne({
      eventId: req.params.id,
      studentId: req.user._id,
    });

    if (existing) {
      return res.status(400).json({ success: false, message: "Already registered for this event" });
    }

    const reg = await EventRegistration.create({
      eventId: req.params.id,
      studentId: req.user._id,
    });

    // Points awarded on registration for now — registering = attended (simplified).
    // TODO (future): swap this for real attendance marking by admin post-event.
    const month = new Date().toISOString().slice(0, 7);
    // const ruleKey = event.type === "hackathon" ? "hackathon_participation" : "seminar_attended";
    const EVENT_TYPE_TO_RULE = {
      hackathon: "hackathon_participation",
      contest: "contest_participation",
      workshop: "seminar_attended",
      seminar: "seminar_attended",
      other: "seminar_attended",
    };
    const ruleKey = EVENT_TYPE_TO_RULE[event.type] || "seminar_attended"; A
    try {
      await PointLedger.create({
        student: req.user._id,
        ruleKey,
        sourceType: "in_house",
        sourceId: event._id,
        month,
      });
    } catch (e) {
      // Duplicate (unique index on student+ruleKey+sourceId) — already awarded, ignore
    }

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