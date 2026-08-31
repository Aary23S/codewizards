// codewizards/server/server.js
const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const connectDB = require("./config/db");
const cron = require("node-cron");
const axios = require("axios");

dotenv.config();

if (!process.env.JWT_SECRET) {
  console.error("Missing required env var JWT_SECRET — refusing to start with broken auth.");
  process.exit(1);
}

connectDB();

const app = express();

// Middleware
const allowedOrigins = [
  process.env.CLIENT_URL,
  "http://localhost:3000",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // Allow requests without an Origin (e.g., Postman)
      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
  })
);

const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;

cron.schedule("*/14 * * * *", async () => {
  try {
    await axios.get(`${SELF_URL}/`);
    console.log(`[keepalive] ping ok — ${new Date().toISOString()}`);
  } catch (err) {
    console.warn(`[keepalive] ping failed — ${err.message}`);
  }
});
app.use(express.json());

// Health check — reports DB connectivity too, since a live process with a dead
// DB connection is not actually "healthy" for anything the API does.
app.get("/", (req, res) => {
  const dbConnected = mongoose.connection.readyState === 1;
  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected ? "CodeWizards API running" : "API running, database unavailable",
    db: dbConnected ? "connected" : "disconnected",
  });
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
app.use("/api/v1/coding", require("./routes/coding.routes"));
app.use("/api/v1/leaderboard", require("./routes/leaderboard.routes"));
app.use("/api/v1/point-rules", require("./routes/pointRule.routes"));
app.use("/api/v1/blogs", require("./routes/blog.routes"));
app.use("/api/v1/team", require("./routes/team.routes"));
app.use("/api/v1/contact", require("./routes/contact.routes"));
app.use("/api/v1/collaborations", require("./routes/collaboration.routes"));

// Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);

  // A response already went out (e.g. a bug elsewhere threw after res.json()) —
  // writing again would throw ERR_HTTP_HEADERS_SENT, so just let Express close the request.
  if (res.headersSent) {
    return next(err);
  }

  const isMulterError = err && err.code && err.message && err.stack && err.stack.includes("multer");
  if (isMulterError || (err && err.name === "MulterError")) {
    return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
  }
  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => console.log(`Server running on port ${PORT}  🎉`));

// Graceful shutdown — let in-flight requests finish and close the DB connection
// cleanly instead of the process (and any open Mongo sockets) being killed mid-write.
const shutdown = (signal) => {
  console.log(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
    } catch (err) {
      console.error("Error closing DB connection:", err.message);
    }
    console.log("Shutdown complete.");
    process.exit(0);
  });

  // Safety net: force-exit if close() hangs (e.g. a stuck keep-alive connection)
  setTimeout(() => {
    console.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
