const express = require("express");
const router = express.Router();
const { syncCodeforces, syncLeetcode, syncGithub } = require("../controllers/sync.controller");
const { protect } = require("../middleware/auth");

router.post("/codeforces", protect, syncCodeforces);
router.post("/leetcode", protect, syncLeetcode);
router.post("/github", protect, syncGithub);

module.exports = router;