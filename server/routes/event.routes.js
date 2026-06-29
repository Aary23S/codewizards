const express = require("express");
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent } = require("../controllers/event.controller");
const { registerForEvent, getRegistrations, getMyRegistrations } = require("../controllers/eventRegistration.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getEvents);
router.get("/my-registrations", protect, requireRole("student"), getMyRegistrations);
router.get("/:id", getEvent);
router.post("/:id/register", protect, registerForEvent);
router.post("/", protect, requireRole("admin"), createEvent);
router.patch("/:id", protect, requireRole("admin"), updateEvent);
router.delete("/:id", protect, requireRole("admin"), deleteEvent);
router.get("/:id/registrations", protect, requireRole("admin"), getRegistrations);
router.post("/:id/register", protect, requireRole("student"), registerForEvent);


module.exports = router;
