import express from "express";
import multer from "multer";
import path from "path";
import db from "../data/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    const uniqueName = Date.now() + "-" + file.originalname.replace(/\s+/g, "-");
    cb(null, uniqueName);
  }
});

const upload = multer({ storage });

router.post("/", protect, upload.single("file"), (req, res) => {
  try {
    const category = req.body.category || "general";
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const baseUrl = `${req.protocol}://${req.get("host")}`;
    const fileUrl = `${baseUrl}/uploads/${file.filename}`;
    const fileType = path.extname(file.originalname);

    const result = db.prepare(`
      INSERT INTO uploads (fileName, fileUrl, fileType, category)
      VALUES (?, ?, ?, ?)
    `).run(file.originalname, fileUrl, fileType, category);

    const savedFile = db
      .prepare("SELECT * FROM uploads WHERE id = ?")
      .get(result.lastInsertRowid);

    return res.status(201).json(savedFile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/", protect, (req, res) => {
  try {
    const files = db
      .prepare("SELECT * FROM uploads ORDER BY createdAt DESC")
      .all();

    return res.json(files);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM uploads WHERE id = ?")
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "File not found" });
    }

    return res.json({ message: "File deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;