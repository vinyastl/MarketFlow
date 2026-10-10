import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";

import authRoutes from "./routes/auth.js";
import productRoutes from "./routes/products.js";
import orderRoutes from "./routes/orders.js";
import { errorHandler, notFound } from "./middleware/errorHandler.js";
import { isUsingMemoryDB } from "./config/db.js";

const DEFAULT_ORIGIN = "http://localhost:5173";

function resolveOrigins() {
  const raw = process.env.CLIENT_URL || DEFAULT_ORIGIN;
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function createApp() {
  const app = express();

  app.disable("x-powered-by");
  app.set("trust proxy", 1);

  app.use(helmet());
  app.use(
    cors({
      origin: resolveOrigins(),
      credentials: true,
    })
  );
  app.use(express.json({ limit: "50kb" }));

  if (process.env.NODE_ENV !== "test") {
    app.use(morgan("dev"));
  }

  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", dbMode: isUsingMemoryDB() ? "memory" : "mongo" });
  });

  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/orders", orderRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
}