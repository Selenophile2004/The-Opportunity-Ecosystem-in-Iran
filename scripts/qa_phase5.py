"""Production acceptance test for the final interactive experience."""

from __future__ import annotations

import json
import os
import re
from pathlib import Path

from playwright.sync_api import Page, expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "phase5"
BASE_URL = os.environ.get("PHASE5_BASE_URL", "http://127.0.0.1:3000")
CHROME = os.environ.get("CHROME_PATH", r"C:\Program Files\Google\Chrome\Application\chrome.exe")
MODEL_SLUGS = [
    "key-partners",
    "key-activities",
    "key-resources",
    "value-propositions",
    "customer-relationships",
    "channels",
    "customer-segments",
    "cost-structure",
    "revenue-streams",
]


def attach_diagnostics(page: Page, errors: list[str]) -> None:
    page.on(
        "console",
        lambda message: errors.append(f"console:{message.type}:{message.text}")
        if message.type == "error"
        else None,
    )
    page.on("pageerror", lambda error: errors.append(f"pageerror:{error}"))
    page.on(
        "response",
        lambda response: errors.append(f"http:{response.status}:{response.url}")
        if response.status >= 500
        else None,
    )


def assert_named_controls(page: Page) -> int:
    unnamed = page.locator("button, a[href], input, select").evaluate_all(
        """elements => elements.filter(element => {
          const style = getComputedStyle(element);
          if (style.display === 'none' || style.visibility === 'hidden') return false;
          const labelled = element.getAttribute('aria-label') ||
            element.getAttribute('aria-labelledby') ||
            (element.labels && Array.from(element.labels).map(label => label.innerText).join(' ')) ||
            element.innerText || element.getAttribute('title') || element.getAttribute('alt');
          return !String(labelled || '').trim();
        }).length"""
    )
    assert unnamed == 0, f"{unnamed} visible interactive controls have no accessible name"
    return unnamed


def click_globe_center(page: Page) -> None:
    canvas = page.locator(".iran-globe canvas")
    box = canvas.bounding_box()
    assert box
    canvas.click(position={"x": box["width"] / 2, "y": box["height"] / 2})


def run() -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    checks: list[str] = []
    errors: list[str] = []
    metrics: dict[str, object] = {}

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME)

        desktop = browser.new_page(viewport={"width": 1440, "height": 1000}, accept_downloads=True)
        attach_diagnostics(desktop, errors)
        desktop.goto(f"{BASE_URL}/", wait_until="networkidle")
        desktop.locator(".signal-intro").wait_for(state="detached")
        assert "/fa/canvas" in desktop.url
        expect(desktop.get_by_role("heading", name="اکوسیستم فرصت ایران")).to_be_visible()
        expect(desktop.get_by_role("button", name="کره تعاملی؛ بکشید تا بچرخد و خود ایران را برای ورود انتخاب کنید")).to_be_visible()
        expect(desktop.locator(".iran-globe canvas")).to_be_visible()
        expect(desktop.locator(".iran-beacon")).to_have_count(0)
        checks.append("Root redirects to the Persian RTL globe; Iran is a keyboard-operable target")
        desktop.screenshot(path=str(ARTIFACTS / "desktop-globe-fa.png"), full_page=True)

        click_globe_center(desktop)
        expect(desktop.locator(".orbit-model")).to_have_count(9)
        expect(desktop.get_by_role("heading", name="۹ میدان فرصت، یک اکوسیستم")).to_be_visible()
        assert "view=ecosystem" in desktop.url
        checks.append("Selecting Iran reveals all nine animated opportunity models and persists view state")
        desktop.wait_for_timeout(1300)
        desktop.screenshot(path=str(ARTIFACTS / "desktop-ecosystem-fa.png"), full_page=True)

        persona = desktop.get_by_label("پرسونا")
        persona.select_option("persona-01")
        expect(desktop.locator(".orbit-model.is-dimmed")).not_to_have_count(0)
        assert "persona=persona-01" in desktop.url
        desktop.get_by_role("searchbox", name="پیدا کردن مدل").fill("کانال")
        expect(desktop.locator(".orbit-model.is-matched")).to_have_count(1)
        assert "q=" in desktop.url
        desktop.get_by_role("button", name=re.compile(r"^بازنشانی")).click()
        checks.append("Persona and search filters highlight/dim real models and synchronize URL state")

        # Every business-model route resolves to one and only one active model.
        for slug in MODEL_SLUGS:
            desktop.goto(f"{BASE_URL}/fa/model/{slug}", wait_until="domcontentloaded")
            expect(desktop.locator("main.model-page h1")).to_have_count(1)
            expect(desktop.locator('.model-switcher a[aria-current="page"]')).to_have_count(1)
        checks.append("All nine model routes resolve with an active navigation state")

        desktop.goto(f"{BASE_URL}/fa/model/channels", wait_until="networkidle")
        origin = desktop.locator('[data-item-id="slide-104"]').last
        origin.scroll_into_view_if_needed()
        origin.click()
        expect(desktop.locator(".detail-constellation")).to_be_visible()
        expect(desktop.get_by_role("dialog")).to_have_count(1)
        assert "detail=slide-104" in desktop.url
        expect(desktop.get_by_role("dialog")).to_be_focused()

        desktop.get_by_role("button", name="رد منبع").click()
        expect(desktop.get_by_role("dialog")).to_have_count(2)
        expect(desktop.locator(".insight-popup dd", has_text="20260906-Simorgh-SA-V07.pptx")).to_be_visible()
        popup_delta = desktop.locator(".insight-popup").evaluate(
            "element => Math.round(Math.abs((element.getBoundingClientRect().left + element.getBoundingClientRect().width / 2) - innerWidth / 2))"
        )
        assert popup_delta <= 2
        desktop.wait_for_timeout(450)
        desktop.screenshot(path=str(ARTIFACTS / "desktop-nested-popup-fa.png"), full_page=False)
        desktop.keyboard.press("Escape")
        expect(desktop.get_by_role("dialog")).to_have_count(1)
        assert "detail=slide-104" in desktop.url
        desktop.keyboard.press("Escape")
        expect(desktop.get_by_role("dialog")).to_have_count(0)
        assert "detail=" not in desktop.url
        assert origin.evaluate("element => element === document.activeElement")
        checks.append("Centered detail and nested insight popups preserve source, focus, Escape order and deep links")

        desktop.goto(f"{BASE_URL}/fa/model/channels?detail=slide-104", wait_until="networkidle")
        expect(desktop.locator(".detail-constellation")).to_be_visible()
        desktop.locator(".detail-backdrop").dispatch_event("mousedown")
        expect(desktop.get_by_role("dialog")).to_have_count(0)
        checks.append("A direct detail URL hydrates safely and the backdrop closes it")

        desktop.goto(f"{BASE_URL}/fa/model/channels", wait_until="networkidle")
        desktop.wait_for_selector(".viz-chart canvas", state="attached")
        desktop.locator(".viz-point-picker select").select_option("channel-priority-07")
        expect(desktop.locator(".viz-breadcrumb")).to_contain_text("ابزار خودارزیابی دیجیتال")
        desktop.get_by_role("button", name="بازنشانی نما").click()
        desktop.locator(".viz-segmented").get_by_role("button", name="جدول دسترس‌پذیر").click()
        expect(desktop.locator(".viz-table-scroll")).to_be_visible()
        checks.append("Source-backed visualization drills down/up and exposes an accessible table fallback")

        valid_api = desktop.request.get(f"{BASE_URL}/api/content/fa/slide-104")
        assert valid_api.status == 200
        valid_text = valid_api.text()
        assert "20260906-Simorgh-SA-V07.pptx" in valid_text
        assert "D:\\" not in valid_text and str(ROOT) not in valid_text
        invalid_api = desktop.request.get(f"{BASE_URL}/api/content/fa/not%20valid")
        assert invalid_api.status in (400, 404)
        checks.append("Detail API returns source provenance without leaking absolute paths and rejects invalid IDs")

        assert_named_controls(desktop)
        assert desktop.locator("img:not([alt])").count() == 0
        assert desktop.locator("h1").count() == 1
        desktop.keyboard.press("Tab")
        assert desktop.evaluate("document.activeElement !== document.body")
        checks.append("Automated accessibility smoke checks pass for names, alt text, heading and keyboard focus")

        nav = desktop.evaluate(
            """() => { const n = performance.getEntriesByType('navigation')[0];
            const resources = performance.getEntriesByType('resource');
            return { domContentLoadedMs: Math.round(n.domContentLoadedEventEnd), loadMs: Math.round(n.loadEventEnd),
              transferredKb: Math.round(resources.reduce((sum, r) => sum + (r.transferSize || 0), 0) / 1024),
              resourceCount: resources.length }; }"""
        )
        assert nav["loadMs"] < 10000
        metrics["desktopNavigation"] = nav

        english = browser.new_page(viewport={"width": 1024, "height": 768})
        attach_diagnostics(english, errors)
        english.goto(f"{BASE_URL}/en/canvas?view=ecosystem", wait_until="networkidle")
        assert english.locator('main[lang="en"][dir="ltr"]').count() == 1
        expect(english.locator(".orbit-model")).to_have_count(9)
        expect(english.get_by_role("heading", name="Nine opportunity fields. One ecosystem.")).to_be_visible()
        english.screenshot(path=str(ARTIFACTS / "tablet-ecosystem-en.png"), full_page=True)
        checks.append("English is paired, LTR and functional at the tablet breakpoint")

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        attach_diagnostics(mobile, errors)
        mobile.goto(f"{BASE_URL}/fa/canvas", wait_until="networkidle")
        mobile.locator(".signal-intro").wait_for(state="detached")
        click_globe_center(mobile)
        expect(mobile.locator(".orbit-model")).to_have_count(9)
        assert mobile.evaluate("document.documentElement.scrollWidth <= innerWidth + 1")
        mobile.wait_for_timeout(1300)
        mobile.screenshot(path=str(ARTIFACTS / "mobile-ecosystem-fa.png"), full_page=True)
        mobile.goto(f"{BASE_URL}/fa/model/channels", wait_until="networkidle")
        mobile.locator(".evidence-row").first.click()
        expect(mobile.locator(".detail-constellation")).to_be_visible()
        modal_box = mobile.locator(".detail-panel").bounding_box()
        assert modal_box and modal_box["width"] <= 372 and modal_box["x"] >= 8
        mobile.locator(".detail-insight-point").last.click()
        expect(mobile.locator(".insight-popup")).to_be_visible()
        popup_box = mobile.locator(".insight-popup").bounding_box()
        assert popup_box and popup_box["x"] >= 0 and popup_box["x"] + popup_box["width"] <= 390
        mobile.wait_for_timeout(450)
        mobile.screenshot(path=str(ARTIFACTS / "mobile-nested-popup-fa.png"), full_page=False)
        checks.append("Mobile contains the ecosystem, centered modal and nested popup without page overflow")

        reduced = browser.new_context(viewport={"width": 1280, "height": 850}, reduced_motion="reduce").new_page()
        attach_diagnostics(reduced, errors)
        reduced.goto(f"{BASE_URL}/fa/canvas", wait_until="networkidle")
        reduced.locator(".signal-intro").wait_for(state="detached")
        click_globe_center(reduced)
        expect(reduced.locator(".orbit-model")).to_have_count(9)
        reduced.get_by_role("button", name="ورود به مدل: کانال‌ها").click()
        reduced.wait_for_url("**/fa/model/channels")
        assert reduced.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
        checks.append("Reduced-motion mode preserves the full journey without animation dependency")

        browser.close()

    result = {"checks": checks, "metrics": metrics, "errors": errors}
    (ARTIFACTS / "qa-results.json").write_text(
        json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8"
    )
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if errors:
        raise SystemExit("Browser diagnostics recorded errors")


if __name__ == "__main__":
    run()
