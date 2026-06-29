const Doubt = require("../models/Doubt");
const PointLedger = require("../models/PointLedger");

// GET /api/v1/doubts
const getDoubts = async (req, res) => {
    try {
        const filter = {};
        if (req.query.domain) filter.domain = req.query.domain;
        if (req.query.resolved) filter.resolved = req.query.resolved === "true";

        const doubts = await Doubt.find(filter)
            .populate("author", "name role batch")
            .populate("replies.author", "name role")
            .sort({ createdAt: -1 });

        res.json({ success: true, data: doubts });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
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
        res.status(500).json({ success: false, message: error.message });
    }
};

// POST /api/v1/doubts
const createDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.create({ ...req.body, author: req.user._id });
        await doubt.populate("author", "name role batch");
        res.status(201).json({ success: true, data: doubt });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
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
        res.status(400).json({ success: false, message: error.message });
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
        res.json({ success: true, data: doubt });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }

    if (doubt.resolved) {
        const lastReply = doubt.replies[doubt.replies.length - 1];
        if (lastReply) {
            const month = new Date().toISOString().slice(0, 7);
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
};

// PATCH /api/v1/doubts/:id/upvote
const upvoteDoubt = async (req, res) => {
    try {
        const doubt = await Doubt.findById(req.params.id);
        if (!doubt) return res.status(404).json({ success: false, message: "Not found" });

        const userId = req.user._id.toString();
        const alreadyUpvoted = doubt.upvotes.map((id) => id.toString()).includes(userId);

        if (alreadyUpvoted) {
            doubt.upvotes = doubt.upvotes.filter((id) => id.toString() !== userId);
        } else {
            doubt.upvotes.push(req.user._id);
        }

        await doubt.save();
        res.json({ success: true, data: { upvotes: doubt.upvotes.length } });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

module.exports = { getDoubts, getDoubt, createDoubt, addReply, toggleResolve, upvoteDoubt };