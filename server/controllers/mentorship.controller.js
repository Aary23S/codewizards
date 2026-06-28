const MentorshipRequest = require("../models/MentorshipRequest");

// POST /api/v1/mentorship/request
const createRequest = async (req, res) => {
  try {
    const { mentorId, message } = req.body;
    const existing = await MentorshipRequest.findOne({
      studentId: req.user._id, mentorId, status: "pending"
    });
    if (existing) return res.status(400).json({ success: false, message: "Request already pending" });

    const request = await MentorshipRequest.create({
      studentId: req.user._id, mentorId, message
    });
    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/v1/mentorship/my-requests
const getMyRequests = async (req, res) => {
  try {
    const filter = req.user.role === "student"
      ? { studentId: req.user._id }
      : { mentorId: req.user._id };

    const requests = await MentorshipRequest.find(filter)
      .populate("studentId", "name email batch domain")
      .populate("mentorId", "name email domain")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PATCH /api/v1/mentorship/:id/status
const updateStatus = async (req, res) => {
  try {
    const request = await MentorshipRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ success: false, message: "Not found" });
    if (request.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }
    request.status = req.body.status;
    await request.save();
    res.json({ success: true, data: request });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { createRequest, getMyRequests, updateStatus };