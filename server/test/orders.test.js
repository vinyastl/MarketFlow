import { before, beforeEach, describe, it } from "node:test";
import assert from "node:assert/strict";
import { request, setupTestDb, seedProducts, validCard, validShipping } from "./helpers.js";

async function signupAndGetToken(email = "buyer@example.com") {
  const res = await request()
    .post("/api/auth/signup")
    .send({ name: "Buyer", email, password: "secret123" })
    .expect(201);
  return res.body.token;
}

describe("Orders API", () => {
  before(async () => {
    await setupTestDb();
  });

  beforeEach(async () => {
    await setupTestDb();
    await seedProducts();
  });

  async function placedOrder(token) {
    const products = await request().get("/api/products");
    const alpha = products.body.find((p) => p.name === "Alpha Headphones");
    const mug = products.body.find((p) => p.name === "Delta Coffee Mug");
    return { alpha, mug };
  }

  it("requires authentication to list orders", async () => {
    const res = await request().get("/api/orders");
    assert.equal(res.status, 401);
  });

  it("requires authentication to checkout", async () => {
    const res = await request().post("/api/orders/checkout").send({});
    assert.equal(res.status, 401);
  });

  it("rejects checkout with an empty cart", async () => {
    const token = await signupAndGetToken();
    const res = await request()
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [], shippingAddress: validShipping, card: validCard });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /empty/i);
  });

  it("rejects a non-integer or zero quantity", async () => {
    const token = await signupAndGetToken();
    const { alpha } = await placedOrder();
    const bad = await request()
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId: alpha._id, quantity: 0.5 }], shippingAddress: validShipping, card: validCard });
    assert.equal(bad.status, 400);
    assert.match(bad.body.error, /quantity/i);
  });

  it("rejects a missing shipping address", async () => {
    const token = await signupAndGetToken();
    const { alpha } = await placedOrder();
    const res = await request()
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId: alpha._id, quantity: 1 }], card: validCard });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /shipping/i);
  });

  it("rejects an invalid card number", async () => {
    const token = await signupAndGetToken();
    const { alpha } = await placedOrder();
    const res = await request()
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: alpha._id, quantity: 1 }],
        shippingAddress: validShipping,
        card: { number: "1234", expiry: "12/28", cvc: "123" },
      });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /card/i);
  });

  it("declines cards ending in 0000 with 402", async () => {
    const token = await signupAndGetToken();
    const { alpha } = await placedOrder();
    const res = await request()
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: alpha._id, quantity: 1 }],
        shippingAddress: validShipping,
        card: { number: "4444 0000 0000 0000", expiry: "12/28", cvc: "123" },
      });
    assert.equal(res.status, 402);
    assert.match(res.body.error, /declined/i);
  });

  it("rejects an unknown product id in the cart", async () => {
    const token = await signupAndGetToken();
    const res = await request()
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [{ productId: "does-not-exist", quantity: 1 }],
        shippingAddress: validShipping,
        card: validCard,
      });
    assert.equal(res.status, 400);
    assert.match(res.body.error, /product/i);
  });

  it("places an order using server-side prices and rounds the total", async () => {
    const token = await signupAndGetToken();
    const { alpha, mug } = await placedOrder();

    // The client cannot set prices: totals come from the database.
    const res = await request()
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({
        items: [
          { productId: alpha._id, quantity: 2, price: 0.01 },
          { productId: mug._id, quantity: 1, price: 0.01 },
        ],
        shippingAddress: validShipping,
        card: validCard,
      });

    assert.equal(res.status, 201);
    assert.equal(res.body.status, "paid");
    assert.equal(res.body.total, 215); // 100*2 + 15
    assert.equal(res.body.items.length, 2);
    assert.equal(res.body.items[0].price, 100);
    assert.match(res.body.paymentRef, /^mock_/);
  });

  it("lists only the current user's orders, newest first", async () => {
    const tokenA = await signupAndGetToken("a@example.com");
    const tokenB = await signupAndGetToken("b@example.com");
    const { alpha, mug } = await placedOrder();

    const place = (token, qty) =>
      request()
        .post("/api/orders/checkout")
        .set("Authorization", `Bearer ${token}`)
        .send({ items: [{ productId: alpha._id, quantity: qty }], shippingAddress: validShipping, card: validCard })
        .expect(201);

    await place(tokenA, 1);
    await place(tokenA, 2);
    await place(tokenB, 3);

    const mine = await request().get("/api/orders").set("Authorization", `Bearer ${tokenA}`).expect(200);
    assert.equal(mine.body.length, 2);
    assert.equal(mine.body[0].items[0].quantity, 2); // newest first

    const theirs = await request().get("/api/orders").set("Authorization", `Bearer ${tokenB}`).expect(200);
    assert.equal(theirs.body.length, 1);
    assert.equal(theirs.body[0].items[0].quantity, 3);
  });

  it("lets the owner view an order detail", async () => {
    const token = await signupAndGetToken();
    const { alpha } = await placedOrder();
    const placed = await request()
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${token}`)
      .send({ items: [{ productId: alpha._id, quantity: 1 }], shippingAddress: validShipping, card: validCard })
      .expect(201);

    const res = await request()
      .get(`/api/orders/${placed.body._id}`)
      .set("Authorization", `Bearer ${token}`)
      .expect(200);
    assert.equal(res.body._id, placed.body._id);
  });

  it("forbids another user from viewing someone else's order", async () => {
    const tokenOwner = await signupAndGetToken("owner@example.com");
    const tokenIntruder = await signupAndGetToken("intruder@example.com");
    const { alpha } = await placedOrder();
    const placed = await request()
      .post("/api/orders/checkout")
      .set("Authorization", `Bearer ${tokenOwner}`)
      .send({ items: [{ productId: alpha._id, quantity: 1 }], shippingAddress: validShipping, card: validCard })
      .expect(201);

    const res = await request()
      .get(`/api/orders/${placed.body._id}`)
      .set("Authorization", `Bearer ${tokenIntruder}`);
    assert.equal(res.status, 403);
  });

  it("returns 404 for an unknown order id", async () => {
    const token = await signupAndGetToken();
    const res = await request().get("/api/orders/nope").set("Authorization", `Bearer ${token}`);
    assert.equal(res.status, 404);
  });
});