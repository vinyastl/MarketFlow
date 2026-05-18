// Auto-seeder for in-memory database. Used when no MONGODB_URI is set.
import { Product } from "../models/Product.js";

const sampleProducts = [
  { name: "Wireless Headphones", description: "Over-ear noise-cancelling headphones with 30-hour battery life.", price: 149.99, image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500", category: "electronics", stock: 50, rating: 4.5 },
  { name: "Cotton T-Shirt", description: "Soft 100% cotton crew-neck tee. Available in classic black.", price: 19.99, image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=500", category: "clothing", stock: 200, rating: 4.2 },
  { name: "Stainless Steel Water Bottle", description: "Insulated 750ml bottle. Keeps drinks cold for 24 hours.", price: 24.99, image: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=500", category: "home", stock: 150, rating: 4.7 },
  { name: "Mechanical Keyboard", description: "75% layout with hot-swappable switches and RGB backlight.", price: 109.0, image: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500", category: "electronics", stock: 30, rating: 4.8 },
  { name: "Leather Wallet", description: "Bifold wallet in full-grain leather with RFID protection.", price: 39.5, image: "https://images.unsplash.com/photo-1627123424574-724758594e93?w=500", category: "accessories", stock: 80, rating: 4.3 },
  { name: "Running Shoes", description: "Lightweight breathable runners with responsive foam midsole.", price: 89.99, image: "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500", category: "footwear", stock: 60, rating: 4.4 },
  { name: "Ceramic Coffee Mug", description: "Hand-thrown ceramic mug, 350ml, microwave and dishwasher safe.", price: 14.99, image: "https://images.unsplash.com/photo-1514228742587-6b1558fcca3d?w=500", category: "home", stock: 120, rating: 4.6 },
  { name: "Smart Fitness Watch", description: "Heart rate, GPS, sleep tracking, 7-day battery life.", price: 199.0, image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500", category: "electronics", stock: 40, rating: 4.5 },
  { name: "Backpack", description: "Water-resistant 25L backpack with padded laptop compartment.", price: 64.99, image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500", category: "accessories", stock: 90, rating: 4.4 },
  { name: "Yoga Mat", description: "Eco-friendly 6mm thick non-slip yoga mat with carry strap.", price: 34.99, image: "https://images.unsplash.com/photo-1601925260368-ae2f83cf8b7f?w=500", category: "fitness", stock: 100, rating: 4.6 },
];

export default async function autoSeed() {
  for (const p of sampleProducts) {
    await Product.create(p);
  }
  console.log(`🌱 Auto-seeded ${sampleProducts.length} sample products into memory DB.`);
}
