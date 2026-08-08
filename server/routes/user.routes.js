const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, suspendUser } = require("../controllers/user.controller");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getUsers);
router.post("/", protect, requireRole("admin"), upload.single("image"), createUser);
router.patch("/:id/suspend", protect, requireRole("admin"), suspendUser);
router.get("/:id", getUserById);
router.patch("/:id", protect, upload.single("image"), updateUser);
router.delete("/:id", protect, requireRole("admin"), deleteUser);

module.exports = router;
