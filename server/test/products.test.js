import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { request, setupTestDb, seedProducts, sampleProducts } from "./helpers.js";

describe("Products API", () => {
  before(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await setupTestDb();
    await seedProducts();
  });

  it("lists all products", async () => {
    const res = await request().get("/api/products").expect(200);
    assert.equal(res.body.length, sampleProducts.length);
  });

  it("returns a single product by id", async () => {
    const all = await request().get("/api/products");
    const first = all.body[0];
    const res = await request().get(`/api/products/${first._id}`).expect(200);
    assert.equal(res.body._id, first._id);
  });

  it("returns 404 for an unknown product id", async () => {
    const res = await request().get("/api/products/nope-123");
    assert.equal(res.status, 404);
    assert.match(res.body.error, /not found/i);
  });

  it("filters by category", async () => {
    const res = await request().get("/api/products?category=electronics").expect(200);
    assert.equal(res.body.length, 2);
    for (const p of res.body) assert.equal(p.category, "electronics");
  });

  it("searches by name (case-insensitive)", async () => {
    const res = await request().get("/api/products?q=HEADPHONES").expect(200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].name, "Alpha Headphones");
  });

  it("searches by description keyword", async () => {
    const res = await request().get("/api/products?q=coffee").expect(200);
    assert.equal(res.body.length, 1);
    assert.equal(res.body[0].name, "Delta Coffee Mug");
  });

  it("returns an empty array when nothing matches", async () => {
    const res = await request().get("/api/products?q=zzznothing").expect(200);
    assert.equal(res.body.length, 0);
  });

  it("sorts by price ascending and descending", async () => {
    const asc = await request().get("/api/products?sort=price_asc").expect(200);
    assert.deepEqual(asc.body.map((p) => p.name), ["Delta Coffee Mug", "Gamma T-Shirt", "Beta Keyboard", "Alpha Headphones"]);

    const desc = await request().get("/api/products?sort=price_desc").expect(200);
    assert.deepEqual(desc.body.map((p) => p.name), ["Alpha Headphones", "Beta Keyboard", "Gamma T-Shirt", "Delta Coffee Mug"]);
  });

  it("sorts by rating descending", async () => {
    const res = await request().get("/api/products?sort=rating_desc").expect(200);
    assert.deepEqual(res.body.map((p) => p.name), ["Beta Keyboard", "Alpha Headphones", "Delta Coffee Mug", "Gamma T-Shirt"]);
  });

  it("combines search, category and sort together", async () => {
    // No electronics product mentions "coffee", so combined filters yield nothing.
    const res = await request()
      .get("/api/products?q=coffee&category=electronics&sort=price_desc")
      .expect(200);
    assert.equal(res.body.length, 0);

    const res2 = await request()
      .get("/api/products?q=keyboard&category=electronics&sort=price_desc")
      .expect(200);
    assert.equal(res2.body.length, 1);
    assert.equal(res2.body[0].name, "Beta Keyboard");
  });
});