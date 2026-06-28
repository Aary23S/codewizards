const express = require("express");
const router = express.Router();
const { getGallery, createGalleryItem } = require("../controllers/gallery.controller");

router.get("/", getGallery);
router.post("/", createGalleryItem);

module.exports = router;