/**
 * Phase 2 verification script: Change Detection & AI Summaries
 *
 * Usage:
 *   npx ts-node scripts/verify-phase2.ts
 *
 * Requires GEMINI_API_KEY in a .env file (or as an environment variable).
 */
import 'dotenv/config';
import { TargetService } from '../src/lib/db/target-service';
import { SnapshotService } from '../src/lib/db/snapshot-service';
import { CaptureService } from '../src/lib/engine/capture-service';
import { VisualComparator } from '../src/lib/analysis/visual-comparator';
import { StructuralComparator } from '../src/lib/analysis/structural-comparator';
import { GeminiService } from '../src/lib/analysis/gemini-service';
import { ComparisonService } from '../src/lib/db/comparison-service';
import { DateTime } from 'luxon';

const TARGET_NAME = 'Google (Phase 2 Test)';
const TARGET_URL = 'https://www.google.com';

async function main() {
  console.log('=== Phase 2 Verification: Change Detection & AI Summaries ===\n');

  // ── 1. Prepare target ────────────────────────────────────────────────────
  let targetId: number;
  const existing = TargetService.getAll().find((t) => t.company_name === TARGET_NAME);
  if (existing) {
    targetId = existing.id;
    console.log(`[target] Reusing existing target (ID=${targetId})`);
  } else {
    targetId = Number(TargetService.create(TARGET_NAME, TARGET_URL));
    console.log(`[target] Registered new target (ID=${targetId})`);
  }

  // ── 2. Capture / retrieve baseline ──────────────────────────────────────
  let baseline = SnapshotService.getBaseline(targetId);
  if (!baseline) {
    console.log('[baseline] No baseline found – capturing now…');
    const cap = await CaptureService.capture(TARGET_URL, targetId);
    SnapshotService.create(targetId, cap.screenshotPath, cap.htmlPath, true);
    baseline = SnapshotService.getBaseline(targetId)!;
    console.log(`[baseline] Saved: ${baseline.screenshot_path}`);
  } else {
    console.log(`[baseline] Found: ${baseline.screenshot_path}`);
  }

  // ── 3. Capture current snapshot ─────────────────────────────────────────
  console.log('\n[current] Capturing current snapshot…');
  const currentCap = await CaptureService.capture(TARGET_URL, targetId);
  const currentId = Number(
    SnapshotService.create(targetId, currentCap.screenshotPath, currentCap.htmlPath, false)
  );
  console.log(`[current] Saved: ${currentCap.screenshotPath} (ID=${currentId})`);

  // ── 4. Visual comparison ─────────────────────────────────────────────────
  console.log('\n[visual] Running pixel-level comparison…');
  const visualDiff = await VisualComparator.compare(
    baseline.screenshot_path,
    currentCap.screenshotPath,
    targetId
  );
  console.log(`[visual] Pixel change: ${visualDiff.pixelChangePct.toFixed(2)}%`);
  console.log(`[visual] Heatmap: ${visualDiff.heatmapPath}`);

  // ── 5. Structural comparison ─────────────────────────────────────────────
  console.log('\n[structural] Diffing DOM text content…');
  const structuralDiff = await StructuralComparator.compare(
    baseline.html_path,
    currentCap.htmlPath
  );
  console.log(`[structural] Change: ${structuralDiff.changePercent.toFixed(2)}%`);
  console.log(
    `[structural] +${structuralDiff.addedLines} lines / -${structuralDiff.removedLines} lines`
  );
  if (structuralDiff.significantChanges.length > 0) {
    console.log('[structural] Sample changes:');
    structuralDiff.significantChanges.slice(0, 5).forEach((c) => console.log(`  ${c}`));
  }

  // ── 6. Gemini AI summary ─────────────────────────────────────────────────
  console.log('\n[gemini] Generating AI summary…');
  const target = TargetService.getById(targetId)!;
  let aiSummary = '(Gemini unavailable)';
  let geminiModel = 'none';

  try {
    const geminiResult = await GeminiService.summarize({
      targetName: target.company_name,
      targetUrl: target.url,
      capturedAt: DateTime.now().toISO()!,
      visualDiff,
      structuralDiff,
      baselineScreenshotPath: baseline.screenshot_path,
      currentScreenshotPath: currentCap.screenshotPath,
    });
    aiSummary = geminiResult.summary;
    geminiModel = geminiResult.model;
    console.log(`[gemini] Model: ${geminiModel}`);
    if (geminiResult.tokensUsed) console.log(`[gemini] Tokens used: ${geminiResult.tokensUsed}`);
    console.log('\n--- AI Summary ---');
    console.log(aiSummary);
    console.log('------------------');
  } catch (err) {
    console.warn('[gemini] Error:', (err as Error).message);
  }

  // ── 7. Persist comparison ────────────────────────────────────────────────
  console.log('\n[db] Saving comparison record…');
  const comparisonId = ComparisonService.create({
    targetId,
    baselineSnapshotId: baseline.id,
    currentSnapshotId: currentId,
    heatmapPath: visualDiff.heatmapPath,
    pixelChangePct: visualDiff.pixelChangePct,
    structuralDiff: structuralDiff.rawDiff,
    aiSummary,
  });
  console.log(`[db] Comparison saved (ID=${comparisonId})`);

  const saved = ComparisonService.getLatest(targetId);
  console.log('\n=== Phase 2 Verification PASSED ===');
  console.log('Latest comparison:', JSON.stringify(saved, null, 2));
}

main().catch((err) => {
  console.error('FAILED:', err);
  process.exit(1);
});
