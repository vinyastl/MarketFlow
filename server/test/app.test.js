import { before, describe, it } from "node:test";
import assert from "node:assert/strict";
import { request, setupTestDb } from "./helpers.js";

describe("App-level behaviour", () => {
  before(async () => {
    await setupTestDb();
  });

  it("exposes a health check", async () => {
    const res = await request().get("/api/health").expect(200);
    assert.equal(res.body.status, "ok");
    assert.equal(res.body.dbMode, "memory");
  });

  it("returns JSON 404 for unknown routes", async () => {
    const res = await request().get("/api/does-not-exist");
    assert.equal(res.status, 404);
    assert.match(res.body.error, /not found/i);
  });

  it("responds 400 to malformed JSON bodies", async () => {
    const res = await request()
      .post("/api/auth/signup")
      .set("Content-Type", "application/json")
      .send("{ this is not json");
    assert.equal(res.status, 400);
    assert.match(res.body.error, /invalid json/i);
  });

  it("allows the configured frontend origin via CORS", async () => {
    const res = await request().get("/api/health").set("Origin", "http://localhost:5173");
    assert.equal(res.headers["access-control-allow-origin"], "http://localhost:5173");
  });

  it("does not send CORS headers to unknown origins", async () => {
    const res = await request().get("/api/health").set("Origin", "https://evil.example.com");
    assert.equal(res.headers["access-control-allow-origin"], undefined);
  });
});