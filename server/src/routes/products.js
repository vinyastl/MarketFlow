import { Router } from "express";
import { Product } from "../models/Product.js";
import asyncHandler from "../utils/asyncHandler.js";

const router = Router();

// GET /api/products?category=&q=&sort=
// Search by text (q), filter by category, and sort by price/rating/newest.
router.get(
  "/",
  asyncHandler(async (req, res) => {
    const { category = "", q = "", sort = "" } = req.query;
    const products = await Product.query({ q, category, sort });
    res.json(products);
  })
);

// GET /api/products/:id
router.get(
  "/:id",
  asyncHandler(async (req, res) => {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  })
);

export default router;