const express = require("express");
const router = express.Router();
const { createRequest, getMyRequests, updateStatus } = require("../controllers/mentorship.controller");
const { protect } = require("../middleware/auth");

router.post("/request", protect, createRequest);
router.get("/my-requests", protect, getMyRequests);
router.patch("/:id/status", protect, updateStatus);

module.exports = router;