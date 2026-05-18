import mongoose from "mongoose";
import { memoryDB } from "./memoryDB.js";

let useMemoryDB = false;

export async function connectDB() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    console.log("⚠️  No MONGODB_URI set. Using in-memory database (data resets on restart).");
    useMemoryDB = true;
    return { type: "memory" };
  }

  try {
    await mongoose.connect(uri);
    console.log("✅ Connected to MongoDB");
    return { type: "mongo" };
  } catch (err) {
    console.error("❌ MongoDB connection failed, falling back to in-memory DB:", err.message);
    useMemoryDB = true;
    return { type: "memory" };
  }
}

export function isUsingMemoryDB() {
  return useMemoryDB;
}

export { memoryDB };
