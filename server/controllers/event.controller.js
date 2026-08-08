//event.controller.js
const Event = require("../models/Event");
const cloudinary = require("../config/cloudinary");

const uploadImage = (fileBuffer, originalName) =>
  new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary credentials are not configured on the server.");
      return reject(new Error("Cloudinary credentials are not configured on the server. Please set CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET."));
    }
    const stream = cloudinary.uploader.upload_stream(
      {
        folder: "codewizards/events",
        resource_type: "image",
        public_id: `${Date.now()}-${originalName.replace(/\.[^.]+$/, "")}`,
      },
      (error, result) => {
        if (error) {
          console.error("Cloudinary event upload failed:", error);
          return reject(error);
        }
        resolve(result.secure_url);
      }
    );

    stream.end(fileBuffer);
  });

// GET /api/v1/events?status=upcoming
const getEvents = async (req, res) => {
  try {
    const filter = {};
    const now = new Date();

    if (req.query.status) {
      if (req.query.status === "upcoming") {
        filter.date = { $gte: now };
      } else if (req.query.status === "completed") {
        filter.date = { $lt: now };
      }
    }
    if (req.query.featured === "true") filter.featured = true;

    const events = await Event.find(filter).sort({ date: -1 });

    // Map to dynamically populate status based on current date
    const mapped = events.map((event) => {
      const obj = event.toObject();
      obj.status = new Date(event.date) < now ? "completed" : "upcoming";
      return obj;
    });

    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/v1/events/:id
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Not found" });

    const obj = event.toObject();
    obj.status = new Date(event.date) < new Date() ? "completed" : "upcoming";

    res.json({ success: true, data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// POST /api/v1/events
const createEvent = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Auto status based on date
    if (payload.date) {
      payload.status = new Date(payload.date) < new Date() ? "completed" : "upcoming";
    }

    if (req.file) {
      payload.imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
    }

    const event = await Event.create(payload);
    res.status(201).json({ success: true, data: event });
  } catch (error) {
    console.error("Create event failed:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// PATCH /api/v1/events/:id
const updateEvent = async (req, res) => {
  try {
    const payload = { ...req.body };

    // Auto status based on date
    if (payload.date) {
      payload.status = new Date(payload.date) < new Date() ? "completed" : "upcoming";
    }

    if (req.file) {
      payload.imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
    }

    const event = await Event.findByIdAndUpdate(req.params.id, payload, {
      new: true,
      runValidators: true,
    });

    if (!event) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: event });
  } catch (error) {
    console.error("Update event failed:", error);
    res.status(400).json({ success: false, message: error.message });
  }
};

// DELETE /api/v1/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };
