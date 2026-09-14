const assert = require("node:assert/strict");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const baseUrl = process.env.GLOBE_BASE_URL || "http://localhost:3000";
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function centerOf(locator) {
  const box = await locator.boundingBox();
  assert(box, "Globe canvas has no visible bounding box");
  return { box, x: box.x + box.width / 2, y: box.y + box.height / 2 };
}

(async () => {
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const errors = [];
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on("pageerror", (error) => errors.push(`pageerror:${error.message}`));
  page.on("console", (message) => {
    if (message.type() === "error" && !message.text().includes("favicon")) errors.push(`console:${message.text()}`);
  });

  await page.goto(`${baseUrl}/fa/canvas?qa=globe`, { waitUntil: "networkidle" });
  await page.locator(".signal-intro").waitFor({ state: "detached" });
  const canvas = page.locator(".iran-globe canvas");
  await canvas.waitFor({ state: "visible" });
  assert.equal(await page.locator(".iran-beacon").count(), 0, "Legacy Iran beacon must be removed");
  assert.match(await canvas.getAttribute("aria-label"), /بکشید تا بچرخد/);

  const { box, x, y } = await centerOf(canvas);
  await page.mouse.move(x - 40, y - 35);
  await page.mouse.down();
  await page.mouse.move(x + 145, y - 78, { steps: 9 });
  await page.locator(".iran-globe.is-dragging").waitFor({ state: "attached" });
  await page.waitForTimeout(100);
  await page.screenshot({ path: path.join(root, "artifacts", "phase2", "globe-drag-fa.png"), fullPage: true });
  await page.mouse.up();
  await page.locator(".iran-globe.is-kinetic").waitFor({ state: "attached" });
  assert.equal(await page.locator(".orbit-model").count(), 0, "Dragging must not trigger Iran selection");

  await page.reload({ waitUntil: "networkidle" });
  const freshCanvas = page.locator(".iran-globe canvas");
  const fresh = await centerOf(freshCanvas);
  await page.mouse.click(fresh.x, fresh.y);
  await page.locator(".orbit-model").first().waitFor({ state: "visible" });
  assert.equal(await page.locator(".orbit-model").count(), 9, "Clicking Iran must reveal all nine models");
  assert.match(page.url(), /view=ecosystem/);

  const mobilePage = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobilePage.on("pageerror", (error) => errors.push(`mobile-pageerror:${error.message}`));
  await mobilePage.goto(`${baseUrl}/fa/canvas?qa=mobile`, { waitUntil: "networkidle" });
  await mobilePage.locator(".signal-intro").waitFor({ state: "detached" });
  const mobileCanvas = mobilePage.locator(".iran-globe canvas");
  const mobileCenter = await centerOf(mobileCanvas);
  await mobilePage.mouse.click(mobileCenter.x, mobileCenter.y);
  await mobilePage.locator(".orbit-model").first().waitFor({ state: "visible" });
  assert.equal(await mobilePage.locator(".orbit-model").count(), 9);
  assert.equal(await mobilePage.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  await mobilePage.close();

  const reduced = await browser.newContext({ viewport: { width: 1280, height: 850 }, reducedMotion: "reduce" });
  const reducedPage = await reduced.newPage();
  reducedPage.on("pageerror", (error) => errors.push(`reduced-pageerror:${error.message}`));
  await reducedPage.goto(`${baseUrl}/fa/canvas?qa=reduced`, { waitUntil: "networkidle" });
  await reducedPage.locator(".signal-intro").waitFor({ state: "detached" });
  const reducedCanvas = reducedPage.locator(".iran-globe canvas");
  const reducedCenter = await centerOf(reducedCanvas);
  await reducedPage.mouse.move(reducedCenter.x - 25, reducedCenter.y);
  await reducedPage.mouse.down();
  await reducedPage.mouse.move(reducedCenter.x + 85, reducedCenter.y - 30, { steps: 6 });
  await reducedPage.locator(".iran-globe.is-dragging").waitFor({ state: "attached" });
  await reducedPage.mouse.up();
  assert.doesNotMatch(await reducedPage.locator(".iran-globe").getAttribute("class"), /is-kinetic/);
  await reduced.close();

  await browser.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({
    passed: [
      "beacon removed",
      "drag rotates without selecting Iran",
      "kinetic motion activates after release",
      "clicking Iran reveals nine models",
      "mobile Iran selection stays inside the viewport",
      "reduced motion keeps direct drag and disables inertia",
    ],
    canvas: { width: Math.round(box.width), height: Math.round(box.height) },
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
