//gallery.controller.js
const Gallery = require("../models/Gallery");
const cloudinary = require("../config/cloudinary");

const uploadImage = (fileBuffer, originalName) =>
  new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary credentials are not configured on the server.");
      return reject(new Error("Cloudinary credentials are not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."));
    }
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "codewizards/gallery",
        resource_type: "image",
        public_id: `${Date.now()}-${originalName.replace(/\.[^.]+$/, "")}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary gallery upload failed:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });

const getGallery = async (req, res) => {
  try {
    const filter = {};
    if (req.query.category) filter.category = req.query.category;
    const items = await Gallery.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createGalleryItem = async (req, res) => {
  try {
    const payload = { ...req.body };
    
    if (req.files && req.files.length > 0) {
      const urls = await Promise.all(
        req.files.map((file) => uploadImage(file.buffer, file.originalname))
      );
      payload.imageUrls = urls;
      payload.imageUrl = urls[0] || "";
    } else if (req.file) {
      payload.imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
      payload.imageUrls = [payload.imageUrl];
    }

    const item = await Gallery.create(payload);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    console.error("Create gallery item failed:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/gallery/:id
const deleteGalleryItem = async (req, res) => {
  try {
    const item = await Gallery.findByIdAndDelete(req.params.id);
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getGallery, createGalleryItem, deleteGalleryItem };

