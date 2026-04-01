import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs/promises';
import path from 'path';
import { VisualDiffResult } from './visual-comparator';
import { StructuralDiffResult } from './structural-comparator';

export interface GeminiSummaryInput {
  targetName: string;
  targetUrl: string;
  capturedAt: string;
  visualDiff: VisualDiffResult;
  structuralDiff: StructuralDiffResult;
  /** Relative paths inside public/storage (optional – enables vision analysis) */
  baselineScreenshotPath?: string;
  currentScreenshotPath?: string;
}

export interface GeminiSummaryResult {
  summary: string;
  model: string;
  tokensUsed?: number;
}

const STORAGE_DIR = path.join(process.cwd(), 'public', 'storage');
// Allow override via GEMINI_MODEL env var; default to gemini-2.5-flash
const MODEL_ID = process.env.GEMINI_MODEL ?? 'gemini-2.5-flash';

/**
 * Minimum change required to invoke Gemini (avoids unnecessary API calls for
 * trivial dynamic-content fluctuations such as ad rotation).
 */
const VISUAL_THRESHOLD_PCT = 1.0;
const STRUCTURAL_THRESHOLD_PCT = 1.0;

export class GeminiService {
  static async summarize(input: GeminiSummaryInput): Promise<GeminiSummaryResult> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error('GEMINI_API_KEY environment variable is not set');

    const belowThreshold =
      input.visualDiff.pixelChangePct < VISUAL_THRESHOLD_PCT &&
      input.structuralDiff.changePercent < STRUCTURAL_THRESHOLD_PCT;

    if (belowThreshold) {
      return {
        summary: 'No significant changes detected (below threshold).',
        model: 'none',
      };
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: MODEL_ID });
    const prompt = buildPrompt(input);

    let result;
    if (input.baselineScreenshotPath && input.currentScreenshotPath) {
      try {
        result = await summarizeWithVision(model, prompt, input);
      } catch {
        // Fall back to text-only if images are too large or unavailable
        result = await model.generateContent(prompt);
      }
    } else {
      result = await model.generateContent(prompt);
    }

    const response = result.response;
    return {
      summary: response.text(),
      model: model.model,
      tokensUsed: response.usageMetadata?.totalTokenCount,
    };
  }
}

async function summarizeWithVision(
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  model: any,
  textPrompt: string,
  input: GeminiSummaryInput
) {
  const [baselineBuf, currentBuf] = await Promise.all([
    fs.readFile(path.join(STORAGE_DIR, input.baselineScreenshotPath!)),
    fs.readFile(path.join(STORAGE_DIR, input.currentScreenshotPath!)),
  ]);

  return model.generateContent([
    { inlineData: { mimeType: 'image/png', data: baselineBuf.toString('base64') } },
    { inlineData: { mimeType: 'image/png', data: currentBuf.toString('base64') } },
    textPrompt,
  ]);
}

function buildPrompt(input: GeminiSummaryInput): string {
  const { targetName, targetUrl, capturedAt, visualDiff, structuralDiff } = input;
  const sampleChanges =
    structuralDiff.significantChanges.length > 0
      ? structuralDiff.significantChanges
          .slice(0, 10)
          .map((c) => `- ${c}`)
          .join('\n')
      : '- No significant text changes';

  return `You are a web-monitoring analyst summarising website changes for a business executive.

Website: ${targetName} (${targetUrl})
Observation Date: ${capturedAt}

## Visual Change
- ${visualDiff.pixelChangePct.toFixed(2)}% of pixels changed
- ${visualDiff.diffPixels.toLocaleString()} / ${visualDiff.totalPixels.toLocaleString()} pixels affected

## Structural Change
- Lines added: ${structuralDiff.addedLines}
- Lines removed: ${structuralDiff.removedLines}
- Overall change: ${structuralDiff.changePercent.toFixed(2)}%

## Sample Content Changes
${sampleChanges}

## Instructions
Write a concise summary (≤150 words) for a business executive that:
1. States whether this is a significant change or a minor update.
2. Highlights any pricing, promotional, or UI changes.
3. Recommends a follow-up action if appropriate.
Be specific and avoid technical jargon.`;
}
