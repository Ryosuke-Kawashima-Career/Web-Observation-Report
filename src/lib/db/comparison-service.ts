import db from './index';

export interface Comparison {
  id: number;
  target_id: number;
  baseline_snapshot_id: number;
  current_snapshot_id: number;
  heatmap_path: string | null;
  pixel_change_pct: number;
  structural_diff: string | null;
  ai_summary: string | null;
  compared_at: string;
}

export class ComparisonService {
  static create(params: {
    targetId: number;
    baselineSnapshotId: number;
    currentSnapshotId: number;
    heatmapPath?: string;
    pixelChangePct?: number;
    structuralDiff?: string;
    aiSummary?: string;
  }): number | bigint {
    const info = db
      .prepare(
        `INSERT INTO comparisons
          (target_id, baseline_snapshot_id, current_snapshot_id,
           heatmap_path, pixel_change_pct, structural_diff, ai_summary)
         VALUES (?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        params.targetId,
        params.baselineSnapshotId,
        params.currentSnapshotId,
        params.heatmapPath ?? null,
        params.pixelChangePct ?? 0,
        params.structuralDiff ?? null,
        params.aiSummary ?? null
      );
    return info.lastInsertRowid;
  }

  static getByTarget(targetId: number): Comparison[] {
    return db
      .prepare('SELECT * FROM comparisons WHERE target_id = ? ORDER BY compared_at DESC')
      .all(targetId) as Comparison[];
  }

  static getLatest(targetId: number): Comparison | undefined {
    return db
      .prepare(
        'SELECT * FROM comparisons WHERE target_id = ? ORDER BY compared_at DESC LIMIT 1'
      )
      .get(targetId) as Comparison | undefined;
  }
}
