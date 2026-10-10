// In-memory database fallback used when MONGODB_URI is not set.
// This lets the app run without any MongoDB setup, perfect for quick demos.

import { randomUUID } from "crypto";

class Collection {
  constructor() {
    this.items = new Map();
  }

  async create(doc) {
    const id = doc._id || randomUUID();
    const record = { _id: id, createdAt: new Date(), ...doc };
    this.items.set(id, record);
    return record;
  }

  async find(filter = {}) {
    return [...this.items.values()].filter((item) => matches(item, filter));
  }

  async findOne(filter) {
    return [...this.items.values()].find((item) => matches(item, filter)) || null;
  }

  async findById(id) {
    return this.items.get(id) || null;
  }

  async updateById(id, update) {
    const existing = this.items.get(id);
    if (!existing) return null;
    const updated = { ...existing, ...update };
    this.items.set(id, updated);
    return updated;
  }

  async deleteById(id) {
    return this.items.delete(id);
  }
}

function matches(item, filter) {
  return Object.entries(filter).every(([key, value]) => item[key] === value);
}

export const memoryDB = {
  users: new Collection(),
  products: new Collection(),
  orders: new Collection(),
};

// Clears every collection. Used by the test suite to isolate tests.
export function resetMemoryDB() {
  for (const collection of Object.values(memoryDB)) {
    collection.items.clear();
  }
}
