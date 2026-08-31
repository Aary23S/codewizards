// codewizards/server/tests/auth.test.js
const request = require("supertest");

jest.mock("../utils/sendEmail");
const sendEmail = require("../utils/sendEmail");

const { connect, closeDatabase, clearCollections } = require("./testDb");
const app = require("../app");
const User = require("../models/User");

beforeAll(async () => {
  await connect();
});

afterEach(async () => {
  await clearCollections();
  jest.clearAllMocks();
});

afterAll(async () => {
  await closeDatabase();
});

const validUser = {
  name: "Test Student",
  email: "student@example.com",
  password: "password1",
  batch: new Date().getFullYear() + 2,
  programName: "B.Tech CSE",
  programDurationYears: 4,
};

describe("POST /api/v1/auth/register", () => {
  it("creates a user and returns a token", async () => {
    const res = await request(app).post("/api/v1/auth/register").send(validUser);
    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.token).toEqual(expect.any(String));
    expect(res.body.data.email).toBe(validUser.email);
  });

  it("rejects a duplicate email", async () => {
    await request(app).post("/api/v1/auth/register").send(validUser);
    const res = await request(app).post("/api/v1/auth/register").send(validUser);
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/already registered/i);
  });

  it("rejects an invalid email with a clear message", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validUser, email: "not-an-email" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/valid email/i);
  });

  it("rejects a password shorter than 6 characters", async () => {
    const res = await request(app)
      .post("/api/v1/auth/register")
      .send({ ...validUser, password: "123" });
    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/at least 6 characters/i);
  });
});

describe("POST /api/v1/auth/login", () => {
  beforeEach(async () => {
    await request(app).post("/api/v1/auth/register").send(validUser);
  });

  it("logs in with correct credentials", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    expect(res.status).toBe(200);
    expect(res.body.data.token).toEqual(expect.any(String));
  });

  it("rejects an incorrect password", async () => {
    const res = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: "wrongpassword" });
    expect(res.status).toBe(401);
  });
});

describe("token versioning (logout invalidates prior tokens)", () => {
  it("rejects a token after logout, but a fresh login still works", async () => {
    await request(app).post("/api/v1/auth/register").send(validUser);
    const loginRes = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    const firstToken = loginRes.body.data.token;

    // Token works before logout
    const meBefore = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${firstToken}`);
    expect(meBefore.status).toBe(200);

    await request(app).post("/api/v1/auth/logout").set("Authorization", `Bearer ${firstToken}`);

    // Same token is now invalid
    const meAfter = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${firstToken}`);
    expect(meAfter.status).toBe(401);

    // A fresh login issues a token that still works
    const secondLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    const meNew = await request(app)
      .get("/api/v1/auth/me")
      .set("Authorization", `Bearer ${secondLogin.body.data.token}`);
    expect(meNew.status).toBe(200);
  });
});

describe("forgot-password / reset-password flow", () => {
  it("resets the password via the emailed token and invalidates old sessions", async () => {
    await request(app).post("/api/v1/auth/register").send(validUser);

    const forgotRes = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: validUser.email });
    expect(forgotRes.status).toBe(200);
    expect(sendEmail).toHaveBeenCalledTimes(1);

    const oldLogin = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    const oldToken = oldLogin.body.data.token;

    // Pull the raw reset link out of the mocked email call to get the real token
    const emailHtml = sendEmail.mock.calls[0][0].html;
    const rawToken = emailHtml.match(/reset-password\/([a-f0-9]+)/)[1];

    const newPassword = "brandnewpassword1";
    const resetRes = await request(app)
      .post(`/api/v1/auth/reset-password/${rawToken}`)
      .send({ password: newPassword });
    expect(resetRes.status).toBe(200);

    // Old token is now invalid (tokenVersion bumped)
    const meOld = await request(app).get("/api/v1/auth/me").set("Authorization", `Bearer ${oldToken}`);
    expect(meOld.status).toBe(401);

    // Old password no longer works
    const loginOldPw = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: validUser.password });
    expect(loginOldPw.status).toBe(401);

    // New password works
    const loginNewPw = await request(app)
      .post("/api/v1/auth/login")
      .send({ email: validUser.email, password: newPassword });
    expect(loginNewPw.status).toBe(200);
  });

  it("rejects an expired or invalid reset token", async () => {
    await request(app).post("/api/v1/auth/register").send(validUser);
    const res = await request(app)
      .post("/api/v1/auth/reset-password/not-a-real-token")
      .send({ password: "somenewpassword1" });
    expect(res.status).toBe(400);
  });

  it("returns the generic message for an unregistered email (no enumeration)", async () => {
    const res = await request(app)
      .post("/api/v1/auth/forgot-password")
      .send({ email: "nobody@example.com" });
    expect(res.status).toBe(200);
    expect(res.body.message).toMatch(/if that email is registered/i);
    expect(sendEmail).not.toHaveBeenCalled();
  });
});
