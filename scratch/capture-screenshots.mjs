import { chromium } from 'playwright';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(__dirname, '../docs/screenshots');

if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const mockResults = {
  features: [
    {
      name: "AI Auto-complete in Search",
      reach: 9,
      impact: 8,
      confidence: 85,
      effort: 3,
      rice_score: 2040,
      sprint: "NOW",
      reasoning: "High reach across active daily users with strong impact on conversion and minimal effort required using pre-trained models.",
      risks: ["Latency on slow connections", "Query fallback handling"],
      category: "AI/ML"
    },
    {
      name: "Real-time Order Tracking Map",
      reach: 9,
      impact: 9,
      confidence: 90,
      effort: 4,
      rice_score: 1822,
      sprint: "NOW",
      reasoning: "Dramatically improves user trust during active delivery. High reach and confidence.",
      risks: ["Third-party Map API costs", "GPS accuracy variances"],
      category: "UX/Design"
    },
    {
      name: "Automated Weekly Analytics Digest",
      reach: 6,
      impact: 6,
      confidence: 80,
      effort: 5,
      rice_score: 576,
      sprint: "NEXT",
      reasoning: "Drives merchant retention with actionable insights, suitable for next sprint implementation.",
      risks: ["Email deliverability rates"],
      category: "Analytics"
    },
    {
      name: "Biometric FaceID Login",
      reach: 4,
      impact: 4,
      confidence: 70,
      effort: 8,
      rice_score: 140,
      sprint: "LATER",
      reasoning: "High implementation effort with niche user reach. Better suited for backlog item.",
      risks: ["Device compatibility issues"],
      category: "Security"
    }
  ],
  model: "meta/llama-3.3-70b-instruct"
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 2,
  });

  const page = await context.newPage();

  // 1. Home / Input page screenshot
  console.log('Navigating to home...');
  await page.goto('https://01-feature-prioritizer.vercel.app', { waitUntil: 'networkidle' });
  await page.screenshot({ path: path.join(screenshotsDir, 'home_input.png'), fullPage: false });
  console.log('Saved home_input.png');

  // 2. Set sessionStorage and navigate to results page
  await page.evaluate((data) => {
    sessionStorage.setItem('priorityResults', JSON.stringify(data));
  }, mockResults);

  await page.goto('https://01-feature-prioritizer.vercel.app/results', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1500);

  // Tab 0: Score Cards
  await page.screenshot({ path: path.join(screenshotsDir, 'score_cards.png'), fullPage: false });
  console.log('Saved score_cards.png');

  // Tab 1: Matrix Chart
  console.log('Clicking Matrix Chart tab...');
  const matrixBtn = page.getByRole('button', { name: /Matrix Chart/i });
  await matrixBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'matrix_chart.png'), fullPage: false });
  console.log('Saved matrix_chart.png');

  // Tab 2: Roadmap
  console.log('Clicking Roadmap tab...');
  const roadmapBtn = page.getByRole('button', { name: /Roadmap/i });
  await roadmapBtn.click();
  await page.waitForTimeout(1500);
  await page.screenshot({ path: path.join(screenshotsDir, 'sprint_roadmap.png'), fullPage: false });
  console.log('Saved sprint_roadmap.png');

  // Full Dashboard view (Score Cards full page)
  const scoreCardsBtn = page.getByRole('button', { name: /Score Cards/i });
  await scoreCardsBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: path.join(screenshotsDir, 'dashboard.png'), fullPage: true });
  console.log('Updated dashboard.png');

  await browser.close();
  console.log('All screenshots captured successfully!');
})();
