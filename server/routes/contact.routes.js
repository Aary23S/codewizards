const express = require("express");
const router = express.Router();
const rateLimit = require("express-rate-limit");
const { getContact, upsertContact, sendContactMessage } = require("../controllers/contact.controller");
const { protect, requireRole } = require("../middleware/auth");

const messageLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

router.get("/", getContact);
router.put("/", protect, requireRole("admin"), upsertContact);
router.post("/message", messageLimiter, sendContactMessage);

module.exports = router;
// contact.routes.js