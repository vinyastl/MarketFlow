import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../config/env.js";
import { User } from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

export const authRequired = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Authentication required" });

  let decoded;
  try {
    decoded = jwt.verify(token, JWT_SECRET);
  } catch {
    return res.status(401).json({ error: "Invalid or expired token" });
  }

  const user = await User.findById(decoded.id);
  if (!user) return res.status(401).json({ error: "Invalid token" });

  req.user = { id: user._id, email: user.email, name: user.name, isAdmin: user.isAdmin };
  next();
});
