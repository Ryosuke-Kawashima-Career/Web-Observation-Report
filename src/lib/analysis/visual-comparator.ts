import { PNG } from 'pngjs';
import pixelmatch from 'pixelmatch';
import fs from 'fs/promises';
import path from 'path';
import { DateTime } from 'luxon';

export interface VisualDiffResult {
  heatmapPath: string;
  pixelChangePct: number;
  totalPixels: number;
  diffPixels: number;
}

const STORAGE_DIR = path.join(process.cwd(), 'public', 'storage');

/**
 * Compares two full-page screenshots and produces a heatmap PNG highlighting
 * changed pixels. Uses pixelmatch with a threshold of 0.1 (ignores anti-aliasing).
 */
export class VisualComparator {
  static async compare(
    baselineScreenshotPath: string,
    currentScreenshotPath: string,
    targetId: number
  ): Promise<VisualDiffResult> {
    const baselineFullPath = path.join(STORAGE_DIR, baselineScreenshotPath);
    const currentFullPath = path.join(STORAGE_DIR, currentScreenshotPath);

    const [baselineBuf, currentBuf] = await Promise.all([
      fs.readFile(baselineFullPath),
      fs.readFile(currentFullPath),
    ]);

    const baseline = PNG.sync.read(baselineBuf);
    const current = PNG.sync.read(currentBuf);

    // Crop to min dimensions so pixelmatch receives equal-size buffers
    const width = Math.min(baseline.width, current.width);
    const height = Math.min(baseline.height, current.height);

    const baselineData = this.cropBuffer(baseline, width, height);
    const currentData = this.cropBuffer(current, width, height);

    const diffPng = new PNG({ width, height });

    const diffPixels = pixelmatch(baselineData, currentData, diffPng.data, width, height, {
      threshold: 0.1,
      includeAA: false,
    });

    // Save heatmap
    const diffsDir = path.join(STORAGE_DIR, 'diffs');
    await fs.mkdir(diffsDir, { recursive: true });

    const timestamp = DateTime.now().toFormat('yyyyMMdd-HHmmss');
    const heatmapFilename = `${targetId}-${timestamp}-diff.png`;
    const heatmapRelPath = path.join('diffs', heatmapFilename);
    await fs.writeFile(path.join(STORAGE_DIR, heatmapRelPath), PNG.sync.write(diffPng));

    const totalPixels = width * height;
    const pixelChangePct = (diffPixels / totalPixels) * 100;

    return { heatmapPath: heatmapRelPath, pixelChangePct, totalPixels, diffPixels };
  }

  /** Extract a width×height sub-buffer from the top-left of a PNG. */
  private static cropBuffer(png: PNG, width: number, height: number): Buffer {
    if (png.width === width && png.height === height) return png.data as unknown as Buffer;

    const cropped = Buffer.alloc(width * height * 4);
    for (let y = 0; y < height; y++) {
      const srcOffset = (y * png.width) * 4;
      const dstOffset = y * width * 4;
      png.data.copy(cropped, dstOffset, srcOffset, srcOffset + width * 4);
    }
    return cropped;
  }
}
