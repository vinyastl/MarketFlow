import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import { isUsingMemoryDB, memoryDB } from "../config/db.js";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const MongoUser = mongoose.model("User", userSchema);

export const User = {
  async create({ name, email, password, isAdmin = false }) {
    const hashed = await bcrypt.hash(password, 10);
    const doc = { name, email: email.toLowerCase(), password: hashed, isAdmin };

    if (isUsingMemoryDB()) {
      return memoryDB.users.create(doc);
    }
    return MongoUser.create(doc);
  },

  async findByEmail(email) {
    const lower = email.toLowerCase();
    if (isUsingMemoryDB()) {
      return memoryDB.users.findOne({ email: lower });
    }
    return MongoUser.findOne({ email: lower });
  },

  async findById(id) {
    if (isUsingMemoryDB()) {
      return memoryDB.users.findById(id);
    }
    return MongoUser.findById(id);
  },

  async comparePassword(user, plain) {
    return bcrypt.compare(plain, user.password);
  },
};
