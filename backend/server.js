import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import "./data/db.js";

import authRoutes from "./routes/authRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import settingsRoutes from "./routes/settingsRoutes.js";
import analyticsRoutes from "./routes/analyticsRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());
app.use("/uploads", express.static("uploads"));

app.get("/", (req, res) => {
  res.json({ message: "Portfolio backend running" });
});

app.get("/api", (req, res) => {
  res.json({ message: "API is working" });
});

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/site-settings", settingsRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/uploads", uploadRoutes);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});