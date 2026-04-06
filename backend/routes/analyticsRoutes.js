import express from "express";
import db from "../data/db.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/event", (req, res) => {
  try {
    const {
      eventType,
      page = "",
      projectId = null,
      sessionId = "",
      metadata = ""
    } = req.body;

    db.prepare(`
      INSERT INTO analytics_events
      (eventType, page, projectId, sessionId, metadata)
      VALUES (?, ?, ?, ?, ?)
    `).run(
      eventType,
      page,
      projectId,
      sessionId,
      typeof metadata === "string" ? metadata : JSON.stringify(metadata)
    );

    return res.status(201).json({ message: "Event tracked" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/overview", protect, (req, res) => {
  try {
    const totalViews = db
      .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE eventType = 'page_view'")
      .get();

    const resumeDownloads = db
      .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE eventType = 'resume_download'")
      .get();

    const projectClicks = db
      .prepare("SELECT COUNT(*) as count FROM analytics_events WHERE eventType = 'project_click'")
      .get();

    const topProjects = db.prepare(`
      SELECT projectId, COUNT(*) as clicks
      FROM analytics_events
      WHERE eventType = 'project_click' AND projectId IS NOT NULL
      GROUP BY projectId
      ORDER BY clicks DESC
      LIMIT 5
    `).all();

    return res.json({
      totalViews: totalViews.count,
      resumeDownloads: resumeDownloads.count,
      projectClicks: projectClicks.count,
      topProjects
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/recent", protect, (req, res) => {
  try {
    const recent = db.prepare(`
      SELECT *
      FROM analytics_events
      ORDER BY createdAt DESC
      LIMIT 20
    `).all();

    return res.json(recent);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

router.get("/pages", protect, (req, res) => {
  try {
    const pages = db.prepare(`
      SELECT page, COUNT(*) as views
      FROM analytics_events
      WHERE eventType = 'page_view' AND page IS NOT NULL AND page != ''
      GROUP BY page
      ORDER BY views DESC
      LIMIT 10
    `).all();

    return res.json(pages);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
});

export default router;