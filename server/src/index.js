import { connectDB, isUsingMemoryDB } from "./config/db.js";
import { createApp } from "./app.js";
import { Product } from "./models/Product.js";

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

  createApp().listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});