const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const currentYear = () => new Date().getFullYear();

// POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, batch, accountType } = req.body;
    // accountType: "student" | "senior_alumni" — comes from the radio choice
    // role is NEVER trusted directly from client input

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    let role = "student";
    if (accountType === "senior_alumni") {
      role = batch <= currentYear() - 4 ? "alumni" : "senior";
    }

    const user = await User.create({ name, email, password, batch, role });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// POST /api/v1/auth/login — unchanged, role comes from DB record
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }
    res.json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const getMe = async (req, res) => {
  res.json({ success: true, data: req.user });
};

module.exports = { register, login, getMe };