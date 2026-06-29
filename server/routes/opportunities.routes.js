const express = require("express");
const router = express.Router();
const {
  getOpportunities,
  createOpportunity,
  deleteOpportunity,
} = require("../controllers/opportunities.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getOpportunities);
router.post("/", protect, requireRole("senior", "alumni", "admin"), createOpportunity);
router.delete("/:id", protect, deleteOpportunity);

module.exports = router;