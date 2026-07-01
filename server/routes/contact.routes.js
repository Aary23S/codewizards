const express = require("express");
const router = express.Router();
const { getContact, upsertContact } = require("../controllers/contact.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getContact);
router.put("/", protect, requireRole("admin"), upsertContact);

module.exports = router;