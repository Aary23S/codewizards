const express = require("express");
const router = express.Router();
const { getTeam, createMember, updateMember, deleteMember } = require("../controllers/team.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getTeam);
router.post("/", protect, requireRole("admin"), createMember);
router.patch("/:id", protect, requireRole("admin"), updateMember);
router.delete("/:id", protect, requireRole("admin"), deleteMember);

module.exports = router;