import { Router } from "express";
import jwt from "jsonwebtoken";
import { User } from "../models/User.js";
import { JWT_SECRET } from "../config/env.js";
import asyncHandler from "../utils/asyncHandler.js";
import { validateLogin, validateSignup } from "../utils/validators.js";

const router = Router();

function signToken(userId) {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: "7d" });
}

function publicUser(user) {
  return { id: user._id, name: user.name, email: user.email, isAdmin: user.isAdmin };
}

// POST /api/auth/signup
router.post(
  "/signup",
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body || {};

    const invalid = validateSignup({ name, email, password });
    if (invalid) return res.status(400).json({ error: invalid });

    const existing = await User.findByEmail(email.trim());
    if (existing) return res.status(409).json({ error: "Email already registered" });

    const user = await User.create({ name: name.trim(), email: email.trim(), password });
    const token = signToken(user._id);

    res.status(201).json({ token, user: publicUser(user) });
  })
);

// POST /api/auth/login
router.post(
  "/login",
  asyncHandler(async (req, res) => {
    const { email, password } = req.body || {};

    const invalid = validateLogin({ email, password });
    if (invalid) return res.status(400).json({ error: invalid });

    const user = await User.findByEmail(email.trim());
    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await User.comparePassword(user, password);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const token = signToken(user._id);
    res.json({ token, user: publicUser(user) });
  })
);

export default router;