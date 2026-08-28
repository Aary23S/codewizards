const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { register, login, getMe, forgotPassword, resetPassword } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");

const forgotPasswordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

router.post("/register", register);
router.post("/login", login);
router.get("/me", protect, getMe);   // protect runs first, then getMe
router.post("/forgot-password", forgotPasswordLimiter, forgotPassword);
router.post("/reset-password/:token", resetPassword);

module.exports = router;
// auth.routes.js