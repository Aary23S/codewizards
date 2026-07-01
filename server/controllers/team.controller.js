const TeamMember = require("../models/TeamMember");
const cloudinary = require("../config/cloudinary");

const uploadImage = (fileBuffer, originalName) =>
    new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
            {
                folder: "codewizards/team",
                resource_type: "image",
                public_id: `${Date.now()}-${originalName.replace(/\.[^.]+$/, "")}`,
            },
            (error, result) => {
                if (error) return reject(error);
                resolve(result.secure_url);
            }
        );

        stream.end(fileBuffer);
    });

const normalizePayload = async (req) => {
    const payload = { ...req.body };

    if (payload.batch !== undefined && payload.batch !== "") {
        payload.batch = Number(payload.batch);
    } else {
        delete payload.batch;
    }

    if (payload.order !== undefined && payload.order !== "") {
        payload.order = Number(payload.order);
    } else {
        delete payload.order;
    }

    if (payload.teamYear !== undefined && payload.teamYear !== "") {
        payload.teamYear = Number(payload.teamYear);
    } else {
        delete payload.teamYear;
    }

    if (typeof payload.domain === "string") {
        payload.domain = payload.domain
            .split(",")
            .map((item) => item.trim())
            .filter(Boolean);
    }

    if (req.file) {
        payload.imageUrl = await uploadImage(req.file.buffer, req.file.originalname);
    }

    return payload;
};

const getTeam = async (req, res) => {
    try {
        const members = await TeamMember.find().sort({ teamYear: -1, order: 1, createdAt: 1 });
        res.json({ success: true, data: members });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const createMember = async (req, res) => {
    try {
        const member = await TeamMember.create(await normalizePayload(req));
        res.status(201).json({ success: true, data: member });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const updateMember = async (req, res) => {
    try {
        const member = await TeamMember.findByIdAndUpdate(req.params.id, await normalizePayload(req), {
            new: true, runValidators: true,
        });
        if (!member) return res.status(404).json({ success: false, message: "Not found" });
        res.json({ success: true, data: member });
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const deleteMember = async (req, res) => {
    try {
        await TeamMember.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Deleted" });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { getTeam, createMember, updateMember, deleteMember };
