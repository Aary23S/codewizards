const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, suspendUser } = require("../controllers/user.controller");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

// user.routes.js — correct order, specific routes before param routes
router.get("/", getUsers);
router.post("/", protect, requireRole("admin"), handleUpload.single("image"), createUser);

// Specific sub-routes BEFORE /:id
router.patch("/:id/suspend", protect, requireRole("admin"), suspendUser);

// Generic param routes LAST
router.get("/:id", getUserById);
router.patch("/:id", protect, handleUpload.single("image"), updateUser);
router.delete("/:id", protect, requireRole("admin"), deleteUser);

module.exports = router;
// user.routes.js