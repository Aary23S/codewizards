//user.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const MentorshipRequest = require("../models/MentorshipRequest");
const Mentorship = require("../models/Mentorship");
const MentorshipGoal = require("../models/MentorshipGoal");
const Doubt = require("../models/Doubt");
const Blog = require("../models/Blogs");
const EventRegistration = require("../models/EventRegistration");
const Opportunity = require("../models/Opportunities");
const PointLedger = require("../models/PointLedger");
const CodingProfile = require("../models/CodingProfile");
const { parsePagination } = require("../utils/paginate");

const uploadImage = (fileBuffer, originalName) =>
  new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary credentials are not configured on the server.");
      return reject(new Error("Cloudinary credentials are not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."));
    }
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "codewizards/users",
        resource_type: "image",
        public_id: `${Date.now()}-${originalName.replace(/\.[^.]+$/, "")}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary upload failed:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });

const normalizePayload = async (req) => {
  const payload = { ...(req.body || {}) };

  if (typeof payload.contactPreferences === "string") {
    try {
      payload.contactPreferences = JSON.parse(payload.contactPreferences);
    } catch (e) {
      delete payload.contactPreferences;
    }
  }

  if (payload.batch !== undefined && payload.batch !== "") {
    payload.batch = Number(payload.batch);
  } else {
    delete payload.batch;
  }

  if (payload.programDurationYears !== undefined && payload.programDurationYears !== "") {
    payload.programDurationYears = Number(payload.programDurationYears);
  } else {
    delete payload.programDurationYears;
  }

  if (typeof payload.domain === "string") {
    payload.domain = payload.domain
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof payload.canHelpWith === "string") {
    payload.canHelpWith = payload.canHelpWith
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  if (typeof payload.isMentor === "string") {
    payload.isMentor = payload.isMentor === "true";
  }

  // Parse LinkedIn-style subfields
  const jsonKeys = ["experiences", "education", "certifications"];
  jsonKeys.forEach((key) => {
    if (typeof payload[key] === "string") {
      try {
        payload[key] = JSON.parse(payload[key]);
      } catch (err) {
        // Fallback to empty list or let validator fail
        payload[key] = [];
      }
    }
  });

  if (req.file) {
    payload.imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
  } else if (typeof payload.imageUrl === "string" && payload.imageUrl.trim() === "") {
    delete payload.imageUrl;
  }

  return payload;
};

// GET /api/v1/users/:id — public profile
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select("-password -email -phone -whatsapp -discord -contactPreferences");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// GET /api/v1/users — list with filters
const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (typeof req.query.role === "string" && req.query.role) filter.role = req.query.role;
    if (typeof req.query.domain === "string" && req.query.domain) filter.domain = { $in: [req.query.domain] };
    if (typeof req.query.isMentor === "string" && req.query.isMentor) filter.isMentor = req.query.isMentor === "true";

    const { active, limit, skip, page } = parsePagination(req.query);
    let query = User.find(filter).select("-password -email -phone -whatsapp -discord -contactPreferences").sort({ createdAt: -1 });
    if (active) query = query.skip(skip).limit(limit);

    const users = await query;
    const response = { success: true, data: users };
    if (active) response.meta = { page, limit, total: await User.countDocuments(filter) };
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// PATCH /api/v1/users/:id — own profile only
const updateUser = async (req, res) => {
  try {
    const isAdmin = req.user.role === "admin";
    const isSelf = req.user._id.toString() === req.params.id;

    if (!isAdmin && !isSelf) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const updates = await normalizePayload(req);
    delete updates.password;
    // externalStats is written only by the coding-sync service; isVerified/isSuspended are admin-only trust flags
    delete updates.externalStats;
    delete updates.isVerified;
    delete updates.isSuspended;
    delete updates.suspendedReason;
    if (!isAdmin) {
      delete updates.role;
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    console.error("Update user failed:", error);
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// POST /api/v1/users — admin only
const createUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const {
      name,
      email,
      password,
      role = "student",
      batch,
      programName = "",
      programDurationYears = 4,
      domain = [],
      bio,
      imageUrl,
      isMentor = false,
      github,
      linkedin,
      leetcode,
      codeforces,
      portfolio,
    } = await normalizePayload(req);
    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      batch,
      programName,
      programDurationYears,
      domain,
      bio,
      imageUrl,
      isMentor,
      github,
      linkedin,
      leetcode,
      codeforces,
      portfolio,
    });

    res.status(201).json({ success: true, data: await User.findById(user._id).select("-password") });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

const deleteUser = async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    const userId = user._id;

    // Clean up everything that referenced this user so populate()/count queries
    // never trip over a dangling reference to a deleted account.
    const ownedMentorships = await Mentorship.find({ $or: [{ studentId: userId }, { mentorId: userId }] }).select("_id");
    const ownedMentorshipIds = ownedMentorships.map((m) => m._id);

    await Promise.all([
      MentorshipRequest.deleteMany({ $or: [{ studentId: userId }, { mentorId: userId }] }),
      Mentorship.deleteMany({ _id: { $in: ownedMentorshipIds } }),
      MentorshipGoal.deleteMany({ mentorshipId: { $in: ownedMentorshipIds } }),
      Doubt.deleteMany({ author: userId }), // their own questions, replies included
      Doubt.updateMany({ "replies.author": userId }, { $pull: { replies: { author: userId } } }), // just their replies on others' questions
      Blog.deleteMany({ author: userId }),
      EventRegistration.deleteMany({ studentId: userId }),
      Opportunity.deleteMany({ postedBy: userId }),
      PointLedger.deleteMany({ student: userId }),
      CodingProfile.deleteOne({ userId }),
    ]);

    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// PATCH /api/v1/users/:id/suspend  (admin only)
const suspendUser = async (req, res) => {
  try {
    const { isSuspended, suspendedReason } = req.body || {};
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { isSuspended, suspendedReason: isSuspended ? suspendedReason || "" : "" },
      { new: true }
    ).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// // DELETE /api/v1/users/:id  (admin only)
// const deleteUser = async (req, res) => {
//   try {
//     const user = await User.findByIdAndDelete(req.params.id);
//     if (!user) return res.status(404).json({ success: false, message: "User not found" });
//     res.json({ success: true, message: "User deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

module.exports = { getUsers, getUserById, updateUser, suspendUser, deleteUser, createUser };
// module.exports = { getUsers, getUserById, createUser, updateUser, deleteUser };
