const express = require("express");
const router = express.Router();
const { getTeam, createMember, updateMember, deleteMember } = require("../controllers/team.controller");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getTeam);
router.post("/", protect, requireRole("admin"), upload.single("image"), createMember);
router.patch("/:id", protect, requireRole("admin"), upload.single("image"), updateMember);
router.delete("/:id", protect, requireRole("admin"), deleteMember);

module.exports = router;
