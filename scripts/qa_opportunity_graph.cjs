const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const artifacts = path.join(root, "artifacts", "qa-opportunity-graph");
const baseUrl = process.env.OPPORTUNITY_BASE_URL || "http://127.0.0.1:3220";
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function assertNoOverflow(page, label) {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  assert.ok(overflow <= 1, `${label}: horizontal overflow is ${overflow}px`);
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: "reduce" });
  const errors = [];
  desktop.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  desktop.on("console", (message) => { if (message.type() === "error") errors.push(`console: ${message.text()}`); });

  await desktop.goto(`${baseUrl}/`, { waitUntil: "networkidle" });
  assert.match(desktop.url(), /\/en\/canvas/);
  await desktop.goto(`${baseUrl}/en/canvas?view=ecosystem`, { waitUntil: "networkidle" });
  assert.equal(await desktop.locator(".header-command").isVisible(), true);
  assert.equal(await desktop.locator(".geo-progress").count(), 0);
  assert.equal(await desktop.locator(".source-coverage").count(), 0);
  assert.equal(await desktop.locator(".value-expand").count(), 0);
  assert.equal(await desktop.locator(".opportunity-cluster").count(), 9);
  assert.equal(await desktop.locator(".opportunity-value").count(), 66);
  assert.equal(await desktop.locator(".selection-signal.is-idle").count(), 1);
  await assertNoOverflow(desktop, "desktop overview");
  const before = await desktop.locator(".opportunity-cluster").evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height, offsetLeft: node.offsetLeft, offsetTop: node.offsetTop };
  }));
  await desktop.screenshot({ path: path.join(artifacts, "desktop-clusters.png"), fullPage: true });

  await desktop.getByRole("button", { name: "Qualified Foreign Business", exact: true }).click();
  await desktop.locator(".selection-signal:not(.is-idle)").waitFor();
  assert.match(desktop.url(), /value=persona-02/);
  assert.equal(await desktop.locator(".opportunity-cluster").count(), 9);
  assert.equal(await desktop.locator(".selected-value-core").count(), 0);
  assert.equal(await desktop.locator(".opportunity-value.is-selected").count(), 1);
  assert.ok(await desktop.locator(".opportunity-value.is-related").count() > 8);
  assert.ok(await desktop.locator(".opportunity-value.is-unrelated").count() > 8);
  assert.ok(await desktop.locator(".opportunity-cluster").filter({ has: desktop.locator(".opportunity-value.is-related") }).count() > 2);
  const after = await desktop.locator(".opportunity-cluster").evaluateAll((nodes) => nodes.map((node) => {
    const box = node.getBoundingClientRect();
    return { x: box.x, y: box.y, width: box.width, height: box.height, offsetLeft: node.offsetLeft, offsetTop: node.offsetTop };
  }));
  before.forEach((box, index) => {
    assert.ok(Math.abs(box.x - after[index].x) <= 1, `Cluster ${index} moved horizontally`);
    assert.ok(Math.abs(box.width - after[index].width) <= 1, `Cluster ${index} changed width`);
    assert.equal(box.offsetLeft, after[index].offsetLeft, `Cluster ${index} changed its grid column`);
    assert.equal(box.offsetTop, after[index].offsetTop, `Cluster ${index} changed its grid row`);
  });
  await desktop.screenshot({ path: path.join(artifacts, "desktop-related-highlight.png"), fullPage: true });
  await desktop.getByRole("button", { name: "Clear selection" }).click();
  assert.equal(await desktop.locator(".selection-signal.is-idle").count(), 1);

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 }, reducedMotion: "reduce" });
  await mobile.goto(`${baseUrl}/en/canvas?view=ecosystem&value=persona-02`, { waitUntil: "networkidle" });
  assert.equal(await mobile.locator(".header-command-toggle").isVisible(), true);
  assert.equal(await mobile.locator(".opportunity-cluster").count(), 9);
  assert.equal(await mobile.locator(".opportunity-value").count(), 66);
  assert.equal(await mobile.locator(".opportunity-value.is-selected").count(), 1);
  const targetBox = await mobile.getByRole("button", { name: "Qualified Foreign Business", exact: true }).boundingBox();
  assert.ok(targetBox && targetBox.height >= 44, `Mobile value target is too small: ${JSON.stringify(targetBox)}`);
  await assertNoOverflow(mobile, "mobile portrait");
  await mobile.screenshot({ path: path.join(artifacts, "mobile-related-highlight.png"), fullPage: true });

  const landscape = await browser.newPage({ viewport: { width: 844, height: 390 }, reducedMotion: "reduce" });
  await landscape.goto(`${baseUrl}/en/canvas?view=ecosystem&value=persona-02`, { waitUntil: "networkidle" });
  assert.equal(await landscape.locator(".opportunity-cluster").count(), 9);
  await assertNoOverflow(landscape, "mobile landscape");
  await landscape.screenshot({ path: path.join(artifacts, "landscape-related-highlight.png"), fullPage: true });

  const persian = await browser.newPage({ viewport: { width: 1024, height: 768 }, reducedMotion: "reduce" });
  await persian.goto(`${baseUrl}/fa/canvas?view=ecosystem`, { waitUntil: "networkidle" });
  assert.equal(await persian.locator(".opportunity-cluster").count(), 9);
  assert.equal(await persian.locator(".opportunity-value").count(), 66);
  assert.equal(await persian.locator("main").getAttribute("dir"), "rtl");

  assert.deepEqual(errors, []);
  await browser.close();
  console.log("Opportunity cluster QA passed: 66 always-visible values, stable layout, cross-field highlight, URL state, and responsive layouts.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
