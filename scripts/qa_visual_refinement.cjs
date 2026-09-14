const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const artifacts = path.join(root, "artifacts", "visual-refinement");
const baseUrl = process.env.REFINEMENT_BASE_URL || "http://localhost:3000";
const chromePath = process.env.CHROME_PATH || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function clickGlobeCenter(page) {
  const canvas = page.locator(".iran-globe canvas");
  const box = await canvas.boundingBox();
  assert(box);
  await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
}

(async () => {
  fs.mkdirSync(artifacts, { recursive: true });
  const browser = await chromium.launch({ headless: true, executablePath: chromePath });
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on("pageerror", (error) => errors.push(`pageerror:${error.message}`));

  await page.goto(`${baseUrl}/fa/canvas?qa=refinement`, { waitUntil: "networkidle" });
  const introStartedAt = Date.now();
  const signalIntro = page.locator(".signal-intro");
  await page.locator(".signal-intro--boot").waitFor({ state: "visible" });
  assert.equal(await page.locator(".signal-intro__logo img").count(), 3);
  assert.equal(await page.locator(".signal-intro__glitch-field > i").count(), 4);
  assert.equal(await page.locator(".signal-intro__noise").count(), 0, "TV-static texture must not be rendered");
  const introBackground = await signalIntro.evaluate((element) => getComputedStyle(element).backgroundColor);
  assert.equal(introBackground, "rgb(2, 6, 17)");
  await page.waitForTimeout(900);
  await page.screenshot({ path: path.join(artifacts, "signal-logo-boot.png"), fullPage: true });
  await page.locator(".signal-intro--reveal").waitFor({ state: "visible" });
  await page.waitForTimeout(760);
  await page.screenshot({ path: path.join(artifacts, "signal-globe-reveal.png"), fullPage: true });
  await signalIntro.waitFor({ state: "detached" });
  const introDurationMs = Date.now() - introStartedAt;
  assert(introDurationMs >= 3000 && introDurationMs < 5200, `Unexpected intro duration: ${introDurationMs}ms`);
  await page.locator(".iran-globe canvas").waitFor({ state: "visible" });
  assert.equal(await page.locator(".world-copy h1").count(), 1);
  assert.equal(await page.locator(".world-copy > :not(h1):not(.sr-only)").count(), 0);
  assert.equal(await page.locator(".world-description, .world-instruction").count(), 0);
  const pageBackground = await page.locator("main.canvas-page").evaluate((element) => getComputedStyle(element).backgroundColor);
  assert.equal(pageBackground, "rgb(2, 6, 17)");
  await page.screenshot({ path: path.join(artifacts, "globe-dark-fa.png"), fullPage: true });
  await page.reload({ waitUntil: "networkidle" });
  await page.waitForTimeout(100);
  assert.equal(await page.locator(".signal-intro").count(), 0, "Signal intro should play once per tab session");

  await clickGlobeCenter(page);
  await page.locator(".orbit-model").first().waitFor({ state: "visible" });
  await page.waitForTimeout(850);
  const destination = page.getByRole("button", { name: "ورود به مدل: کانال‌ها" });
  const navigationStartedAt = Date.now();
  await destination.click();
  const portal = page.locator(".route-transition-card--orbital");
  await portal.waitFor({ state: "visible" });
  await page.locator(".orbit-model.is-launching").waitFor({ state: "visible" });
  assert.equal(await page.locator(".route-portal__fragments > i").count(), 12);
  const launchRingDuration = await page.locator(".orbit-model.is-launching").evaluate((element) => getComputedStyle(element, "::after").animationDuration);
  assert.equal(launchRingDuration, "0.19s");
  const viewportCenter = { x: 720, y: 500 };
  const launchBox = await portal.boundingBox();
  assert(launchBox);
  const launchDistance = Math.hypot(launchBox.x + launchBox.width / 2 - viewportCenter.x, launchBox.y + launchBox.height / 2 - viewportCenter.y);
  await page.waitForTimeout(570);
  const portalBox = await portal.boundingBox();
  assert(portalBox && portalBox.width < 230 && portalBox.height < 230, "Portal must remain compact");
  const centeredDistance = Math.hypot(portalBox.x + portalBox.width / 2 - viewportCenter.x, portalBox.y + portalBox.height / 2 - viewportCenter.y);
  assert(centeredDistance < 8, `Portal did not reach viewport center: ${centeredDistance}px`);
  assert(centeredDistance < launchDistance, "Portal must move toward the center before bursting");
  const portalBackground = await portal.evaluate((element) => getComputedStyle(element).backgroundColor);
  assert.notEqual(portalBackground, "rgb(255, 212, 0)");
  await page.screenshot({ path: path.join(artifacts, "orbital-route-portal.png"), fullPage: true });
  await page.waitForURL("**/fa/model/channels");
  const navigationDurationMs = Date.now() - navigationStartedAt;
  assert(navigationDurationMs < 2000, `Opportunity navigation took ${navigationDurationMs}ms`);
  await page.waitForLoadState("networkidle");

  const heroSize = Number.parseFloat(await page.locator(".model-hero__copy h1").evaluate((element) => getComputedStyle(element).fontSize));
  assert(heroSize <= 72, `Model heading is still oversized: ${heroSize}px`);

  await page.goto(`${baseUrl}/fa/model/value-propositions?detail=value-driver-03`, { waitUntil: "networkidle" });
  await page.locator(".detail-constellation").waitFor({ state: "visible" });
  await page.waitForTimeout(700);
  const connectorDeltas = await page.evaluate(() => {
    const svg = document.querySelector(".detail-orbit-lines");
    if (!svg) return [];
    const svgBox = svg.getBoundingClientRect();
    const paths = [...svg.querySelectorAll("path")];
    const points = [...document.querySelectorAll(".detail-insight-point")];
    return paths.map((line, index) => {
      const numbers = (line.getAttribute("d") || "").match(/-?\d+(?:\.\d+)?/g)?.map(Number) || [];
      const endX = numbers.at(-2) || 0;
      const endY = numbers.at(-1) || 0;
      const pointBox = points[index].getBoundingClientRect();
      const renderedX = svgBox.left + svgBox.width * endX / 100;
      const renderedY = svgBox.top + svgBox.height * endY / 100;
      return Math.hypot(renderedX - (pointBox.left + pointBox.width / 2), renderedY - (pointBox.top + pointBox.height / 2));
    });
  });
  assert(connectorDeltas.length > 0);
  assert(Math.max(...connectorDeltas) <= 2.5, `Connector endpoint delta: ${Math.max(...connectorDeltas)}px`);
  const nucleusSize = Number.parseFloat(await page.locator(".detail-nucleus h2").evaluate((element) => getComputedStyle(element).fontSize));
  assert(nucleusSize <= 32, `Detail title is still oversized: ${nucleusSize}px`);
  await page.screenshot({ path: path.join(artifacts, "detail-connected-fa.png"), fullPage: false });

  const mobile = await browser.newPage({ viewport: { width: 390, height: 844 } });
  mobile.on("pageerror", (error) => errors.push(`mobile-pageerror:${error.message}`));
  await mobile.goto(`${baseUrl}/fa/model/value-propositions?detail=value-driver-03`, { waitUntil: "networkidle" });
  await mobile.locator(".detail-constellation").waitFor({ state: "visible" });
  assert.equal(await mobile.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), true);
  await mobile.screenshot({ path: path.join(artifacts, "detail-mobile-fa.png"), fullPage: false });
  await mobile.close();

  const reducedContext = await browser.newContext({ viewport: { width: 1280, height: 850 }, reducedMotion: "reduce" });
  const reduced = await reducedContext.newPage();
  const reducedIntroStartedAt = Date.now();
  await reduced.goto(`${baseUrl}/fa/canvas?qa=reduced-intro`, { waitUntil: "networkidle" });
  await reduced.locator(".signal-intro").waitFor({ state: "detached" });
  assert(Date.now() - reducedIntroStartedAt < 1400, "Reduced-motion intro should be brief");
  await reduced.goto(`${baseUrl}/fa/canvas?view=ecosystem`, { waitUntil: "networkidle" });
  await reduced.getByRole("button", { name: "ورود به مدل: کانال‌ها" }).click();
  await reduced.waitForURL("**/fa/model/channels");
  await reducedContext.close();

  await browser.close();
  assert.deepEqual(errors, []);
  console.log(JSON.stringify({
    passed: ["three-second navy glitch", "logo-to-header reveal", "one-time session intro", "smooth globe cartography", "field-to-center motion", "fast launch ring", "twelve-part centered burst", "compact non-yellow transition", "radial model reveal", "connected detail lines", "mobile layout", "reduced motion"],
    introDurationMs,
    navigationDurationMs,
    launchRingDuration,
    connectorMaxDeltaPx: Math.max(...connectorDeltas),
    heroHeadingPx: heroSize,
    detailHeadingPx: nucleusSize,
  }, null, 2));
})().catch((error) => {
  console.error(error);
  process.exit(1);
});
