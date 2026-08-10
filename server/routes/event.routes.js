const express = require("express");
const router = express.Router();
const { getEvents, getEvent, createEvent, updateEvent, deleteEvent } = require("../controllers/event.controller");
const { registerForEvent, cancelEventRegistration, getRegistrations, getMyRegistrations } = require("../controllers/eventRegistration.controller");
const { protect, requireRole, optionalProtect } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", optionalProtect, getEvents);
router.get("/my-registrations", protect, requireRole("student"), getMyRegistrations);
router.get("/:id", optionalProtect, getEvent);
router.post("/", protect, requireRole("admin"), upload.single("image"), createEvent);
router.patch("/:id", protect, requireRole("admin"), upload.single("image"), updateEvent);
router.delete("/:id", protect, requireRole("admin"), deleteEvent);
router.get("/:id/registrations", protect, requireRole("admin"), getRegistrations);
router.post("/:id/register", protect, requireRole("student"), registerForEvent);
router.delete("/:id/register", protect, requireRole("student"), cancelEventRegistration);

module.exports = router;
// event.routes.js