// codewizards/server/tests/paginate.test.js
const { parsePagination } = require("../utils/paginate");

describe("parsePagination", () => {
  it("is inactive when page/limit are absent — existing callers keep the old flat-array shape", () => {
    const result = parsePagination({});
    expect(result.active).toBe(false);
    expect(result.skip).toBe(0);
  });

  it("is inactive when only one of page/limit is present", () => {
    expect(parsePagination({ page: "2" }).active).toBe(false);
    expect(parsePagination({ limit: "10" }).active).toBe(false);
  });

  it("activates and computes skip correctly when both are present", () => {
    const result = parsePagination({ page: "3", limit: "10" });
    expect(result.active).toBe(true);
    expect(result.page).toBe(3);
    expect(result.limit).toBe(10);
    expect(result.skip).toBe(20);
  });

  it("caps the limit at 100", () => {
    const result = parsePagination({ page: "1", limit: "500" });
    expect(result.limit).toBe(100);
  });

  it("is inactive for non-positive or non-numeric values", () => {
    expect(parsePagination({ page: "0", limit: "10" }).active).toBe(false);
    expect(parsePagination({ page: "abc", limit: "10" }).active).toBe(false);
    expect(parsePagination({ page: "1", limit: "-5" }).active).toBe(false);
  });
});
