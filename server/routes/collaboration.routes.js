// codewizards/server/routes/collaboration.routes.js
const express = require("express");
const router = express.Router();
const {
  getCollaborations,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
} = require("../controllers/collaboration.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getCollaborations);
router.post("/", protect, requireRole("admin"), createCollaboration);
router.patch("/:id", protect, requireRole("admin"), updateCollaboration);
router.delete("/:id", protect, requireRole("admin"), deleteCollaboration);

module.exports = router;
