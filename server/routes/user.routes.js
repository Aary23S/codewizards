const express = require("express");
const router = express.Router();
const { getUsers, getUserById, updateUser } = require("../controllers/user.controller");
const { protect } = require("../middleware/auth");

router.get("/", getUsers);                        // public — used by /connect
router.get("/:id", getUserById);                  // public — profile view
router.patch("/:id", protect, updateUser);        // protected — own profile only

module.exports = router;