//auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Verifies JWT — attaches user to req
const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) return res.status(401).json({ success: false, message: "Not authorized" });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password +tokenVersion");

    if (!user || (decoded.tokenVersion || 0) !== (user.tokenVersion || 0)) {
      return res.status(401).json({ success: false, message: "Token invalid" });
    }

    // Block suspended users from all protected routes
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact admin.",
      });
    }

    user.tokenVersion = undefined; // internal only — never surface it in API responses
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: "Token invalid" });
  }
};

// Call after protect — checks role
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    next();
  };
};

const optionalProtect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
  }
  if (!token) {
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.id).select("-password");
  } catch (error) {
    // Ignore invalid tokens for public routes
  }
  next();
};

module.exports = { protect, requireRole, optionalProtect };