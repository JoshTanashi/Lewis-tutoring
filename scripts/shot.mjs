import { chromium } from "playwright-core";

const outDir = "/tmp/claude-0/-home-user-Lewis-tutoring/1957148a-8928-55dd-8914-b596bfd21d2d/scratchpad";
const [, , url = "http://localhost:3100/", name = "page", mode = "sections"] = process.argv;

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(1200);

if (mode === "full") {
  // scroll to trigger reveals, then full-page shot
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 700) {
      window.scrollTo(0, y);
      await new Promise((r) => setTimeout(r, 120));
    }
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(800);
  await page.screenshot({ path: `${outDir}/${name}-full.png`, fullPage: true });
} else if (mode === "sections") {
  const height = await page.evaluate(() => document.body.scrollHeight);
  let i = 0;
  for (let y = 0; y < height; y += 850) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(700);
    await page.screenshot({ path: `${outDir}/${name}-${String(i).padStart(2, "0")}.png` });
    i++;
    if (i > 12) break;
  }
} else {
  await page.screenshot({ path: `${outDir}/${name}.png` });
}
await browser.close();
console.log("done");
