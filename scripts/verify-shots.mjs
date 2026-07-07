import { chromium } from "playwright-core";

const out = "/tmp/claude-0/-home-user-Lewis-tutoring/1957148a-8928-55dd-8914-b596bfd21d2d/scratchpad";
const base = "http://localhost:3100";

const browser = await chromium.launch({ executablePath: "/opt/pw-browsers/chromium" });

// desktop pages
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
for (const [path, name] of [
  ["/login", "login"],
  ["/kid-login", "kid-login"],
  ["/signup", "signup"],
  ["/does-not-exist", "404"],
  ["/terms", "terms"],
]) {
  await page.goto(base + path, { waitUntil: "networkidle" }).catch(() => {});
  await page.waitForTimeout(900);
  await page.screenshot({ path: `${out}/v-${name}.png` });
  console.log("shot", name);
}

// mobile landing
const mob = await browser.newPage({ viewport: { width: 390, height: 844 } });
await mob.goto(base + "/", { waitUntil: "networkidle" });
await mob.waitForTimeout(1000);
await mob.screenshot({ path: `${out}/v-mobile-hero.png` });
await mob.evaluate(() => window.scrollTo(0, 2200));
await mob.waitForTimeout(800);
await mob.screenshot({ path: `${out}/v-mobile-mid.png` });
// open mobile menu
await mob.evaluate(() => window.scrollTo(0, 0));
await mob.click('button[aria-label="Open menu"]');
await mob.waitForTimeout(400);
await mob.screenshot({ path: `${out}/v-mobile-menu.png` });
console.log("mobile shots done");

await browser.close();
