const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const connectDB = require("./config/db");

dotenv.config();
connectDB();

const app = express();

// Middleware
app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());

// Health check — confirms server is alive
app.get("/", (req, res) => {
  res.json({ success: true, message: "CodeWizards API running" });
});

// Routes (we'll plug these in as we build each module)
app.use("/api/v1/projects", require("./routes/project.routes"));
app.use("/api/v1/events", require("./routes/event.routes"));
app.use("/api/v1/timeline", require("./routes/timeline.routes"));
app.use("/api/v1/gallery", require("./routes/gallery.routes"));
app.use("/api/v1/announcements", require("./routes/announcement.routes"));
app.use("/api/v1/auth", require("./routes/auth.routes"));
app.use("/api/v1/users", require("./routes/user.routes"));
app.use("/api/v1/mentorship", require("./routes/mentorship.routes"));
app.use("/api/v1/resources", require("./routes/resource.routes"));
app.use("/api/v1/opportunities", require("./routes/opportunities.routes"));
app.use("/api/v1/doubts", require("./routes/doubt.routes"));
app.use("/api/v1/sync", require("./routes/sync.routes"));
app.use("/api/v1/leaderboard", require("./routes/leaderboard.routes"));
app.use("/api/v1/point-rules", require("./routes/pointRule.routes"));
app.use("/api/v1/blogs", require("./routes/blog.routes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));