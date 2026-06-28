const express = require("express");
const router = express.Router();
const { getEvents, getEvent, createEvent } = require("../controllers/event.controller");

router.get("/", getEvents);
router.get("/:id", getEvent);
router.post("/", createEvent);

module.exports = router;