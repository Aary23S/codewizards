//eventRegistration.controller.js
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
      if (existing.status === "registered") {
        return res.status(400).json({ success: false, message: "Already registered for this event" });
      }
      if (existing.status === "attended") {
        return res.status(400).json({ success: false, message: "Already attended this event" });
      }
      // If was cancelled previously, reactivate it
      existing.status = "registered";
      await existing.save();
      return res.status(200).json({ success: true, data: existing, message: "Registration reactivated" });
    }

    const reg = await EventRegistration.create({
      eventId: req.params.id,
      studentId: req.user._id,
      status: "registered",
    });

    res.status(201).json({ success: true, data: reg });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/events/:id/register
const cancelEventRegistration = async (req, res) => {
  try {
    const existing = await EventRegistration.findOne({
      eventId: req.params.id,
      studentId: req.user._id,
    });

    if (!existing) {
      return res.status(404).json({ success: false, message: "No registration found to cancel" });
    }

    existing.status = "cancelled";
    await existing.save();

    res.json({ success: true, message: "Registration cancelled successfully", data: existing });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

// GET /api/v1/events/my-registrations
const getMyRegistrations = async (req, res) => {
  try {
    const regs = await EventRegistration.find({ studentId: req.user._id, status: "registered" });
    const eventIds = regs.map((r) => r.eventId.toString());
    res.json({ success: true, data: eventIds });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/events/:id/otp (admin only)
const generateEventOTP = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString(); // 6 digit numeric code
    event.otpCode = otp;
    event.otpExpiresAt = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes lifetime
    await event.save();

    res.json({ success: true, data: { otpCode: otp, expiresAt: event.otpExpiresAt } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/events/:id/verify
const verifyEventOTP = async (req, res) => {
  const crypto = require("crypto");
  try {
    const { code } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: "OTP code is required" });
    }

    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    if (!event.otpCode || event.otpCode !== code.trim()) {
      return res.status(400).json({ success: false, message: "Invalid verification code" });
    }

    if (new Date() > new Date(event.otpExpiresAt)) {
      return res.status(400).json({ success: false, message: "Verification code has expired" });
    }

    const reg = await EventRegistration.findOne({
      eventId: event._id,
      studentId: req.user._id,
    });

    if (!reg) {
      return res.status(400).json({ success: false, message: "You are not registered for this event" });
    }

    if (reg.status === "cancelled") {
      return res.status(400).json({ success: false, message: "Your registration for this event was cancelled" });
    }

    if (reg.status === "attended") {
      return res.json({ success: true, message: "Already checked in", data: reg });
    }

    // Mark as attended
    reg.status = "attended";
    reg.attendedAt = new Date();
    // Cryptographic unique certificate hash
    reg.certificateHash = crypto
      .createHash("sha256")
      .update(`${reg.studentId}-${reg.eventId}-${reg.attendedAt.getTime()}`)
      .digest("hex")
      .slice(0, 16)
      .toUpperCase();

    await reg.save();

    // Award Points Ledger entry on attendance verification
    const month = new Date().toISOString().slice(0, 7);
    const EVENT_TYPE_TO_RULE = {
      hackathon: "hackathon_participation",
      contest: "contest_participation",
      workshop: "seminar_attended",
      seminar: "seminar_attended",
      other: "seminar_attended",
    };
    const ruleKey = EVENT_TYPE_TO_RULE[event.type] || "seminar_attended";
    try {
      await PointLedger.create({
        student: req.user._id,
        ruleKey,
        sourceType: "in_house",
        sourceId: event._id,
        month,
      });
    } catch (e) {
      // Duplicate (points already awarded), ignore
    }

    res.json({ success: true, message: "Attendance verified successfully", data: reg });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  registerForEvent,
  cancelEventRegistration,
  getRegistrations,
  getMyRegistrations,
  generateEventOTP,
  verifyEventOTP,
};