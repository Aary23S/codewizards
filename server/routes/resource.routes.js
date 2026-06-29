const express = require("express");
const router = express.Router();

const {
  getResources,
  createResource,
  deleteResource,
} = require("../controllers/resource.controller");

const { protect, requireRole } = require("../middleware/auth");

router.get("/", getResources);
router.post("/", protect, requireRole("admin"), createResource);
router.delete("/:id", protect, requireRole("admin"), deleteResource);

module.exports = router;