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

export const Order = {
  async create(data) {
    if (isUsingMemoryDB()) return memoryDB.orders.create(data);
    return MongoOrder.create(data);
  },

  async findByUser(userId) {
    if (isUsingMemoryDB()) return memoryDB.orders.find({ userId });
    return MongoOrder.find({ userId }).sort({ createdAt: -1 });
  },

  async findById(id) {
    if (isUsingMemoryDB()) return memoryDB.orders.findById(id);
    return MongoOrder.findById(id);
  },
};
