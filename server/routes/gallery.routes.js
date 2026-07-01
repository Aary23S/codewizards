const express = require("express");
const router = express.Router();
const { getGallery, createGalleryItem, deleteGalleryItem } = require("../controllers/gallery.controller");
const { protect, requireRole } = require("../middleware/auth");

router.get("/", getGallery);
router.post("/", protect, requireRole("admin"), createGalleryItem);
router.delete("/:id", protect, requireRole("admin"), deleteGalleryItem);

module.exports = router;