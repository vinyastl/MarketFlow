import { Router } from "express";
import { randomUUID } from "crypto";
import { Order } from "../models/Order.js";
import { Product } from "../models/Product.js";
import { authRequired } from "../middleware/auth.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateCheckout } from "../utils/validators.js";

const router = Router();

// GET /api/orders (current user's orders)
router.get(
  "/",
  authRequired,
  asyncHandler(async (req, res) => {
    const orders = await Order.findByUser(req.user.id);
    res.json(orders);
  })
);

// POST /api/orders/checkout (mock payment)
// Body: { items: [{productId, quantity}], shippingAddress, card: { number, expiry, cvc } }
router.post(
  "/checkout",
  authRequired,
  asyncHandler(async (req, res) => {
    const { items, shippingAddress, card } = req.body || {};

    const invalid = validateCheckout({ items, shippingAddress, card });
    if (invalid) return res.status(400).json({ error: invalid });

    // Mock payment simulation: cards ending in "0000" fail, anything else succeeds.
    // This mimics a real Stripe test-mode flow without needing actual Stripe.
    const cardClean = card.number.replace(/\s/g, "");
    if (cardClean.endsWith("0000")) {
      return res.status(402).json({ error: "Payment declined. Use a different card." });
    }

    // Build order items with current prices from DB (don't trust client prices)
    const orderItems = [];
    let total = 0;
    for (const cartItem of items) {
      const product = await Product.findById(cartItem.productId);
      if (!product) {
        return res.status(400).json({ error: `Product not found or no longer available` });
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
  })
);

// GET /api/orders/:id (owner or admin only)
router.get(
  "/:id",
  authRequired,
  asyncHandler(async (req, res) => {
    const order = await Order.findById(req.params.id);
    if (!order) return res.status(404).json({ error: "Order not found" });
    if (order.userId.toString() !== req.user.id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ error: "Forbidden" });
    }
    res.json(order);
  })
);

export default router;