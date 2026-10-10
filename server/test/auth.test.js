import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { request, setupTestDb } from "./helpers.js";

describe("Auth API", () => {
  before(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await setupTestDb();
  });

  it("signs up a new user and returns a token", async () => {
    const res = await request()
      .post("/api/auth/signup")
      .send({ name: "Jane Doe", email: "jane@example.com", password: "secret123" });

    assert.equal(res.status, 201);
    assert.ok(res.body.token.length > 20);
    assert.equal(res.body.user.email, "jane@example.com");
    assert.equal(res.body.user.name, "Jane Doe");
    // Password must never be returned.
    assert.equal(res.body.user.password, undefined);
    assert.equal(res.body.password, undefined);
  });

  it("rejects duplicate emails with 409", async () => {
    const body = { name: "Jane Doe", email: "dup@example.com", password: "secret123" };
    await request().post("/api/auth/signup").send(body).expect(201);
    const res = await request().post("/api/auth/signup").send(body);
    assert.equal(res.status, 409);
    assert.match(res.body.error, /already registered/i);
  });

  it("rejects a malformed email with 400", async () => {
    const res = await request()
      .post("/api/auth/signup")
      .send({ name: "Jane Doe", email: "not-an-email", password: "secret123" });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /valid email/i);
  });

  it("rejects a short password with 400", async () => {
    const res = await request()
      .post("/api/auth/signup")
      .send({ name: "Jane Doe", email: "jane2@example.com", password: "123" });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /at least 6 characters/i);
  });

  it("rejects a too-short name with 400", async () => {
    const res = await request()
      .post("/api/auth/signup")
      .send({ name: "A", email: "jane3@example.com", password: "secret123" });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /name/i);
  });

  it("rejects missing fields with 400", async () => {
    const res = await request().post("/api/auth/signup").send({});
    assert.equal(res.status, 400);
  });

  it("logs in with correct credentials", async () => {
    await request()
      .post("/api/auth/signup")
      .send({ name: "Jane Doe", email: "login@example.com", password: "secret123" });

    const res = await request()
      .post("/api/auth/login")
      .send({ email: "LOGIN@example.com", password: "secret123" });

    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.user.email, "login@example.com");
  });

  it("rejects a wrong password with 401", async () => {
    await request()
      .post("/api/auth/signup")
      .send({ name: "Jane Doe", email: "wp@example.com", password: "secret123" });

    const res = await request()
      .post("/api/auth/login")
      .send({ email: "wp@example.com", password: "wrong-password" });
    assert.equal(res.status, 401);
    assert.match(res.body.error, /invalid credentials/i);
  });

  it("rejects an unknown email with 401 and hides whether the account exists", async () => {
    const res = await request()
      .post("/api/auth/login")
      .send({ email: "nobody@example.com", password: "whatever1" });
    assert.equal(res.status, 401);
    assert.match(res.body.error, /invalid credentials/i);
  });

  it("rejects empty login fields with 400", async () => {
    const res = await request().post("/api/auth/login").send({ email: "", password: "" });
    assert.equal(res.status, 400);
  });
});