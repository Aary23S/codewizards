const Event = require("../models/Event");
const cloudinary = require("../config/cloudinary");
const EventRegistration = require("../models/EventRegistration");
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const logger = require("../utils/logger");

const uploadImage = (fileBuffer, originalName) =>
  new Promise((resolve, reject) => {
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      logger.error("Cloudinary credentials are not configured on the server.");
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
          logger.error({ err: error }, "Cloudinary event upload failed");
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
    const eventIds = events.map((e) => e._id);
    const registrations = await EventRegistration.find({
      eventId: { $in: eventIds },
      status: { $in: ["registered", "attended"] },
    });

    // Map to dynamically populate status based on current date
    const mapped = events.map((event) => {
      const obj = event.toObject();
      obj.status = new Date(event.date) < now ? "completed" : "upcoming";

      const eventRegs = registrations.filter((r) => r.eventId.toString() === event._id.toString());
      const targetStudentId = req.query.studentId || (req.user ? req.user._id.toString() : null);
      const userReg = targetStudentId ? eventRegs.find((r) => r.studentId.toString() === targetStudentId.toString()) : null;

      obj.registration = {
        isRegistered: !!userReg,
        status: userReg ? userReg.status : null,
        certificateHash: userReg ? userReg.certificateHash : null,
        attendedAt: userReg ? userReg.attendedAt : null,
        registeredCount: eventRegs.length,
      };
      return obj;
    });

    res.json({ success: true, data: mapped });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// GET /api/v1/events/:id
const getEvent = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ success: false, message: "Not found" });

    const registrations = await EventRegistration.find({
      eventId: event._id,
      status: { $in: ["registered", "attended"] },
    });

    const obj = event.toObject();
    obj.status = new Date(event.date) < new Date() ? "completed" : "upcoming";

    const targetStudentId = req.query.studentId || (req.user ? req.user._id.toString() : null);
    const userReg = targetStudentId ? registrations.find((r) => r.studentId.toString() === targetStudentId.toString()) : null;
    obj.registration = {
      isRegistered: !!userReg,
      status: userReg ? userReg.status : null,
      certificateHash: userReg ? userReg.certificateHash : null,
      attendedAt: userReg ? userReg.attendedAt : null,
      registeredCount: registrations.length,
    };

    res.json({ success: true, data: obj });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
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
    logger.error({ err: error }, "Create event failed");
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
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
    logger.error({ err: error }, "Update event failed");
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

// DELETE /api/v1/events/:id
const deleteEvent = async (req, res) => {
  try {
    const event = await Event.findByIdAndDelete(req.params.id);
    if (!event) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    await EventRegistration.deleteMany({ eventId: event._id });
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = { getEvents, getEvent, createEvent, updateEvent, deleteEvent };
