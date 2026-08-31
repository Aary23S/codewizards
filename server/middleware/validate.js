// codewizards/server/middleware/validate.js
const { validationResult } = require("express-validator");

// Runs after a chain of express-validator checks; short-circuits with the first
// field error so existing "message: ..." response shape stays unchanged for callers.
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }
  next();
};

module.exports = validate;
