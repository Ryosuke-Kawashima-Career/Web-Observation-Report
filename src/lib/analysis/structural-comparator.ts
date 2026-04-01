import { diffLines, Change } from 'diff';
import fs from 'fs/promises';
import path from 'path';

export interface StructuralDiffResult {
  addedLines: number;
  removedLines: number;
  unchangedLines: number;
  changePercent: number;
  significantChanges: string[];
  rawDiff: string;
}

const STORAGE_DIR = path.join(process.cwd(), 'public', 'storage');
// Show at most this many sample change lines in significantChanges
const MAX_SAMPLES = 20;

/**
 * Compares the text content of two HTML snapshots.
 * Strips tags and scripts so the diff focuses on visible content changes.
 */
export class StructuralComparator {
  static async compare(
    baselineHtmlPath: string,
    currentHtmlPath: string
  ): Promise<StructuralDiffResult> {
    const [baselineHtml, currentHtml] = await Promise.all([
      fs.readFile(path.join(STORAGE_DIR, baselineHtmlPath), 'utf-8'),
      fs.readFile(path.join(STORAGE_DIR, currentHtmlPath), 'utf-8'),
    ]);

    const baselineText = extractText(baselineHtml);
    const currentText = extractText(currentHtml);

    const changes: Change[] = diffLines(baselineText, currentText);

    let addedLines = 0;
    let removedLines = 0;
    let unchangedLines = 0;
    const significantChanges: string[] = [];
    const rawDiffLines: string[] = [];

    for (const change of changes) {
      const lines = change.value.split('\n').filter((l) => l.trim().length > 0);
      const count = lines.length;

      if (change.added) {
        addedLines += count;
        // Collect up to 3 sample lines per chunk
        lines.slice(0, 3).forEach((l) => significantChanges.push(`[ADDED] ${l.substring(0, 120)}`));
        rawDiffLines.push(...lines.slice(0, 5).map((l) => `+ ${l.substring(0, 200)}`));
      } else if (change.removed) {
        removedLines += count;
        lines.slice(0, 3).forEach((l) => significantChanges.push(`[REMOVED] ${l.substring(0, 120)}`));
        rawDiffLines.push(...lines.slice(0, 5).map((l) => `- ${l.substring(0, 200)}`));
      } else {
        unchangedLines += count;
      }
    }

    const totalLines = addedLines + removedLines + unchangedLines;
    const changePercent = totalLines > 0 ? ((addedLines + removedLines) / totalLines) * 100 : 0;

    return {
      addedLines,
      removedLines,
      unchangedLines,
      changePercent,
      significantChanges: significantChanges.slice(0, MAX_SAMPLES),
      rawDiff: rawDiffLines.slice(0, 50).join('\n'),
    };
  }
}

/**
 * Strips HTML tags, scripts, and styles then returns deduplicated visible text lines.
 * Avoids heavy dependencies (e.g. jsdom) for simplicity.
 */
function extractText(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, '\n')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l.length > 1) // drop single-char noise
    .join('\n');
}
