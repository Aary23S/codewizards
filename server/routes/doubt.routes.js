const express = require("express");
const router = express.Router();
const {
  getDoubts, getDoubt, createDoubt, addReply, toggleResolve, upvoteDoubt,
} = require("../controllers/doubt.controller");
const { protect } = require("../middleware/auth");

router.get("/", getDoubts);
router.get("/:id", getDoubt);
router.post("/", protect, createDoubt);
router.post("/:id/reply", protect, addReply);
router.patch("/:id/resolve", protect, toggleResolve);
router.patch("/:id/upvote", protect, upvoteDoubt);

module.exports = router;