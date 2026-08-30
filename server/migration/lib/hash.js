// codewizards/server/migration/lib/hash.js
const crypto = require("crypto");

// Sorts by _id so the same collection always hashes the same way regardless of query order
const canonicalize = (docs) => {
  const sorted = [...docs].sort((a, b) => String(a._id).localeCompare(String(b._id)));
  return JSON.stringify(sorted);
};

const hashDocs = (docs) => {
  return crypto.createHash("sha256").update(canonicalize(docs)).digest("hex");
};

module.exports = { canonicalize, hashDocs };
