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
    req.user = await User.findById(decoded.id).select("-password");

    // Block suspended users from all protected routes
    if (req.user?.isSuspended) {
      return res.status(403).json({
        success: false,
        message: "Your account has been suspended. Contact admin.",
      });
    }

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

module.exports = { protect, requireRole };