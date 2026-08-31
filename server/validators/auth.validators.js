// codewizards/server/validators/auth.validators.js
const { body } = require("express-validator");

const registerValidators = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
  body("batch").optional({ values: "falsy" }).isInt().withMessage("Batch must be a year, e.g. 2026"),
  body("programDurationYears").optional({ values: "falsy" }).isInt({ min: 1, max: 10 }).withMessage("Program duration must be between 1 and 10 years"),
];

const loginValidators = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

const forgotPasswordValidators = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
];

const resetPasswordValidators = [
  body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters"),
];

module.exports = {
  registerValidators,
  loginValidators,
  forgotPasswordValidators,
  resetPasswordValidators,
};
