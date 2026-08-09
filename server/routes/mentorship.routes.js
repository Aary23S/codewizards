const express = require("express");
const router = express.Router();
const {
  createRequest,
  getMyRequests,
  updateStatus,
  getMyMentors,
  getMyMentees,
  getMentorshipContact,
} = require("../controllers/mentorship.controller");
const { protect } = require("../middleware/auth");

router.post("/request", protect, createRequest);
router.get("/my-requests", protect, getMyRequests);
router.patch("/:id/status", protect, updateStatus);
router.get("/my-mentors", protect, getMyMentors);
router.get("/my-mentees", protect, getMyMentees);
router.get("/:id/contact", protect, getMentorshipContact);

module.exports = router;
// mentorship.routes.js