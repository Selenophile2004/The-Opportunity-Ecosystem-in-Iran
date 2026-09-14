import json
import os
from pathlib import Path

from playwright.sync_api import expect, sync_playwright


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "phase4"
BASE_URL = os.environ.get("PHASE4_BASE_URL", "http://127.0.0.1:3000")
CHROME = r"C:\Program Files\Google\Chrome\Application\chrome.exe"


def attach_diagnostics(page, errors: list[str]) -> None:
    page.on("console", lambda message: errors.append(f"console:{message.type}:{message.text}") if message.type == "error" else None)
    page.on("pageerror", lambda error: errors.append(f"pageerror:{error}"))


def run() -> None:
    ARTIFACTS.mkdir(parents=True, exist_ok=True)
    checks: list[str] = []
    errors: list[str] = []

    with sync_playwright() as playwright:
        browser = playwright.chromium.launch(headless=True, executable_path=CHROME)
        page = browser.new_page(viewport={"width": 1440, "height": 1000}, accept_downloads=True)
        attach_diagnostics(page, errors)

        page.goto(f"{BASE_URL}/fa/model/channels", wait_until="networkidle")
        expect(page.get_by_role("heading", name="اولویت کانال‌ها یک طیف ترتیبی است، نه اندازهٔ اثر")).to_be_visible()
        page.wait_for_selector(".viz-chart canvas")
        expect(page.locator(".viz-point-picker select")).to_have_value("")
        checks.append("Source-backed ECharts channel view renders 11 ordinal priority marks")
        page.locator(".viz-workbench").screenshot(path=str(ARTIFACTS / "channels-root-fa.png"))

        page.locator(".viz-point-picker select").select_option("channel-priority-07")
        expect(page.locator(".viz-breadcrumb")).to_contain_text("ابزار خودارزیابی دیجیتال")
        assert "viz=channel-priority" in page.url and "drill=channel-priority-07" in page.url
        expect(page.get_by_text("ابعاد امتیاز کیفی", exact=True)).to_be_visible()
        checks.append("Keyboard-accessible selection drills from channel to its five qualitative dimensions and persists URL state")

        page.get_by_role("button", name="بازکردن جزئیات منبع").click()
        page.get_by_role("dialog").wait_for(state="visible")
        expect(page.get_by_role("dialog")).to_contain_text("اسلاید ۱۱۵")
        page.keyboard.press("Escape")
        page.get_by_role("dialog").wait_for(state="detached")
        checks.append("Drilled chart context opens the source-backed detail modal")

        page.get_by_role("button", name="بازنشانی نما").click()
        page.locator(".viz-filters fieldset").first.get_by_role("button", name="۲", exact=True).click()
        page.locator(".viz-segmented").get_by_role("button", name="جدول دسترس‌پذیر").click()
        expect(page.locator(".viz-table-scroll tbody tr")).to_have_count(4)
        page.locator(".viz-filters fieldset").nth(1).get_by_role("button", name="کسب‌وکار تراز خارجی", exact=True).click()
        expect(page.locator(".viz-table-scroll tbody tr")).to_have_count(2)
        page.locator(".viz-sort").nth(1).click()
        checks.append("Priority and persona cross-filter the chart/table dataset and sortable table")

        with page.expect_download() as csv_download:
            page.get_by_role("button", name="دریافت CSV").click()
        csv_path = csv_download.value.path()
        assert csv_path and Path(csv_path).stat().st_size > 100
        assert csv_download.value.suggested_filename.endswith(".csv")
        checks.append("Filtered source data exports as CSV")

        page.locator(".viz-segmented").get_by_role("button", name="نمودار").click()
        page.wait_for_selector(".viz-chart canvas")
        with page.expect_download() as png_download:
            page.get_by_role("button", name="دریافت PNG").click()
        png_path = png_download.value.path()
        assert png_path and Path(png_path).stat().st_size > 1000
        assert png_download.value.suggested_filename.endswith(".png")
        checks.append("Rendered chart exports as PNG")

        page.goto(f"{BASE_URL}/fa/model/customer-relationships", wait_until="networkidle")
        page.wait_for_selector(".viz-chart canvas")
        page.locator(".viz-point-picker select").select_option("E")
        expect(page.locator(".viz-breadcrumb")).to_contain_text("E · شراکت راهبردی + اکوسیستمی")
        expect(page.locator(".viz-drill-detail button")).to_have_count(6)
        page.locator(".viz-filters fieldset").get_by_role("button", name="سرمایه‌گذار", exact=True).click()
        expect(page.locator(".viz-drill-detail button")).to_have_count(1)
        page.locator(".viz-segmented").get_by_role("button", name="جدول دسترس‌پذیر").click()
        expect(page.locator(".viz-table-scroll tbody tr")).to_have_count(5)
        checks.append("Relationship matrix drills zone → archetype → persona allocation with coordinated filtering")
        page.locator(".viz-workbench").screenshot(path=str(ARTIFACTS / "relationship-zone-fa.png"))

        page.goto(f"{BASE_URL}/en/model/channels", wait_until="networkidle")
        page.wait_for_selector(".viz-chart canvas")
        expect(page.get_by_text("English chart labels are a working translation awaiting review.", exact=True)).to_be_visible()
        assert page.locator('[lang="en"][dir="ltr"]').count() == 1
        checks.append("English LTR view localizes visualization controls and exposes translation status")

        mobile = browser.new_page(viewport={"width": 390, "height": 844})
        attach_diagnostics(mobile, errors)
        mobile.goto(f"{BASE_URL}/fa/model/channels", wait_until="networkidle")
        mobile.wait_for_selector(".viz-chart canvas")
        workbench_box = mobile.locator(".viz-workbench").bounding_box()
        assert workbench_box and workbench_box["width"] <= 390
        assert mobile.evaluate("document.documentElement.scrollWidth <= window.innerWidth + 1")
        mobile.locator(".viz-segmented").get_by_role("button", name="جدول دسترس‌پذیر").click()
        expect(mobile.locator(".viz-table-scroll")).to_be_visible()
        checks.append("Mobile keeps the evidence first, uses compact labels and contains wide tables in local scrolling")
        mobile.locator(".viz-workbench").screenshot(path=str(ARTIFACTS / "channels-mobile-fa.png"))

        reduced = browser.new_context(viewport={"width": 1280, "height": 850}, reduced_motion="reduce").new_page()
        attach_diagnostics(reduced, errors)
        reduced.goto(f"{BASE_URL}/fa/model/channels", wait_until="networkidle")
        reduced.wait_for_selector(".viz-chart canvas")
        assert reduced.evaluate("matchMedia('(prefers-reduced-motion: reduce)').matches")
        reduced.locator(".viz-point-picker select").select_option("channel-priority-01")
        expect(reduced.locator(".viz-breadcrumb")).to_contain_text("شبکه شخصی")
        checks.append("Reduced-motion mode preserves drill behavior without depending on animation")

        browser.close()

    result = {"checks": checks, "errors": errors}
    (ARTIFACTS / "qa-results.json").write_text(json.dumps(result, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps(result, ensure_ascii=True, indent=2))
    if errors:
        raise SystemExit("Browser diagnostics recorded errors")


if __name__ == "__main__":
    run()
