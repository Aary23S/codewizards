const express = require("express");
const router = express.Router();
const { getAnnouncements, createAnnouncement } = require("../controllers/announcement.controller");

router.get("/", getAnnouncements);
router.post("/", createAnnouncement);

module.exports = router;