// Order matters: setup.js must run before app modules read process.env.
import "./setup.js";
import supertest from "supertest";
import { createApp } from "../src/app.js";
import { connectDB } from "../src/config/db.js";
import { resetMemoryDB } from "../src/config/memoryDB.js";
import { Product } from "../src/models/Product.js";

export const request = () => supertest(createApp());

let connected = false;

export async function setupTestDb() {
  if (!connected) {
    await connectDB();
    connected = true;
  }
  resetMemoryDB();
}

export const sampleProducts = [
  { name: "Alpha Headphones", description: "Noise cancelling over-ear headphones", price: 100, category: "electronics", stock: 10, rating: 4 },
  { name: "Beta Keyboard", description: "Mechanical RGB keyboard", price: 80, category: "electronics", stock: 5, rating: 5 },
  { name: "Gamma T-Shirt", description: "Soft cotton crew neck tee", price: 20, category: "clothing", stock: 50, rating: 3 },
  { name: "Delta Coffee Mug", description: "Ceramic coffee mug", price: 15, category: "home", stock: 30, rating: 4 },
];

export async function seedProducts() {
  for (const p of sampleProducts) {
    await Product.create(p);
  }
}

export const validShipping = { street: "1 Main St", city: "Springfield", postalCode: "12345", country: "US" };
export const validCard = { number: "4242 4242 4242 4242", expiry: "12/28", cvc: "123" };