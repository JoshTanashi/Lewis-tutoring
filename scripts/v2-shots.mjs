import { chromium } from "playwright-core";

const out = "/tmp/claude-0/-home-user-Lewis-tutoring/1957148a-8928-55dd-8914-b596bfd21d2d/scratchpad";
const base = "http://localhost:3100";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

// onboarding step 0: who's signing up
await page.goto(`${base}/onboarding`, { waitUntil: "networkidle" });
await page.waitForTimeout(900);
await page.screenshot({ path: `${out}/v2-onboarding-who.png` });

// walk to the child step as a parent
await page.click("text=I'm a parent");
await page.click("text=Next →");
await page.waitForTimeout(400);
await page.fill('input[placeholder="e.g. Sam Naidoo"]', "Sam Screenshot");
await page.fill('input[placeholder="you@example.com"]', "shot@example.com");
await page.click("text=Next →");
await page.waitForTimeout(400);
await page.fill('input[placeholder="e.g. Zoë"]', "Lily");
await page.selectOption("select", { label: "Grade 2" });
await page.click("text=➗ Mathematics");
await page.waitForTimeout(300);
await page.screenshot({ path: `${out}/v2-onboarding-child.png` });

// package step
await page.click("text=Next →");
await page.waitForTimeout(400);
await page.screenshot({ path: `${out}/v2-onboarding-package.png` });

// times step with the slot counter (choose Momentum: 8 slots)
await page.click("text=Momentum");
await page.click("text=Next →");
await page.waitForTimeout(700);
await page.screenshot({ path: `${out}/v2-onboarding-times.png` });

// become a tutor
await page.goto(`${base}/become-a-tutor`, { waitUntil: "networkidle" });
await page.waitForTimeout(800);
await page.screenshot({ path: `${out}/v2-become-a-tutor.png`, fullPage: false });

await browser.close();
console.log("done");
