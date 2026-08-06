const express = require("express");
const router = express.Router();
const { getUsers, getUserById, createUser, updateUser, deleteUser, suspendUser } = require("../controllers/user.controller");
const { protect, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.get("/", getUsers);                        // public — used by /connect
router.get("/:id", getUserById);                  // public — profile view
router.post("/", protect, requireRole("admin"), upload.single("image"), createUser);
router.patch("/:id", protect, upload.single("image"), updateUser);        // protected — own profile or admin
router.delete("/:id", protect, requireRole("admin"), deleteUser);
router.patch("/:id/suspend", protect, requireRole("admin"), suspendUser);
// router.delete("/:id", protect, requireRole("admin"), deleteUser);

module.exports = router;
// user.routes.js