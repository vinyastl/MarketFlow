import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";

import { connectDB, isUsingMemoryDB } from "./config/db.js";
import { Product } from "./models/Product.js";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:5173",
    credentials: true,
  })
);
app.use(express.json());
app.use(morgan("dev"));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", dbMode: isUsingMemoryDB() ? "memory" : "mongo" });
});

app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

const PORT = process.env.PORT || 5000;

async function start() {
  await connectDB();

  // If using memory DB, auto-seed with sample products so the demo works out of the box.
  if (isUsingMemoryDB()) {
    const existing = await Product.findAll();
    if (existing.length === 0) {
      const { default: seedFn } = await import("./utils/autoSeed.js");
      await seedFn();
    }
  }

  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});
