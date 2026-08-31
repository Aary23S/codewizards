const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { register, login, getMe, forgotPassword, resetPassword, logout } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

const forgotPasswordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15 });
const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post("/register", registerLimiter, register);
router.post("/login", loginLimiter, login);
router.get("/me", protect, getMe);   // protect runs first, then getMe
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
// auth.routes.js