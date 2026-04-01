import Database from 'better-sqlite3';
import path from 'path';

const dbPath = path.join(process.cwd(), 'observations.db');
const db = new Database(dbPath);

// Initialize schema
db.exec(`
  CREATE TABLE IF NOT EXISTS targets (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    url TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS snapshots (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_id INTEGER NOT NULL,
    screenshot_path TEXT NOT NULL,
    html_path TEXT NOT NULL,
    captured_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_baseline BOOLEAN DEFAULT 0,
    FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS comparisons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    target_id INTEGER NOT NULL,
    baseline_snapshot_id INTEGER NOT NULL,
    current_snapshot_id INTEGER NOT NULL,
    heatmap_path TEXT,
    pixel_change_pct REAL DEFAULT 0,
    structural_diff TEXT,
    ai_summary TEXT,
    compared_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (target_id) REFERENCES targets (id) ON DELETE CASCADE,
    FOREIGN KEY (baseline_snapshot_id) REFERENCES snapshots (id) ON DELETE CASCADE,
    FOREIGN KEY (current_snapshot_id) REFERENCES snapshots (id) ON DELETE CASCADE
  );
`);

export default db;
