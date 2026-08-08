const express = require("express");
const router = express.Router();
const { getGallery, createGalleryItem, deleteGalleryItem } = require("../controllers/gallery.controller");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getGallery);
router.post("/", protect, requireRole("admin"), upload.array("images", 10), createGalleryItem);
router.delete("/:id", protect, requireRole("admin"), deleteGalleryItem);

module.exports = router;
// gallery.routes.js