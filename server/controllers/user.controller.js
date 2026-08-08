//user.controller.js
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");

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

  if (typeof payload.isMentor === "string") {
    payload.isMentor = payload.isMentor === "true";
  }

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
    const user = await User.findById(req.params.id).select("-password");
    if (!user) return res.status(404).json({ success: false, message: "User not found" });
    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/users — list with filters
const getUsers = async (req, res) => {
  try {
    const filter = {};
    if (req.query.role) filter.role = req.query.role;
    if (req.query.domain) filter.domain = { $in: [req.query.domain] };
    if (req.query.isMentor) filter.isMentor = req.query.isMentor === "true";

    const users = await User.find(filter).select("-password").sort({ createdAt: -1 });
    res.json({ success: true, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(400).json({ success: false, message: error.message });
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
    res.status(400).json({ success: false, message: error.message });
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

    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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
    res.status(400).json({ success: false, message: error.message });
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
