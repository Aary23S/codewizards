//mentorship.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const mongoose = require("mongoose");
const MentorshipRequest = require("../models/MentorshipRequest");
const Mentorship = require("../models/Mentorship");
const User = require("../models/User");
const MentorshipGoal = require("../models/MentorshipGoal");

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
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
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
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// PATCH /api/v1/mentorship/:id/status
const updateStatus = async (req, res) => {
  const session = await mongoose.startSession();
  try {
    let result;

    // Marking the request accepted and creating its Mentorship connection must succeed or
    // fail together — otherwise a crash between the two steps leaves an "accepted" request
    // with no actual mentor/student connection.
    await session.withTransaction(async () => {
      const request = await MentorshipRequest.findById(req.params.id).session(session);
      if (!request) {
        throw Object.assign(new Error("Not found"), { status: 404 });
      }
      if (request.mentorId.toString() !== req.user._id.toString()) {
        throw Object.assign(new Error("Not allowed"), { status: 403 });
      }
      if (request.status !== "pending") {
        throw Object.assign(new Error("Request is already processed"), { status: 400 });
      }

      const { status } = req.body;
      if (!["accepted", "rejected"].includes(status)) {
        throw Object.assign(new Error("Invalid status value"), { status: 400 });
      }

      request.status = status;
      await request.save({ session });

      let connection = null;
      if (status === "accepted") {
        // Prevent duplicate active connections
        const existing = await Mentorship.findOne({
          studentId: request.studentId,
          mentorId: request.mentorId,
          status: "active",
        }).session(session);

        if (!existing) {
          const [created] = await Mentorship.create(
            [{ studentId: request.studentId, mentorId: request.mentorId, requestId: request._id }],
            { session }
          );
          connection = created;
        } else {
          connection = existing;
        }
      }

      result = { request, connection };
    });

    res.json({ success: true, data: result });
  } catch (error) {
    res.status(error.status || 400).json({ success: false, message: error.message });
  } finally {
    session.endSession();
  }
};

// GET /api/v1/mentorship/my-mentors
const getMyMentors = async (req, res) => {
  try {
    const connections = await Mentorship.find({ studentId: req.user._id, status: "active" })
      .populate("mentorId", "name imageUrl bio domain linkedin github portfolio")
      .sort({ createdAt: -1 });

    res.json({ success: true, data: connections });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
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
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
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
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// POST /api/v1/mentorship/:mentorshipId/goals
const createGoal = async (req, res) => {
  try {
    const { mentorshipId } = req.params;
    const { title, description, tasks } = req.body;

    const connection = await Mentorship.findById(mentorshipId);
    if (!connection) return res.status(404).json({ success: false, message: "Mentorship connection not found" });

    if (connection.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only mentors can create goals" });
    }

    const goal = await MentorshipGoal.create({
      mentorshipId,
      title,
      description,
      tasks: tasks || []
    });

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// GET /api/v1/mentorship/:mentorshipId/goals
const getGoals = async (req, res) => {
  try {
    const { mentorshipId } = req.params;

    const connection = await Mentorship.findById(mentorshipId);
    if (!connection) return res.status(404).json({ success: false, message: "Mentorship connection not found" });

    const isStudent = connection.studentId.toString() === req.user._id.toString();
    const isMentor = connection.mentorId.toString() === req.user._id.toString();
    if (!isStudent && !isMentor) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const goals = await MentorshipGoal.find({ mentorshipId }).sort({ createdAt: 1 });
    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// PATCH /api/v1/mentorship/goals/:goalId
const updateGoal = async (req, res) => {
  try {
    const { goalId } = req.params;
    const { title, description, tasks } = req.body;

    const goal = await MentorshipGoal.findById(goalId);
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

    const connection = await Mentorship.findById(goal.mentorshipId);
    if (!connection) return res.status(404).json({ success: false, message: "Mentorship connection not found" });

    const isStudent = connection.studentId.toString() === req.user._id.toString();
    const isMentor = connection.mentorId.toString() === req.user._id.toString();
    if (!isStudent && !isMentor) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    if (isStudent && !isMentor) {
      if (tasks) {
        goal.tasks.forEach((t) => {
          const inputTask = tasks.find(it => it._id && it._id.toString() === t._id.toString());
          if (inputTask) {
            t.isCompleted = !!inputTask.isCompleted;
            t.completedAt = t.isCompleted ? (t.completedAt || new Date()) : null;
          }
        });
      }
    } else {
      if (title !== undefined) goal.title = title;
      if (description !== undefined) goal.description = description;
      if (tasks !== undefined) {
        goal.tasks = tasks.map(t => ({
          title: t.title,
          isCompleted: !!t.isCompleted,
          completedAt: t.isCompleted ? (t.completedAt || new Date()) : null,
          _id: t._id
        }));
      }
    }

    await goal.save();
    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// DELETE /api/v1/mentorship/goals/:goalId
const deleteGoal = async (req, res) => {
  try {
    const { goalId } = req.params;

    const goal = await MentorshipGoal.findById(goalId);
    if (!goal) return res.status(404).json({ success: false, message: "Goal not found" });

    const connection = await Mentorship.findById(goal.mentorshipId);
    if (!connection) return res.status(404).json({ success: false, message: "Mentorship connection not found" });

    if (connection.mentorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Only mentors can delete goals" });
    }

    await MentorshipGoal.findByIdAndDelete(goalId);
    res.json({ success: true, message: "Goal deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = {
  createRequest,
  getMyRequests,
  updateStatus,
  getMyMentors,
  getMyMentees,
  getMentorshipContact,
  createGoal,
  getGoals,
  updateGoal,
  deleteGoal,
};