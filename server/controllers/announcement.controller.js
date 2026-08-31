//announcement.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const Announcement = require("../models/Announcement");
const { parsePagination } = require("../utils/paginate");

const getAnnouncements = async (req, res) => {
  try {
    const { active, limit, skip, page } = parsePagination(req.query);
    let query = Announcement.find().sort({ createdAt: -1 });
    if (active) query = query.skip(skip).limit(limit);

    const items = await query;
    const response = { success: true, data: items };
    if (active) response.meta = { page, limit, total: await Announcement.countDocuments() };
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const item = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

const updateAnnouncement = async (req, res) => {
  try {
    const item = await Announcement.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Not found" });
    }

    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

const deleteAnnouncement = async (req, res) => {
  try {
    const item = await Announcement.findByIdAndDelete(req.params.id);
    if (!item) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
