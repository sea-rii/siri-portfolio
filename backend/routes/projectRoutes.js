import express from "express";
import db from "../data/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const projects = db
      .prepare("SELECT * FROM projects ORDER BY displayOrder ASC, createdAt DESC")
      .all();

    return res.json(projects);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/:id", (req, res) => {
  try {
    const project = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(req.params.id);

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json(project);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.post("/", protect, (req, res) => {
  try {
    const {
      title,
      description,
      techStack = "",
      githubUrl = "",
      liveUrl = "",
      imageUrl = "",
      featured = 0,
      displayOrder = 0
    } = req.body;

    const result = db.prepare(`
      INSERT INTO projects
      (title, description, techStack, githubUrl, liveUrl, imageUrl, featured, displayOrder, updatedAt)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
    `).run(
      title,
      description,
      techStack,
      githubUrl,
      liveUrl,
      imageUrl,
      featured ? 1 : 0,
      displayOrder
    );

    const newProject = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(result.lastInsertRowid);

    return res.status(201).json(newProject);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.put("/:id", protect, (req, res) => {
  try {
    const {
      title,
      description,
      techStack = "",
      githubUrl = "",
      liveUrl = "",
      imageUrl = "",
      featured = 0,
      displayOrder = 0
    } = req.body;

    const result = db.prepare(`
      UPDATE projects
      SET title = ?, description = ?, techStack = ?, githubUrl = ?, liveUrl = ?, imageUrl = ?, featured = ?, displayOrder = ?, updatedAt = CURRENT_TIMESTAMP
      WHERE id = ?
    `).run(
      title,
      description,
      techStack,
      githubUrl,
      liveUrl,
      imageUrl,
      featured ? 1 : 0,
      displayOrder,
      req.params.id
    );

    if (result.changes === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    const updatedProject = db
      .prepare("SELECT * FROM projects WHERE id = ?")
      .get(req.params.id);

    return res.json(updatedProject);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.delete("/:id", protect, (req, res) => {
  try {
    const result = db
      .prepare("DELETE FROM projects WHERE id = ?")
      .run(req.params.id);

    if (result.changes === 0) {
      return res.status(404).json({ message: "Project not found" });
    }

    return res.json({ message: "Project deleted" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;