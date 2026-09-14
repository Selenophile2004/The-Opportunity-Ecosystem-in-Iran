const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("C:\\Users\\User\\.cache\\codex-runtimes\\codex-primary-runtime\\dependencies\\node\\node_modules\\playwright");

const root = path.resolve(__dirname, "..");
const artifacts = path.join(root, "artifacts", "qa-no-scroll-bmc");
const baseUrl = process.env.BMC_BASE_URL || "http://127.0.0.1:3240";
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function assertNoScroll(page, label) {
  const metrics = await page.evaluate(() => ({
    viewport: { width: window.innerWidth, height: window.innerHeight },
    html: {
      clientWidth: document.documentElement.clientWidth,
      clientHeight: document.documentElement.clientHeight,
      scrollWidth: document.documentElement.scrollWidth,
      scrollHeight: document.documentElement.scrollHeight,
    },
    body: {
      clientWidth: document.body.clientWidth,
      clientHeight: document.body.clientHeight,
      scrollWidth: document.body.scrollWidth,
      scrollHeight: document.body.scrollHeight,
    },
  }));
  for (const surface of ["html", "body"]) {
    assert.ok(metrics[surface].scrollWidth <= metrics[surface].clientWidth + 1, `${label}: horizontal scroll on ${surface}: ${JSON.stringify(metrics)}`);
    assert.ok(metrics[surface].scrollHeight <= metrics[surface].clientHeight + 1, `${label}: vertical scroll on ${surface}: ${JSON.stringify(metrics)}`);
  }
}

async function assertValuesInsideViewport(page, label) {
  const failures = await page.locator(".opportunity-value:visible").evaluateAll((nodes) => nodes.flatMap((node) => {
    const rect = node.getBoundingClientRect();
    const cluster = node.closest(".opportunity-cluster")?.getBoundingClientRect();
    const insideViewport = rect.top >= -1 && rect.left >= -1 && rect.right <= window.innerWidth + 1 && rect.bottom <= window.innerHeight + 1;
    const insideCluster = cluster && rect.top >= cluster.top - 1 && rect.left >= cluster.left - 1 && rect.right <= cluster.right + 1 && rect.bottom <= cluster.bottom + 1;
    return insideViewport && insideCluster ? [] : [{ text: node.textContent, rect: rect.toJSON(), cluster: cluster?.toJSON() }];
  }));
  assert.deepEqual(failures, [], `${label}: clipped value labels`);
}

async function openView(browser, label, width, height, locale = "en") {
  const page = await browser.newPage({ viewport: { width, height }, reducedMotion: "reduce" });
  const errors = [];
  page.on("pageerror", (error) => errors.push(`page: ${error.message}`));
  page.on("console", (message) => {
    const value = message.text();
    const isDevHmrHandshake = value.includes("/_next/hmr") && value.includes("WebSocket connection");
    if (message.type() === "error" && !isDevHmrHandshake) errors.push(`console: ${value}`);
  });
  await page.goto(`${baseUrl}/${locale}/canvas?view=ecosystem`, { waitUntil: "networkidle" });
  await page.locator(".opportunity-cluster-board").waitFor({ state: "visible" });
  assert.equal(await page.locator(".opportunity-cluster").count(), 9, `${label}: missing canvas fields`);
  await assertNoScroll(page, label);
  await page.screenshot({ path: path.join(artifacts, `${label}.png`), fullPage: false });
  assert.deepEqual(errors, [], `${label}: browser errors`);
  return page;
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });

  const desktop = await openView(browser, "desktop-1920x1080", 1920, 1080);
  assert.equal(await desktop.locator(".opportunity-value:visible").count(), 80, "desktop: all 80 proposal-backed elements must be visible");
  assert.equal(await desktop.locator(".header-command select").count(), 1, "desktop: persona filter should be removed from the header");
  assert.equal(await desktop.locator(".header-command .header-side-filter").count(), 1, "desktop: side filters should sit beside search");
  assert.equal(await desktop.locator(".opportunity-cluster-board .header-side-filter").count(), 0, "desktop: side filters should not remain inside the canvas");
  await assertValuesInsideViewport(desktop, "desktop");
  const englishPositions = await desktop.locator(".opportunity-cluster").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  await desktop.getByRole("button", { name: "Value side", exact: true }).click();
  assert.equal(await desktop.locator(".opportunity-cluster.is-side-active").count(), 5, "desktop: value-side filter should emphasize five blocks");
  assert.equal(await desktop.locator(".opportunity-cluster.is-side-dimmed").count(), 4, "desktop: value-side filter should dim four efficiency blocks");
  await desktop.screenshot({ path: path.join(artifacts, "desktop-value-side.png"), fullPage: false });
  await desktop.getByRole("button", { name: "Value side", exact: true }).click();
  await desktop.getByRole("button", { name: "Qualified Foreign Business", exact: true }).click();
  await desktop.waitForTimeout(300);
  assert.ok(await desktop.locator(".canvas-relations path.is-active").count() >= 2, "desktop: selected value must illuminate the business flow");
  assert.ok(await desktop.locator(".opportunity-value.is-related:visible").count() > 1, "desktop: related values were not highlighted");
  await assertNoScroll(desktop, "desktop-selected");
  await desktop.screenshot({ path: path.join(artifacts, "desktop-selected.png"), fullPage: false });
  await desktop.close();

  const persian = await openView(browser, "desktop-fa-fixed-layout", 1920, 1080, "fa");
  const persianPositions = await persian.locator(".opportunity-cluster").evaluateAll((nodes) => nodes.map((node) => {
    const rect = node.getBoundingClientRect();
    return { left: Math.round(rect.left), top: Math.round(rect.top), width: Math.round(rect.width), height: Math.round(rect.height) };
  }));
  assert.deepEqual(persianPositions, englishPositions, "desktop-fa: RTL text must not mirror or move the canvas blocks");
  await persian.getByRole("button", { name: "بخش کارایی", exact: true }).click();
  assert.equal(await persian.locator(".opportunity-cluster.is-side-active").count(), 5, "desktop-fa: efficiency-side filter should emphasize four efficiency blocks plus value propositions");
  assert.equal(await persian.locator(".opportunity-cluster.is-side-dimmed").count(), 4, "desktop-fa: efficiency-side filter should dim four value-only blocks");
  assert.equal(await persian.locator(".opportunity-cluster--value-propositions.is-side-active").count(), 1, "desktop-fa: value propositions must stay active in the efficiency side");
  await persian.screenshot({ path: path.join(artifacts, "desktop-fa-efficiency-side.png"), fullPage: false });
  await persian.close();

  for (const [label, width, height] of [["laptop-1366x768", 1366, 768], ["tablet-1024x768", 1024, 768], ["short-1280x600", 1280, 600]]) {
    const page = await openView(browser, label, width, height);
    assert.equal(await page.locator(".opportunity-value:visible").count(), 80, `${label}: all values should remain visible`);
    await assertValuesInsideViewport(page, label);
    await page.close();
  }

  const mobile = await openView(browser, "mobile-390x844", 390, 844);
  assert.equal(await mobile.locator(".opportunity-value:visible").count(), 0, "mobile: overview should prioritize topology");
  await mobile.locator(".header-command-toggle").click();
  assert.equal(await mobile.locator(".header-command .header-side-filter:visible").count(), 1, "mobile: side filters should be available in the header filter panel");
  assert.equal(await mobile.locator(".header-command select:visible").count(), 1, "mobile: persona filter should remain removed");
  await mobile.locator(".header-command-toggle").click();
  await mobile.getByRole("button", { name: "Enter field: Customer Segments" }).click();
  await mobile.waitForTimeout(220);
  assert.equal(await mobile.locator(".opportunity-cluster.is-compact-focus").count(), 1, "mobile: field focus did not open");
  assert.equal(await mobile.locator(".opportunity-cluster.is-compact-focus .opportunity-value:visible").count(), 6, "mobile: focused values missing");
  await assertValuesInsideViewport(mobile, "mobile-focus");
  await assertNoScroll(mobile, "mobile-focus");
  await mobile.screenshot({ path: path.join(artifacts, "mobile-focus.png"), fullPage: false });
  await mobile.getByRole("button", { name: "Qualified Foreign Business", exact: true }).click();
  await mobile.waitForTimeout(220);
  assert.equal(await mobile.locator(".opportunity-cluster.is-compact-focus").count(), 0, "mobile: value selection should return to topology");
  assert.ok(await mobile.locator(".opportunity-cluster__relation-count:visible").count() > 1, "mobile: linked fields not summarized");
  await assertNoScroll(mobile, "mobile-selected");
  await mobile.screenshot({ path: path.join(artifacts, "mobile-selected.png"), fullPage: false });
  await mobile.close();

  const landscape = await openView(browser, "mobile-landscape-844x390", 844, 390);
  await landscape.getByRole("button", { name: "Enter field: Revenue Streams" }).click();
  await landscape.waitForTimeout(220);
  assert.equal(await landscape.locator(".opportunity-cluster.is-compact-focus .opportunity-value:visible").count(), 14, "landscape: focused revenue values missing");
  await assertValuesInsideViewport(landscape, "mobile-landscape-focus");
  await assertNoScroll(landscape, "mobile-landscape-focus");
  await landscape.screenshot({ path: path.join(artifacts, "mobile-landscape-focus.png"), fullPage: false });
  await landscape.close();

  await browser.close();
  console.log("BMC QA passed for side filters, fixed Persian layout, desktop, laptop, tablet, short viewport, mobile portrait, and mobile landscape.");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
