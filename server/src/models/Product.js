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

const SORTS = {
  price_asc: { price: 1 },
  price_desc: { price: -1 },
  rating_desc: { rating: -1 },
  newest: { createdAt: -1 },
};

function sortResults(list, sort) {
  const comparators = {
    price_asc: (a, b) => a.price - b.price,
    price_desc: (a, b) => b.price - a.price,
    rating_desc: (a, b) => b.rating - a.rating,
    newest: (a, b) => new Date(b.createdAt) - new Date(a.createdAt),
  };
  const cmp = comparators[sort];
  return cmp ? [...list].sort(cmp) : list;
}

export const Product = {
  async create(data) {
    if (isUsingMemoryDB()) return memoryDB.products.create(data);
    return MongoProduct.create(data);
  },

  async findAll(filter = {}) {
    if (isUsingMemoryDB()) return memoryDB.products.find(filter);
    return MongoProduct.find(filter);
  },

  // Combined search: optional text query (q), category filter, and sort order.
  async query({ q = "", category = "", sort = "" } = {}) {
    const hasQuery = q && q.trim();
    const term = hasQuery ? q.trim() : "";

    if (isUsingMemoryDB()) {
      const filter = category ? { category } : {};
      let results = await memoryDB.products.find(filter);
      if (term) {
        const needle = term.toLowerCase();
        results = results.filter(
          (p) =>
            (p.name || "").toLowerCase().includes(needle) ||
            (p.description || "").toLowerCase().includes(needle)
        );
      }
      return sortResults(results, sort);
    }

    const filter = {};
    if (category) filter.category = category;
    if (term) {
      filter.$or = [
        { name: { $regex: term, $options: "i" } },
        { description: { $regex: term, $options: "i" } },
      ];
    }

    let find = MongoProduct.find(filter);
    if (SORTS[sort]) find = find.sort(SORTS[sort]);
    return find;
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
