const User = require("../models/User");
const generateToken = require("../utils/generateToken");

const currentYear = () => new Date().getFullYear();

const deriveRole = ({ batch, programDurationYears }) => {
  const batchYear = Number(batch);
  const durationYears = Number(programDurationYears) > 0 ? Number(programDurationYears) : 4;

  if (!Number.isFinite(batchYear)) {
    return "student";
  }

  const delta = currentYear() - batchYear;
  if (delta < durationYears) return "student";
  if (delta === durationYears) return "senior";
  return "alumni";
};

// POST /api/v1/auth/register
const register = async (req, res) => {
  try {
    const { name, email, password, batch, programName, programDurationYears } = req.body;
    // role is derived from the academic track and never trusted directly from client input

    const exists = await User.findOne({ email });
    if (exists) {
      return res.status(400).json({ success: false, message: "Email already registered" });
    }

    const role = deriveRole({ batch, programDurationYears });
    const normalizedProgram = (programName || "").toString().trim();
    const normalizedDuration = Number(programDurationYears) > 0 ? Number(programDurationYears) : 4;

    const user = await User.create({
      name,
      email,
      password,
      batch,
      role,
      programName: normalizedProgram,
      programDurationYears: normalizedDuration,
    });

    res.status(201).json({
      success: true,
      data: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        batch: user.batch,
        programName: user.programName,
        programDurationYears: user.programDurationYears,
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
        batch: user.batch,
        programName: user.programName,
        programDurationYears: user.programDurationYears,
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
