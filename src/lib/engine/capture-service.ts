import { chromium } from 'playwright';
// import { useStealth } from 'playwright-stealth';
import path from 'path';
import fs from 'fs/promises';
import { DateTime } from 'luxon';

export interface CaptureResult {
  screenshotPath: string;
  htmlPath: string;
}

export class CaptureService {
  private static STORAGE_DIR = path.join(process.cwd(), 'public', 'storage');

  static async capture(url: string, targetId: number): Promise<CaptureResult> {
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext({
      viewport: { width: 1920, height: 1080 },
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();
    
    // Add stealth plugin manually if needed, or just set headers
    // For now, let's just go with standard Playwright as stealth might need more setup

    try {
      await page.goto(url, { waitUntil: 'networkidle', timeout: 60000 });
      
      const timestamp = DateTime.now().toFormat('yyyyMMdd-HHmmss');
      const filenameBase = `${targetId}-${timestamp}`;
      
      const screenshotFilename = `${filenameBase}.png`;
      const htmlFilename = `${filenameBase}.html`;
      
      const screenshotRelativePath = path.join('baselines', screenshotFilename);
      const htmlRelativePath = path.join('baselines', htmlFilename);
      
      const screenshotFullPath = path.join(this.STORAGE_DIR, screenshotRelativePath);
      const htmlFullPath = path.join(this.STORAGE_DIR, htmlRelativePath);

      // Ensure directory exists
      await fs.mkdir(path.dirname(screenshotFullPath), { recursive: true });

      await page.screenshot({ path: screenshotFullPath, fullPage: true });
      const htmlContent = await page.content();
      await fs.writeFile(htmlFullPath, htmlContent, 'utf-8');

      return {
        screenshotPath: screenshotRelativePath,
        htmlPath: htmlRelativePath,
      };
    } finally {
      await browser.close();
    }
  }
}
