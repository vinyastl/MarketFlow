import express from "express";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { authRequired } from "../middleware/auth.js";
import { randomUUID } from "crypto";

const router = express.Router();

// GET /api/orders (current user's orders)
router.get("/", authRequired, async (req, res) => {
  try {
    const orders = await Order.findByUser(req.user.id);
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/orders/checkout (mock payment)
// Body: { items: [{productId, quantity}], shippingAddress, card: { number, expiry, cvc } }
router.post("/checkout", authRequired, async (req, res) => {
  try {
    const { items, shippingAddress, card } = req.body;

    if (!items || items.length === 0) {
      return res.status(400).json({ error: "Cart is empty" });
    }
    if (!card || !card.number) {
      return res.status(400).json({ error: "Card details required" });
    }

    // Mock payment simulation: cards ending in "0000" fail, anything else succeeds.
    // This mimics a real Stripe test-mode flow without needing actual Stripe.
    const cardClean = card.number.replace(/\s/g, "");
    if (cardClean.endsWith("0000")) {
      return res.status(402).json({ error: "Payment declined. Use a different card." });
    }
    if (cardClean.length < 12) {
      return res.status(400).json({ error: "Invalid card number" });
    }

    // Build order items with current prices from DB (don't trust client prices)
    const orderItems = [];
    let total = 0;
    for (const cartItem of items) {
      const product = await Product.findById(cartItem.productId);
      if (!product) {
        return res.status(400).json({ error: `Product ${cartItem.productId} not found` });
      }
      const lineTotal = product.price * cartItem.quantity;
      total += lineTotal;
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: cartItem.quantity,
      });
    }

    const order = await Order.create({
      userId: req.user.id,
      items: orderItems,
      total: Math.round(total * 100) / 100,
      status: "paid",
      shippingAddress,
      paymentRef: `mock_${randomUUID()}`,
    });

    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/orders/:id
router.get("/:id", authRequired, async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId.toString() !== req.user.id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(order);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
