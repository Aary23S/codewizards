// codewizards/server/tests/setupEnv.js
// Runs before any test file's module graph loads (jest "setupFiles"), so
// requiring app.js/routes/models never sees an undefined JWT_SECRET etc.
process.env.JWT_SECRET = process.env.JWT_SECRET || "test-jwt-secret";
process.env.CLIENT_URL = process.env.CLIENT_URL || "http://localhost:3000";
process.env.NODE_ENV = "test";
