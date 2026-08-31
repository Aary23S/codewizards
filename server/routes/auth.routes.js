const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { register, login, getMe, forgotPassword, resetPassword, logout } = require("../controllers/auth.controller");
const { protect } = require("../middleware/auth");
const validate = require("../middleware/validate");
const {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
} = require("../validators/auth.validators");

const forgotPasswordLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });
const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 15 });
const registerLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.post("/register", registerLimiter, registerValidators, validate, register);
router.post("/login", loginLimiter, loginValidators, validate, login);
router.get("/me", protect, getMe);   // protect runs first, then getMe
router.post("/logout", protect, logout);
router.post("/forgot-password", forgotPasswordLimiter, forgotPasswordValidators, validate, forgotPassword);
router.post("/reset-password/:token", resetPasswordValidators, validate, resetPassword);

module.exports = router;
// auth.routes.js