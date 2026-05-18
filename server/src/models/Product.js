import mongoose from "mongoose";
import { isUsingMemoryDB, memoryDB } from "../config/db.js";

const productSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true },
    image: { type: String, default: "" },
    category: { type: String, default: "general" },
    stock: { type: Number, default: 100 },
    rating: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const MongoProduct = mongoose.model("Product", productSchema);

export const Product = {
  async create(data) {
    if (isUsingMemoryDB()) return memoryDB.products.create(data);
    return MongoProduct.create(data);
  },

  async findAll(filter = {}) {
    if (isUsingMemoryDB()) return memoryDB.products.find(filter);
    return MongoProduct.find(filter);
  },

  async findById(id) {
    if (isUsingMemoryDB()) return memoryDB.products.findById(id);
    return MongoProduct.findById(id);
  },

  async deleteAll() {
    if (isUsingMemoryDB()) {
      memoryDB.products.items.clear();
      return;
    }
    return MongoProduct.deleteMany({});
  },
};
