const express = require("express");
const router = express.Router();
const { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } = require("../controllers/announcement.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getAnnouncements);
router.post("/", protect, requireRole("admin"), createAnnouncement);
router.patch("/:id", protect, requireRole("admin"), updateAnnouncement);
router.delete("/:id", protect, requireRole("admin"), deleteAnnouncement);

module.exports = router;
