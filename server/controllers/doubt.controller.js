//doubt.controller.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");
const Doubt = require("../models/Doubt");
const PointLedger = require("../models/PointLedger");
const { parsePagination } = require("../utils/paginate");

// GET /api/v1/doubts
const getDoubts = async (req, res) => {
    try {
        const filter = {};
        if (typeof req.query.domain === "string" && req.query.domain) filter.domain = req.query.domain;
        if (typeof req.query.resolved === "string" && req.query.resolved) filter.resolved = req.query.resolved === "true";

        const { active, limit, skip, page } = parsePagination(req.query);
        let query = Doubt.find(filter)
            .populate("author", "name role batch")
            .populate("replies.author", "name role")
            .sort({ createdAt: -1 });
        if (active) query = query.skip(skip).limit(limit);

        const doubts = await query;
        const response = { success: true, data: doubts };
        if (active) response.meta = { page, limit, total: await Doubt.countDocuments(filter) };
        res.json(response);
    } catch (error) {
        res.status(500).json({ success: false, message: safeErrorMessage(error) });
    }
};

// GET /api/v1/doubts/:id
const getDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id)
            .populate("author", "name role batch")
            .populate("replies.author", "name role batch");

        if (!doubt) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: doubt });
    } catch (error) {
        res.status(500).json({ success: false, message: safeErrorMessage(error) });
    }
};

// POST /api/v1/doubts
const createDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.create({ ...req.body, author: req.user._id });
        await doubt.populate("author", "name role batch");
        res.status(201).json({ success: true, data: doubt });
    } catch (error) {
        res.status(400).json({ success: false, message: safeErrorMessage(error) });
    }
};

// POST /api/v1/doubts/:id/reply
const addReply = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) return res.status(404).json({ success: false, message: "Not found" });

        doubt.replies.push({ body: req.body.body, author: req.user._id });
        await doubt.save();
        await doubt.populate("replies.author", "name role batch");

        res.status(201).json({ success: true, data: doubt });
    } catch (error) {
        res.status(400).json({ success: false, message: safeErrorMessage(error) });
    }
};

// PATCH /api/v1/doubts/:id/resolve
const toggleResolve = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) return res.status(404).json({ success: false, message: "Not found" });

        if (doubt.author.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: "Only the author can mark as resolved" });
        }

        doubt.resolved = !doubt.resolved;
        await doubt.save();
        const month = new Date().toISOString().slice(0, 7);
        try {
            await PointLedger.create({
                student: req.user._id,
                ruleKey: "doubt_answered",
                sourceType: "in_house",
                sourceId: doubt._id,
                month,
            });
        } catch (e) {
            // Duplicate entry (unique index) — already awarded, ignore silently
        }

        if (doubt.resolved) {
            const lastReply = doubt.replies[doubt.replies.length - 1];
            if (lastReply) {
                try {
                    await PointLedger.create({
                        student: lastReply.author,
                        ruleKey: "doubt_resolved",
                        sourceType: "in_house",
                        sourceId: doubt._id,
                        month,
                    });
                } catch (e) { /* already awarded */ }
            }
        }

        res.json({ success: true, data: doubt });
    } catch (error) {
        res.status(400).json({ success: false, message: safeErrorMessage(error) });
    }
};

// PATCH /api/v1/doubts/:id/upvote
const upvoteDoubt = async (req, res) => {
    try {
        const existing = await Doubt.findById(req.params.id).select("upvotes");
        if (!existing) return res.status(404).json({ success: false, message: "Not found" });

        const userId = req.user._id;
        const alreadyUpvoted = existing.upvotes.some((id) => id.toString() === userId.toString());

        // $addToSet/$pull are atomic at the database level — two concurrent requests from
        // different users can no longer stomp on each other's upvote the way a read-then-save could.
        const updated = await Doubt.findByIdAndUpdate(
            req.params.id,
            alreadyUpvoted ? { $pull: { upvotes: userId } } : { $addToSet: { upvotes: userId } },
            { new: true }
        ).select("upvotes");

        res.json({ success: true, data: { upvotes: updated.upvotes.length } });
    } catch (error) {
        res.status(400).json({ success: false, message: safeErrorMessage(error) });
    }
};

// DELETE /api/v1/doubts/:id  (admin or author)
const deleteDoubt = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: "Not found" });

    if (doubt.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    await doubt.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

// DELETE /api/v1/doubts/:id/replies/:replyId  (admin or reply author)
const deleteReply = async (req, res) => {
  try {
    const doubt = await Doubt.findById(req.params.id);
    if (!doubt) return res.status(404).json({ success: false, message: "Not found" });

    const reply = doubt.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ success: false, message: "Reply not found" });

    if (reply.author.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    reply.deleteOne();
    await doubt.save();
    res.json({ success: true, message: "Reply deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: safeErrorMessage(error) });
  }
};

module.exports = { getDoubts, getDoubt, createDoubt, addReply, toggleResolve, upvoteDoubt, deleteDoubt, deleteReply };