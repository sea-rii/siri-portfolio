import express from "express";
import bcrypt from "bcryptjs";
import db from "../data/db.js";
import { generateToken } from "../utils/jwt.js";

const router = express.Router();

router.post("/seed-admin", async (req, res) => {
  try {
    const existing = db.prepare("SELECT * FROM admin WHERE email = ?").get(process.env.ADMIN_EMAIL);

    if (existing) {
      return res.json({ message: "Admin already exists" });
    }

    const passwordHash = await bcrypt.hash(process.env.ADMIN_PASSWORD, 10);

    const result = db
      .prepare("INSERT INTO admin (email, passwordHash) VALUES (?, ?)")
      .run(process.env.ADMIN_EMAIL, passwordHash);

    return res.json({
      message: "Admin created",
      adminId: result.lastInsertRowid
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const admin = db.prepare("SELECT * FROM admin WHERE email = ?").get(email);

    if (!admin) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, admin.passwordHash);

    if (!isMatch) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = generateToken(admin);

    return res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email
      }
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/me", (req, res) => {
  return res.json({ message: "Use protected route with token later" });
});

export default router;