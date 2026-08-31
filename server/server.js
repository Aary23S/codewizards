// codewizards/server/server.js
const dotenv = require("dotenv");
dotenv.config();

const logger = require("./utils/logger");

if (!process.env.JWT_SECRET) {
  logger.error("Missing required env var JWT_SECRET — refusing to start with broken auth.");
  process.exit(1);
}

const mongoose = require("mongoose");
const cron = require("node-cron");
const axios = require("axios");
const connectDB = require("./config/db");
const app = require("./app");

connectDB();

const SELF_URL = process.env.RENDER_EXTERNAL_URL || `http://localhost:${process.env.PORT || 5000}`;

cron.schedule("*/14 * * * *", async () => {
  try {
    await axios.get(`${SELF_URL}/`);
    logger.info("[keepalive] ping ok");
  } catch (err) {
    logger.warn({ err }, "[keepalive] ping failed");
  }
});

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => logger.info(`Server running on port ${PORT}`));

// Graceful shutdown — let in-flight requests finish and close the DB connection
// cleanly instead of the process (and any open Mongo sockets) being killed mid-write.
const shutdown = (signal) => {
  logger.info(`${signal} received, shutting down gracefully...`);
  server.close(async () => {
    try {
      await mongoose.connection.close();
    } catch (err) {
      logger.error({ err }, "Error closing DB connection");
    }
    logger.info("Shutdown complete.");
    process.exit(0);
  });

  // Safety net: force-exit if close() hangs (e.g. a stuck keep-alive connection)
  setTimeout(() => {
    logger.error("Forced shutdown after timeout.");
    process.exit(1);
  }, 10000).unref();
};

process.on("SIGTERM", () => shutdown("SIGTERM"));
process.on("SIGINT", () => shutdown("SIGINT"));
