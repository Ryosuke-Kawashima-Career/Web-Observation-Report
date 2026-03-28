import db from './index';

export interface Snapshot {
  id: number;
  target_id: number;
  screenshot_path: string;
  html_path: string;
  captured_at: string;
  is_baseline: number;
}

export class SnapshotService {
  static create(targetId: number, screenshotPath: string, htmlPath: string, isBaseline: boolean = false): number | bigint {
    const info = db.prepare(`
      INSERT INTO snapshots (target_id, screenshot_path, html_path, is_baseline)
      VALUES (?, ?, ?, ?)
    `).run(targetId, screenshotPath, htmlPath, isBaseline ? 1 : 0);
    return info.lastInsertRowid;
  }

  static getBaseline(targetId: number): Snapshot | undefined {
    return db.prepare('SELECT * FROM snapshots WHERE target_id = ? AND is_baseline = 1').get(targetId) as Snapshot | undefined;
  }

  static hasBaseline(targetId: number): boolean {
    const count = (db.prepare('SELECT COUNT(*) as count FROM snapshots WHERE target_id = ? AND is_baseline = 1').get(targetId) as { count: number }).count;
    return count > 0;
  }

  static setBaseline(targetId: number, snapshotId: number): boolean {
    const transaction = db.transaction(() => {
      // Clear current baseline
      db.prepare('UPDATE snapshots SET is_baseline = 0 WHERE target_id = ?').run(targetId);
      // Set new baseline
      db.prepare('UPDATE snapshots SET is_baseline = 1 WHERE id = ?').run(snapshotId);
    });

    try {
      transaction();
      return true;
    } catch (err) {
      console.error('Failed to set baseline', err);
      return false;
    }
  }

  static getHistory(targetId: number): Snapshot[] {
    return db.prepare('SELECT * FROM snapshots WHERE target_id = ? ORDER BY captured_at DESC').all(targetId) as Snapshot[];
  }
}
