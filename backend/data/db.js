import Database from "better-sqlite3";

const db = new Database("portfolio.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS admin (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    passwordHash TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    techStack TEXT,
    githubUrl TEXT,
    liveUrl TEXT,
    imageUrl TEXT,
    featured INTEGER DEFAULT 0,
    displayOrder INTEGER DEFAULT 0,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP,
    updatedAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1),
    aboutText TEXT,
    resumeUrl TEXT,
    linkedinUrl TEXT,
    githubUrl TEXT,
    email TEXT,
    profileImageUrl TEXT
  );

  CREATE TABLE IF NOT EXISTS analytics_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    eventType TEXT NOT NULL,
    page TEXT,
    projectId INTEGER,
    sessionId TEXT,
    metadata TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS uploads (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    fileName TEXT NOT NULL,
    fileUrl TEXT NOT NULL,
    fileType TEXT,
    category TEXT,
    createdAt TEXT DEFAULT CURRENT_TIMESTAMP
  );
`);

const existingSettings = db
  .prepare("SELECT * FROM site_settings WHERE id = 1")
  .get();

if (!existingSettings) {
  db.prepare(`
    INSERT INTO site_settings
    (id, aboutText, resumeUrl, linkedinUrl, githubUrl, email, profileImageUrl)
    VALUES (1, '', '', '', '', '', '')
  `).run();
}

export default db;