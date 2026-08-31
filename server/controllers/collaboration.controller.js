// codewizards/server/controllers/collaboration.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const Collaboration = require("../models/Collaboration");
const { parsePagination } = require("../utils/paginate");

const normalizePayload = (req) => {
  const payload = { ...req.body };

  if (typeof payload.representatives === "string") {
    try {
      payload.representatives = JSON.parse(payload.representatives);
    } catch (_) {
      payload.representatives = [];
    }
  }

  return payload;
};

const getCollaborations = async (req, res) => {
  try {
    const { active, limit, skip, page } = parsePagination(req.query);
    let query = Collaboration.find().sort({ createdAt: -1 });
    if (active) query = query.skip(skip).limit(limit);

    const list = await query;
    const response = { success: true, data: list };
    if (active) response.meta = { page, limit, total: await Collaboration.countDocuments() };
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

const createCollaboration = async (req, res) => {
  try {
    const item = await Collaboration.create(normalizePayload(req));
    res.status(201).json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

const updateCollaboration = async (req, res) => {
  try {
    const item = await Collaboration.findByIdAndUpdate(req.params.id, normalizePayload(req), {
      new: true,
      runValidators: true,
    });
    if (!item) return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: item });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

const deleteCollaboration = async (req, res) => {
  try {
    await Collaboration.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = {
  getCollaborations,
  createCollaboration,
  updateCollaboration,
  deleteCollaboration,
};
