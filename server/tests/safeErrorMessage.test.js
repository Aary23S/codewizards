// codewizards/server/tests/safeErrorMessage.test.js
const { safeErrorMessage } = require("../utils/safeErrorMessage");

describe("safeErrorMessage", () => {
  it("returns the fallback for internal Mongoose/Mongo errors", () => {
    expect(safeErrorMessage({ name: "CastError", message: "Cast to ObjectId failed" })).toBe(
      "Something went wrong. Please try again."
    );
    expect(safeErrorMessage({ name: "ValidationError", message: "path `email` is required" })).toBe(
      "Something went wrong. Please try again."
    );
    expect(safeErrorMessage({ name: "MongoServerError", message: "connection refused" })).toBe(
      "Something went wrong. Please try again."
    );
    expect(safeErrorMessage({ code: 11000, message: "E11000 duplicate key" })).toBe(
      "Something went wrong. Please try again."
    );
  });

  it("passes through a hand-written, user-facing message unchanged", () => {
    expect(safeErrorMessage({ name: "Error", message: "Email already registered" })).toBe(
      "Email already registered"
    );
  });

  it("uses a custom fallback when provided", () => {
    expect(safeErrorMessage({ name: "CastError" }, "Custom fallback")).toBe("Custom fallback");
  });

  it("handles a missing/falsy error", () => {
    expect(safeErrorMessage(null)).toBe("Something went wrong. Please try again.");
  });
});
