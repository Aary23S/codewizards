const express = require("express");
const router = express.Router();

const {
  getResources,
  createResource,
  updateResource,
  deleteResource,
} = require("../controllers/resource.controller");

const { protect, requireRole } = require("../middleware/auth");

router.get("/", getResources);
router.post("/", protect, requireRole("admin"), createResource);
router.patch("/:id", protect, requireRole("admin"), updateResource);
router.delete("/:id", protect, requireRole("admin"), deleteResource);

module.exports = router;
// resource.routes.js