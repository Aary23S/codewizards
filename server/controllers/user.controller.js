const User = require("../models/User");

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
    // Only allow updating own profile
    if (req.user._id.toString() !== req.params.id) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    // Never allow role or password change through this route
    const { role, password, ...updates } = req.body;

    const user = await User.findByIdAndUpdate(
      req.params.id,
      updates,
      { new: true, runValidators: true }
    ).select("-password");

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

module.exports = { getUsers, getUserById, updateUser };