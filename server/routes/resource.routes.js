const express = require("express");
const router = express.Router();
const { getResources, createResource } = require("../controllers/resource.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getResources);
router.post("/", protect, requireRole("admin"), createResource);

module.exports = router;