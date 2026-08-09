//mentorship.controller.js
const MentorshipRequest = require("../models/MentorshipRequest");
const Mentorship = require("../models/Mentorship");
const User = require("../models/User");

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
    const requests = await MentorshipRequest.find({
      $or: [
        { studentId: req.user._id },
        { mentorId: req.user._id }
      ]
    })
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

    if (request.status !== "pending") {
      return res.status(400).json({ success: false, message: "Request is already processed" });
    }

    const { status } = req.body;
    if (!["accepted", "rejected"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid status value" });
    }

    request.status = status;
    await request.save();

    let connection = null;
    if (status === "accepted") {
      // Prevent duplicate active connections
      const existing = await Mentorship.findOne({
        studentId: request.studentId,
        mentorId: request.mentorId,
        status: "active",
      });

      if (!existing) {
        connection = await Mentorship.create({
          studentId: request.studentId,
          mentorId: request.mentorId,
          requestId: request._id,
        });
      } else {
        connection = existing;
      }
    }

    res.json({ success: true, data: { request, connection } });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// GET /api/v1/mentorship/my-mentors
const getMyMentors = async (req, res) => {
  try {
    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Only students can access this" });
    }
    const connections = await Mentorship.find({ studentId: req.user._id, status: "active" })
      .populate("mentorId", "name imageUrl bio domain linkedin github portfolio")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: connections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/mentorship/my-mentees
const getMyMentees = async (req, res) => {
  try {
    const connections = await Mentorship.find({ mentorId: req.user._id, status: "active" })
      .populate("studentId", "name imageUrl bio domain linkedin github codeforces githubUsername leetcodeUsername externalStats")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: connections });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/mentorship/:id/contact
const getMentorshipContact = async (req, res) => {
  try {
    const connection = await Mentorship.findById(req.params.id);
    if (!connection) {
      return res.status(404).json({ success: false, message: "Connection not found" });
    }
    if (connection.status !== "active") {
      return res.status(400).json({ success: false, message: "Connection is inactive" });
    }

    const isStudent = connection.studentId.toString() === req.user._id.toString();
    const isMentor = connection.mentorId.toString() === req.user._id.toString();

    if (!isStudent && !isMentor) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const targetUserId = isStudent ? connection.mentorId : connection.studentId;
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const prefs = targetUser.contactPreferences || { email: true };
    const contacts = {};
    if (prefs.email) contacts.email = targetUser.email;
    if (prefs.phone) contacts.phone = targetUser.phone;
    if (prefs.whatsapp) contacts.whatsapp = targetUser.whatsapp;
    if (prefs.discord) contacts.discord = targetUser.discord;

    res.json({ success: true, data: contacts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  updateStatus,
  getMyMentors,
  getMyMentees,
  getMentorshipContact,
};