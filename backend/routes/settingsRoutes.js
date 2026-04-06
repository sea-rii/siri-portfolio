import express from "express";
import db from "../data/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const settings = db
      .prepare("SELECT * FROM site_settings WHERE id = 1")
      .get();

    return res.json(settings);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/", protect, (req, res) => {
  try {
    const {
      aboutText = "",
      resumeUrl = "",
      linkedinUrl = "",
      githubUrl = "",
      email = "",
      profileImageUrl = ""
    } = req.body;

    db.prepare(`
      UPDATE site_settings
      SET aboutText = ?, resumeUrl = ?, linkedinUrl = ?, githubUrl = ?, email = ?, profileImageUrl = ?
      WHERE id = 1
    `).run(
      aboutText,
      resumeUrl,
      linkedinUrl,
      githubUrl,
      email,
      profileImageUrl
    );

    const updated = db
      .prepare("SELECT * FROM site_settings WHERE id = 1")
      .get();

    return res.json(updated);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;