const express = require("express");
const router = express.Router();
const { getPointRules, updatePointRule } = require("../controllers/pointRule.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", protect, requireRole("admin"), getPointRules);
router.patch("/:id", protect, requireRole("admin"), updatePointRule);

module.exports = router;