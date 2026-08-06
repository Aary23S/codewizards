const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/auth");
const {
  connectCoding,
  getMyCodingProfileController,
  syncCoding,
  getPublicCodingProfileController,
} = require("../controllers/coding.controller");

router.post("/connect", protect, connectCoding);
router.get("/profile/me", protect, getMyCodingProfileController);
router.post("/sync", protect, syncCoding);
router.get("/public/:id", getPublicCodingProfileController);

module.exports = router;
// coding.routes.js