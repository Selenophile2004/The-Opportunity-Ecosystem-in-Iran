"""Regression QA for the final geographic landing experience."""

import json
import os
import re
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "phase2"
BASE_URL = os.environ.get("PHASE2_BASE_URL", "http://127.0.0.1:3000")
CHROME = os.environ.get("CHROME_PATH", r"C:\Program Files\Google\Chrome\Application\chrome.exe")


def attach_console(page, errors: list[str]) -> None:
    page.on("console", lambda message: errors.append(f"console:{message.type}:{message.text}") if message.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(f"pageerror:{error}"))


def click_globe_center(page) -> None:
    canvas = page.locator(".iran-globe canvas")
    box = canvas.bounding_box()
    assert box
    canvas.click(position={"x": box["width"] / 2, "y": box["height"] / 2})


def run() -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    checks: list[str] = []
    errors: list[str] = []
    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME)
        desktop = browser.new_page(viewport={"width": 1440, "height": 1000})
        attach_console(desktop, errors)
        desktop.goto(f"{BASE_URL}/fa/canvas", wait_until="networkidle")
        desktop.locator(".signal-intro").wait_for(state="detached")
        assert desktop.locator('main[lang="fa-IR"][dir="rtl"]').count() == 1
        expect(desktop.locator(".iran-globe canvas")).to_be_visible()
        expect(desktop.locator(".orbit-model")).to_have_count(0)
        expect(desktop.locator(".iran-beacon")).to_have_count(0)
        canvas_box = desktop.locator(".iran-globe canvas").bounding_box()
        assert canvas_box
        start_x = canvas_box["x"] + canvas_box["width"] * 0.47
        start_y = canvas_box["y"] + canvas_box["height"] * 0.45
        desktop.mouse.move(start_x, start_y)
        desktop.mouse.down()
        desktop.mouse.move(start_x + 150, start_y - 34, steps=8)
        expect(desktop.locator(".iran-globe")).to_have_class(re.compile(r"is-dragging"))
        desktop.wait_for_timeout(90)
        desktop.screenshot(path=str(ARTIFACTS / "globe-drag-fa.png"), full_page=True)
        desktop.mouse.up()
        expect(desktop.locator(".iran-globe")).to_have_class(re.compile(r"is-kinetic"))
        checks.append("Globe supports direct drag rotation, kinetic release and a velocity-reactive wake")

        desktop.reload(wait_until="networkidle")
        click_globe_center(desktop)
        expect(desktop.locator(".orbit-model")).to_have_count(9)
        assert "view=ecosystem" in desktop.url
        checks.append("Persian globe reveals all nine orbiting models after Iran is selected")

        desktop.get_by_label("پرسونا").select_option("persona-01")
        assert desktop.locator(".orbit-model.is-dimmed").count() > 0
        assert "persona=persona-01" in desktop.url
        desktop.get_by_role("searchbox", name="پیدا کردن مدل").fill("کانال")
        expect(desktop.locator(".orbit-model.is-matched")).to_have_count(1)
        checks.append("Real persona and search filters highlight/dim orbits and persist in the URL")
        desktop.wait_for_timeout(1200)
        desktop.screenshot(path=str(ARTIFACTS / "desktop-fa.png"), full_page=True)

        desktop.get_by_role("link", name="English").click()
        desktop.wait_for_url("**/en/canvas**")
        desktop.wait_for_load_state("networkidle")
        assert desktop.locator('main[lang="en"][dir="ltr"]').count() == 1
        expect(desktop.locator(".orbit-model")).to_have_count(9)
        desktop.screenshot(path=str(ARTIFACTS / "desktop-en.png"), full_page=True)
        checks.append("Locale switch preserves ecosystem state and loads the paired English LTR view")

        desktop.get_by_role("button", name="Enter model: Channels").click()
        desktop.wait_for_url("**/en/model/channels")
        expect(desktop.get_by_role("heading", name="Channels", exact=True)).to_be_visible()
        checks.append("An orbit transition reaches its source-backed model route")

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        attach_console(mobile, errors)
        mobile.goto(f"{BASE_URL}/fa/canvas", wait_until="networkidle")
        mobile.locator(".signal-intro").wait_for(state="detached")
        click_globe_center(mobile)
        expect(mobile.locator(".orbit-model")).to_have_count(9)
        assert mobile.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        mobile.wait_for_timeout(1200)
        mobile.screenshot(path=str(ARTIFACTS / "mobile-fa.png"), full_page=True)
        checks.append("Mobile keeps the nine-model hierarchy inside the viewport")

        reduced = browser.new_context(viewport={"width": 1280, "height": 800}, reduced_motion="reduce").new_page()
        attach_console(reduced, errors)
        reduced.goto(f"{BASE_URL}/fa/canvas", wait_until="networkidle")
        reduced.locator(".signal-intro").wait_for(state="detached")
        click_globe_center(reduced)
        reduced.get_by_role("button", name="ورود به مدل: کانال‌ها").click()
        reduced.wait_for_url("**/fa/model/channels")
        checks.append("Reduced-motion route transition completes")
        browser.close()

    result = {"checks": checks, "errors": errors}
    (ARTIFACTS / "qa-results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit("Browser diagnostics recorded errors")


if __name__ == "__main__":
    run()
