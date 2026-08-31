import { getDashboardPath } from "./getDashboardPath";

test("maps each known role to its dashboard route", () => {
  expect(getDashboardPath("student")).toBe("/student-dashboard");
  expect(getDashboardPath("senior")).toBe("/senior-dashboard");
  expect(getDashboardPath("alumni")).toBe("/alumni-dashboard");
  expect(getDashboardPath("admin")).toBe("/admin-dashboard");
});

test("falls back to the generic dashboard route for an unknown or missing role", () => {
  expect(getDashboardPath("mentor")).toBe("/dashboard");
  expect(getDashboardPath(undefined)).toBe("/dashboard");
});
