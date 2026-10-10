import mongoose from "mongoose";
import { isUsingMemoryDB, memoryDB } from "../config/db.js";

const orderItemSchema = new mongoose.Schema({
  productId: String,
  name: String,
  price: Number,
  quantity: Number,
});

const orderSchema = new mongoose.Schema(
  {
    userId: { type: String, required: true },
    items: [orderItemSchema],
    total: { type: Number, required: true },
    status: { type: String, default: "paid" },
    shippingAddress: {
      street: String,
      city: String,
      postalCode: String,
      country: String,
    },
    paymentRef: String,
  },
  { timestamps: true }
);

const MongoOrder = mongoose.model("Order", orderSchema);

// Statuses are stored as simple strings. Only "paid" is produced by the mock
// checkout; the rest exist so a real fulfilment pipeline can be added later.
export const ORDER_STATUSES = ["pending", "paid", "processing", "shipped", "delivered"];

export const orderStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    paid: "Paid",
    processing: "Processing",
    shipped: "Shipped",
    delivered: "Delivered",
  };
  return labels[status] || status || "Unknown";
};

export const Order = {
  async create(data) {
    if (isUsingMemoryDB()) return memoryDB.orders.create(data);
    return MongoOrder.create(data);
  },

  async findByUser(userId) {
    if (isUsingMemoryDB()) {
      const orders = await memoryDB.orders.find({ userId });
      return orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    }
    return MongoOrder.find({ userId }).sort({ createdAt: -1 });
  },

  async findById(id) {
    if (isUsingMemoryDB()) return memoryDB.orders.findById(id);
    return MongoOrder.findById(id);
  },
};
