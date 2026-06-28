const Announcement = require("../models/Announcement");

const getAnnouncements = async (req, res) => {
  try {
    const items = await Announcement.find().sort({ createdAt: -1 });
    res.json({ success: true, data: items });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const createAnnouncement = async (req, res) => {
  try {
    const item = await Announcement.create(req.body);
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
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
    res.status(400).json({ success: false, message: error.message });
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
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement };
