"""Regression QA for model pages and the centered nested-popup interaction."""

import json
import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "phase3"
BASE_URL = os.environ.get("PHASE3_BASE_URL", "http://127.0.0.1:3000")
CHROME = os.environ.get("CHROME_PATH", r"C:\Program Files\Google\Chrome\Application\chrome.exe")


def attach_diagnostics(page, errors: list[str]) -> None:
    page.on("console", lambda message: errors.append(f"console:{message.type}:{message.text}") if message.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(f"pageerror:{error}"))


def run() -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    checks: list[str] = []
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME)
        page = browser.new_page(viewport={"width": 1440, "height": 1000})
        attach_diagnostics(page, errors)
        page.goto(f"{BASE_URL}/fa/model/channels", wait_until="networkidle")
        expect(page.get_by_role("heading", name="کانال‌ها", exact=True)).to_be_visible()
        expect(page.locator(".evidence-row")).to_have_count(23)
        checks.append("Persian model page renders 23 source-backed channel records")
        page.screenshot(path=str(ARTIFACTS / "model-channels-fa.png"), full_page=True)

        search = page.get_by_role("searchbox", name="جست‌وجو در این مدل")
        search.fill("مالکیت")
        assert 0 < page.locator(".evidence-row").count() < 23
        assert "q=" in page.url
        page.get_by_role("button", name="پاک‌کردن فیلترها").click()
        page.locator(".model-personas button").nth(1).click()
        assert 0 < page.locator(".evidence-row").count() < 23
        page.get_by_role("button", name="پاک‌کردن فیلترها").click()
        checks.append("Search and persona filters narrow real evidence and synchronize URL state")

        origin = page.locator('[data-item-id="slide-104"]').last
        origin.scroll_into_view_if_needed()
        origin.click()
        expect(page.locator(".detail-constellation")).to_be_visible()
        expect(page.get_by_role("dialog")).to_have_count(1)
        expect(page.get_by_role("dialog")).to_be_focused()
        page.get_by_role("button", name="رد منبع").click()
        expect(page.get_by_role("dialog")).to_have_count(2)
        expect(page.locator(".insight-popup dd", has_text="20260906-Simorgh-SA-V07.pptx")).to_be_visible()
        page.wait_for_timeout(450)
        page.screenshot(path=str(ARTIFACTS / "modal-channels-fa.png"), full_page=False)
        checks.append("Centered modal opens a second animated source insight popup")

        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog")).to_have_count(1)
        page.keyboard.press("Escape")
        expect(page.get_by_role("dialog")).to_have_count(0)
        assert origin.evaluate("element => element === document.activeElement")
        checks.append("Escape closes nested layers in order and focus returns to the originating row")

        page.goto(f"{BASE_URL}/fa/model/channels?detail=slide-104", wait_until="networkidle")
        expect(page.locator(".detail-constellation")).to_be_visible()
        page.locator(".detail-backdrop").dispatch_event("mousedown")
        expect(page.get_by_role("dialog")).to_have_count(0)
        checks.append("Direct modal deep links hydrate and close safely")

        page.goto(f"{BASE_URL}/en/model/channels?detail=slide-104", wait_until="networkidle")
        expect(page.locator(".detail-constellation")).to_be_visible()
        expect(page.get_by_text("The English body is awaiting translation review. Source provenance remains available.")).to_be_visible()
        assert page.locator(".detail-panel").evaluate("element => getComputedStyle(element.parentElement).justifyContent") == "center"
        checks.append("English deep link is LTR, centered and exposes honest translation state")

        page.goto(f"{BASE_URL}/fa/model/cost-structure", wait_until="networkidle")
        expect(page.get_by_role("heading", name="جزئیات این بلوک در منبع ارائه نشده است")).to_be_visible()
        expect(page.locator(".evidence-row")).to_have_count(0)
        checks.append("Not-provided content renders an explicit source-backed empty state")

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        attach_diagnostics(mobile, errors)
        mobile.goto(f"{BASE_URL}/fa/model/channels", wait_until="networkidle")
        mobile.locator(".evidence-row").first.click()
        expect(mobile.locator(".detail-constellation")).to_be_visible()
        box = mobile.locator(".detail-panel").bounding_box()
        assert box and box["width"] <= 372 and box["x"] >= 8
        mobile.locator(".detail-insight-point").last.click()
        expect(mobile.locator(".insight-popup")).to_be_visible()
        mobile.screenshot(path=str(ARTIFACTS / "modal-mobile-fa.png"), full_page=False)
        checks.append("Mobile contains both popup levels inside the viewport")
        browser.close()

    result = {"checks": checks, "errors": errors}
    (ARTIFACTS / "qa-results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit("Browser diagnostics recorded errors")


if __name__ == "__main__":
    run()
