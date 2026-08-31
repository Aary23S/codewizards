//resource.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const Resource = require("../models/Resource");
const { parsePagination } = require("../utils/paginate");

const getResources = async (req, res) => {
  try {
    const filter = {};
    if (typeof req.query.category === "string" && req.query.category) filter.category = req.query.category;
    if (typeof req.query.domain === "string" && req.query.domain) filter.domain = req.query.domain;

    const { active, limit, skip, page } = parsePagination(req.query);
    let query = Resource.find(filter).sort({ createdAt: -1 });
    if (active) query = query.skip(skip).limit(limit);

    const resources = await query;
    const response = { success: true, data: resources };
    if (active) response.meta = { page, limit, total: await Resource.countDocuments(filter) };
    res.json(response);
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

const createResource = async (req, res) => {
  try {
    const resource = await Resource.create(req.body);
    res.status(201).json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

const updateResource = async (req, res) => {
  try {
    const resource = await Resource.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!resource) {
      return res.status(404).json({ success: false, message: "Resource not found" });
    }
    res.json({ success: true, data: resource });
  } catch (error) {
    res.status(400).json({ success: false, message: safeErrorMessage(error) });
  }
};

const deleteResource = async (req, res) => {
  try {
    await Resource.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = { getResources, createResource, updateResource, deleteResource };
