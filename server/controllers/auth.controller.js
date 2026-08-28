//auth.controller.js
const crypto = require("crypto");
const User = require("../models/User");
const generateToken = require("../utils/generateToken");
const sendEmail = require("../utils/sendEmail");

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

// POST /api/v1/auth/forgot-password
const forgotPassword = async (req, res) => {
  const genericMessage = "If that email is registered, a reset link has been sent.";
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.json({ success: true, message: genericMessage });
    }

    const rawToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = crypto.createHash("sha256").update(rawToken).digest("hex");
    user.resetPasswordExpire = Date.now() + 30 * 60 * 1000; // 30 minutes
    await user.save();

    const resetLink = `${process.env.CLIENT_URL}/reset-password/${rawToken}`;

    try {
      await sendEmail({
        to: user.email,
        subject: "CodeWizards — Reset your password",
        html: `
          <p>Hi ${user.name},</p>
          <p>You requested a password reset. Click the link below to set a new password. This link expires in 30 minutes.</p>
          <p><a href="${resetLink}">${resetLink}</a></p>
          <p>If you didn't request this, you can safely ignore this email.</p>
        `,
      });
    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpire = undefined;
      await user.save();
      return res.status(500).json({ success: false, message: "Could not send email, try again later" });
    }

    res.json({ success: true, message: genericMessage });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/auth/reset-password/:token
const resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetPasswordToken: hashedToken,
      resetPasswordExpire: { $gt: Date.now() },
    }).select("+resetPasswordToken +resetPasswordExpire");

    if (!user) {
      return res.status(400).json({ success: false, message: "Invalid or expired reset link" });
    }

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.json({ success: true, message: "Password reset successful. You can now log in." });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword };
