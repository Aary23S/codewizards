// codewizards/server/utils/safeErrorMessage.js
//
// Hand-written validation messages (e.g. "Not allowed", "Email already registered") are
// meant to be shown to the user and pass through unchanged. Only Mongoose/MongoDB's own
// internal errors — which name real schema paths/collections — get replaced with a
// generic message, so nothing about the database's internal shape leaks to a client.
const INTERNAL_ERROR_NAMES = new Set(["CastError", "ValidationError", "MongoServerError"]);

const safeErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  if (!error) return fallback;
  if (INTERNAL_ERROR_NAMES.has(error.name) || error.code === 11000) {
    return fallback;
  }
  return error.message || fallback;
};

module.exports = { safeErrorMessage };
