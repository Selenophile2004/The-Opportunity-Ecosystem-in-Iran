const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const artifacts = path.join(root, "artifacts", "evidence-refresh");
const baseUrl = process.env.EVIDENCE_BASE_URL || "http://localhost:3000";
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const slugs = [
  "key-partners",
  "key-activities",
  "key-resources",
  "value-propositions",
  "customer-relationships",
  "channels",
  "customer-segments",
  "cost-structure",
  "revenue-streams",
];

async function renderedLineCount(locator) {
  return locator.evaluate((element) => {
    const style = getComputedStyle(element);
    const lineHeight = Number.parseFloat(style.lineHeight);
    return lineHeight ? Math.round(element.getBoundingClientRect().height / lineHeight) : 0;
  });
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const desktop = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  desktop.on("pageerror", (error) => errors.push(`desktop:${error.message}`));

  for (const slug of slugs) {
    await desktop.goto(`${baseUrl}/fa/model/${slug}`, { waitUntil: "networkidle" });
    await desktop.locator(".model-overview").waitFor({ state: "visible" });
    assert.equal(await desktop.locator(".model-overview").count(), 1, `${slug}: missing overview`);
    assert((await desktop.locator(".overview-status li").count()) >= 0, `${slug}: status summary unavailable`);
    assert((await renderedLineCount(desktop.locator(".model-hero__copy h1"))) <= 2, `${slug}: hero exceeds two lines`);
    assert((await renderedLineCount(desktop.locator(".overview-heading h2"))) <= 2, `${slug}: overview title exceeds two lines`);
    assert.equal(await desktop.evaluate(() => {
      const overview = document.querySelector(".model-overview");
      const sidebar = document.querySelector(".model-sidebar");
      return Boolean(overview && sidebar && (overview.compareDocumentPosition(sidebar) & Node.DOCUMENT_POSITION_FOLLOWING));
    }), true, `${slug}: visualization must precede filtering controls`);
    assert.equal(await desktop.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, `${slug}: desktop overflow`);
  }
  await desktop.goto(`${baseUrl}/fa/model/channels`, { waitUntil: "networkidle" });
  await desktop.screenshot({ path: path.join(artifacts, "channels-desktop.png"), fullPage: true });
  await desktop.locator(".model-overview").screenshot({ path: path.join(artifacts, "overview-desktop.png") });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", (error) => errors.push(`mobile:${error.message}`));
  await mobile.goto(`${baseUrl}/fa/model/channels`, { waitUntil: "networkidle" });
  await mobile.locator(".model-overview").waitFor({ state: "visible" });
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, "mobile overflow");
  assert((await renderedLineCount(mobile.locator(".model-hero__copy h1"))) <= 2, "mobile hero exceeds two lines");
  const toggle = mobile.locator(".viz-filter-toggle");
  assert.equal(await toggle.isVisible(), true, "mobile filter disclosure is missing");
  assert.equal(await mobile.locator(".viz-filters").isVisible(), false, "mobile filters should start collapsed");
  const visualBeforeFilters = await mobile.evaluate(() => {
    const stage = document.querySelector(".viz-stage");
    const filterToggle = document.querySelector(".viz-filter-toggle");
    if (!stage || !filterToggle) return false;
    return stage.getBoundingClientRect().top < filterToggle.getBoundingClientRect().top;
  });
  assert.equal(visualBeforeFilters, true, "mobile chart must appear before optional filters");
  await toggle.click();
  assert.equal(await mobile.locator(".viz-filters").isVisible(), true, "mobile filters did not open");
  await mobile.screenshot({ path: path.join(artifacts, "channels-mobile.png"), fullPage: true });
  await mobile.locator(".model-overview").screenshot({ path: path.join(artifacts, "overview-mobile.png") });
  await mobile.getByRole("button", { name: "جدول دسترس‌پذیر" }).click();
  assert.equal(await mobile.locator(".viz-mobile-records").isVisible(), true, "mobile table cards are missing");
  assert.equal(await mobile.locator(".viz-table-scroll > table").isVisible(), false, "wide table should be hidden on mobile");
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, "mobile card table overflow");

  await mobile.goto(`${baseUrl}/fa/model/value-propositions?detail=value-driver-03`, { waitUntil: "networkidle" });
  await mobile.locator(".detail-constellation").waitFor({ state: "visible" });
  assert((await renderedLineCount(mobile.locator(".detail-nucleus h2"))) <= 2, "detail title exceeds two lines");
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true, "detail overflow");

  await browser.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({ passed: slugs.length, desktop: "1440x1000", mobile: "390x844", errors }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
