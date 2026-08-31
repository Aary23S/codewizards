// codewizards/server/app.js
// Pure Express app config — no DB connect, no listen(), no process lifecycle.
// Split out from server.js so tests can exercise routes via supertest without
// binding a real port or touching the real database.
const fs = require("fs");
const path = require("path");
const express = require("express");
const helmet = require("helmet");
const cors = require("cors");
const mongoose = require("mongoose");
const pinoHttp = require("pino-http");
const yaml = require("js-yaml");
const swaggerUi = require("swagger-ui-express");
const logger = require("./utils/logger");

const openapiSpec = yaml.load(fs.readFileSync(path.join(__dirname, "openapi.yaml"), "utf8"));

const app = express();

// Security headers — this is a pure JSON API (no HTML/local static assets, uploads
// go straight to Cloudinary), so helmet's defaults are safe with no CSP tuning needed.
app.use(helmet());

// Structured request logging — every request gets one log line with method,
// path, status, and response time instead of no visibility at all in production.
app.use(
  pinoHttp({
    logger,
    serializers: {
      req: (req) => ({ method: req.method, url: req.url }),
      res: (res) => ({ statusCode: res.statusCode }),
    },
  })
);

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

app.use(express.json());

// API docs — helmet's default CSP (script-src 'self', no unsafe-inline) blocks the
// inline bootstrap script Swagger UI's HTML page ships with, so relax CSP for just
// this route rather than loosening it for the actual JSON API.
app.use(
  "/api-docs",
  (req, res, next) => {
    res.removeHeader("Content-Security-Policy");
    next();
  },
  swaggerUi.serve,
  swaggerUi.setup(openapiSpec)
);

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
  logger.error({ err }, "Unhandled error");

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

module.exports = app;
