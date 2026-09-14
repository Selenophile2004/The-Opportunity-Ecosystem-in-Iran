from __future__ import annotations

import hashlib
import json
import re
import zipfile
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "phase0"
DOCS = ROOT / "docs"
DATA = ROOT / "data"
PRESENTATION = ARTIFACTS / "presentation.json"
PDF_DATA = ARTIFACTS / "pdf.json"


SECTION_RANGES = [
    (1, 4, "opportunity-context", "زمینه و تز فرصت"),
    (5, 13, "project-and-benchmarks", "مسیر پروژه، منطق شکل‌گیری و بنچمارک"),
    (14, 19, "business-model-foundation", "مدل مفهومی و فرضیات کلیدی"),
    (20, 45, "customer-segments", "بخش‌های مشتری و پرسوناها"),
    (46, 99, "value-propositions", "ارزش پیشنهادی، نقشه ارزش و MVE"),
    (100, 122, "channels", "کانال‌های مشتری"),
    (123, 144, "customer-relationships", "ارتباط با مشتری"),
    (145, 145, "closing", "پایان‌بندی و اطلاعات تماس"),
]

CONTEXTUAL_SLIDES = {1, 5, 8, 14, 20, 21, 46, 47, 49, 63, 93, 100, 102, 103, 120, 123, 124}

TITLE_OVERRIDES = {
    15: "مدل مفهومی کسب‌وکار — نمای پایه",
    16: "مدل مفهومی کسب‌وکار — ستاد و فرهنگ مشترک",
    21: "نمای بوم با تمرکز بر بخش‌های مشتری",
    25: "ابعاد بخش‌بندی — نیاز",
    26: "ابعاد بخش‌بندی — رفتار",
    27: "ابعاد بخش‌بندی — مشخصات شرکت",
    28: "بخش‌های مشتری شناسایی‌شده",
    30: "پروفایل پرسونا ۱ — کسب‌وکار تراز ایرانی (۱/۲)",
    31: "پروفایل پرسونا ۱ — کسب‌وکار تراز ایرانی (۲/۲)",
    32: "پروفایل پرسونا ۲ — کسب‌وکار تراز خارجی (۱/۲)",
    33: "پروفایل پرسونا ۲ — کسب‌وکار تراز خارجی (۲/۲)",
    34: "پروفایل پرسونا ۳ — کسب‌وکار مشتاق (۱/۲)",
    35: "پروفایل پرسونا ۳ — کسب‌وکار مشتاق (۲/۲)",
    36: "پروفایل پرسونا ۴ — کسب‌وکار کنجکاو (۱/۲)",
    37: "ادامه پروفایل پرسونا ۴ — برچسب منبع تکراری (۱/۲)",
    38: "پروفایل پرسونا ۵ — خالق کسب‌وکار (۱/۲)",
    39: "ادامه پروفایل پرسونا ۵ — برچسب منبع تکراری (۱/۲)",
    40: "پروفایل پرسونا ۶ — سرمایه‌گذار (۱/۲)",
    41: "ادامه پروفایل پرسونا ۶ — برچسب منبع تکراری (۱/۲)",
    44: "روش پروفایل مشتری و نقشه ارزش پیشنهادی",
    47: "نمای بوم با تمرکز بر ارزش‌های پیشنهادی",
    49: "فهرست نقشه کارها، دردسرها و منافع",
    63: "فهرست محرک‌ها و نقشه‌های ارزش",
    66: "نقشه ارزش پرسونا ۱ — هوشمندی و اعتبارسنجی فرصت",
    67: "نقشه ارزش پرسونا ۱ — ایجاد دسترسی مورداعتماد",
    68: "نقشه ارزش پرسونا ۱ — تأمین و فعال‌سازی منابع و قابلیت‌ها",
    69: "نقشه ارزش پرسونا ۱ — هماهنگ‌سازی و تبدیل فرصت به نتیجه",
    70: "نقشه ارزش پرسونا ۲ — هوشمندی و اعتبارسنجی فرصت",
    71: "نقشه ارزش پرسونا ۲ — ایجاد دسترسی مورداعتماد",
    72: "نقشه ارزش پرسونا ۲ — تأمین و فعال‌سازی منابع و قابلیت‌ها",
    73: "نقشه ارزش پرسونا ۲ — هماهنگ‌سازی و تبدیل فرصت به نتیجه",
    74: "نقشه ارزش پرسونا ۳ — هوشمندی و اعتبارسنجی فرصت",
    75: "نقشه ارزش پرسونا ۳ — ایجاد دسترسی مورداعتماد",
    76: "نقشه ارزش پرسونا ۳ — تأمین و فعال‌سازی منابع و قابلیت‌ها",
    77: "نقشه ارزش پرسونا ۳ — هماهنگ‌سازی و تبدیل فرصت به نتیجه",
    78: "نقشه ارزش پرسونا ۴ — هوشمندی و اعتبارسنجی فرصت",
    79: "نقشه ارزش پرسونا ۴ — ایجاد دسترسی مورداعتماد",
    80: "نقشه ارزش پرسونا ۴ — تأمین و فعال‌سازی منابع و قابلیت‌ها",
    81: "نقشه ارزش پرسونا ۴ — هماهنگ‌سازی و تبدیل فرصت به نتیجه",
    82: "نقشه ارزش پرسونا ۵ — هوشمندی و اعتبارسنجی فرصت",
    83: "نقشه ارزش پرسونا ۵ — ایجاد دسترسی مورداعتماد",
    84: "نقشه ارزش پرسونا ۵ — تأمین و فعال‌سازی منابع و قابلیت‌ها",
    85: "نقشه ارزش پرسونا ۵ — هماهنگ‌سازی و تبدیل فرصت به نتیجه",
    86: "نقشه ارزش پرسونا ۶ — هوشمندی و اعتبارسنجی فرصت",
    87: "نقشه ارزش پرسونا ۶ — ایجاد دسترسی مورداعتماد",
    88: "نقشه ارزش پرسونا ۶ — تأمین و فعال‌سازی منابع و قابلیت‌ها",
    89: "نقشه ارزش پرسونا ۶ — هماهنگ‌سازی و تبدیل فرصت به نتیجه",
    99: "دوازده بُعد دارایی بنیان‌گذار در پنج خوشه",
    102: "نمای بوم با تمرکز بر کانال‌ها",
    103: "نقل‌قول مرجع درباره مالکیت رابطه با مشتری",
    104: "تعریف کانال مشتری و اهمیت آن",
    105: "طبقه‌بندی کانال و مدل پنج‌فازی",
    106: "گام‌های فرایند تحلیل کانال",
    113: "کانال‌های معرف / Enabler غیرمشتری",
    114: "طبقه‌بندی کانال از منظر مالکیت و نحوه دسترسی",
    115: "اولویت‌بندی و امتیازدهی کانال‌ها",
    116: "مفروضات، عدم‌قطعیت‌ها و ریسک‌های کانال",
    117: "سه کانال با بیشترین تأثیر بر کل اکوسیستم",
    118: "اقدامات کانال در شروع فاز عملیاتی",
    119: "منابع و بنچمارک‌های کانال",
    121: "الگوهای اکوسیستمی در ادبیات مدیریتی",
    122: "نقش‌های اکوسیستمی در کسب‌وکار",
    124: "فهرست معماری روابط مشتری",
    145: "پایان‌بندی برند و اطلاعات تماس",
}


def section_for(slide_number: int) -> tuple[str, str]:
    for start, end, key, title in SECTION_RANGES:
        if start <= slide_number <= end:
            return key, title
    raise ValueError(slide_number)


def node_for(slide_number: int) -> str:
    direct = {
        1: "project.cover",
        2: "context.capital-machine",
        3: "context.digital-network-ownership",
        4: "context.iran-opportunity-thesis",
        5: "project.delivery-roadmap",
        6: "business-model.formation-logic",
        7: "business-model.canvas-overview",
        8: "benchmarks.index",
        9: "benchmarks.enterprise-europe-network",
        14: "business-model.section-index",
        15: "business-model.conceptual-model",
        16: "business-model.conceptual-model",
        20: "customer-segments.section-index",
        21: "business-model.canvas-overview.customer-segments-focus",
        22: "customer-segments.strategic-question",
        23: "customer-segments.actor-map",
        24: "customer-segments.methodology",
        25: "customer-segments.dimension.need",
        26: "customer-segments.dimension.behavior",
        27: "customer-segments.dimension.company-profile",
        28: "customer-segments.identified-segments",
        29: "personas.overview",
        42: "customer-segments.caveats",
        43: "customer-segments.additional-analysis",
        44: "value-propositions.customer-profile-method",
        45: "business-model.design-risks",
        46: "value-propositions.section-index",
        47: "business-model.canvas-overview.value-propositions-focus",
        48: "value-propositions.executive-summary",
        49: "value-propositions.jobs-map-index",
        50: "customer-jobs.overview",
        57: "customer-jobs.shared-patterns",
        58: "customer-pains.analysis",
        59: "customer-gains.analysis",
        60: "opportunities.matrix",
        61: "value-propositions.strategic-synthesis",
        62: "value-propositions.sources",
        63: "value-propositions.value-map-index",
        64: "value-creation.reinforcing-loop",
        65: "value-creation.drivers",
        90: "value-propositions.by-persona",
        91: "value-propositions.core-statement",
        92: "value-propositions.next-action",
        93: "mve.section-index",
        94: "mve.meaningful-being",
        95: "mve.foreign-actor-maturity-map",
        96: "mve.being-led-value-chain",
        97: "mve.being-vs-doing",
        98: "mve.being-monetization",
        99: "mve.founder-asset-dimensions",
        100: "channels.section-index",
        101: "channels.previous-work-summary",
        102: "business-model.canvas-overview.channels-focus",
        103: "channels.reference-quote",
        104: "channels.definition",
        105: "channels.classification-and-phases",
        106: "channels.analysis-workflow",
        113: "channels.enablers",
        114: "channels.ownership-access-taxonomy",
        115: "channels.scoring-prioritization",
        116: "channels.assumptions-and-risks",
        117: "channels.ecosystem-top-three",
        118: "channels.operational-actions",
        119: "channels.sources",
        120: "channels.appendix-index",
        121: "ecosystem-patterns.management-literature",
        122: "ecosystem-patterns.roles",
        123: "customer-relationships.section-index",
        124: "customer-relationships.table-of-contents",
        125: "customer-relationships.framework",
        126: "customer-relationships.selected-model",
        134: "customer-relationships.archetype-summary",
        135: "customer-relationships.decision-criteria",
        136: "customer-relationships.decision-matrix",
        143: "customer-relationships.conclusions",
        144: "customer-relationships.sources",
        145: "project.closing",
    }
    if slide_number in direct:
        return direct[slide_number]
    if 10 <= slide_number <= 11:
        return f"revenue-models.part-{slide_number - 9:02d}"
    if 12 <= slide_number <= 13:
        return f"benchmark-value-propositions.part-{slide_number - 11:02d}"
    if 17 <= slide_number <= 19:
        return f"business-model.assumptions.part-{slide_number - 16:02d}"
    if 30 <= slide_number <= 41:
        persona = (slide_number - 30) // 2 + 1
        part = (slide_number - 30) % 2 + 1
        return f"personas.persona-{persona:02d}.profile.part-{part:02d}"
    if 51 <= slide_number <= 56:
        return f"personas.persona-{slide_number - 50:02d}.jobs-pains-gains"
    if 66 <= slide_number <= 89:
        persona = (slide_number - 66) // 4 + 1
        driver = (slide_number - 66) % 4 + 1
        return f"personas.persona-{persona:02d}.value-map.driver-{driver:02d}"
    if 107 <= slide_number <= 112:
        return f"personas.persona-{slide_number - 106:02d}.channels"
    if 127 <= slide_number <= 133:
        return f"customer-relationships.archetype-{slide_number - 126:02d}"
    if 137 <= slide_number <= 142:
        return f"personas.persona-{slide_number - 136:02d}.relationship-allocation"
    return f"source.slide-{slide_number:03d}"


def canvas_block_for(slide_number: int) -> str:
    if 10 <= slide_number <= 11:
        return "revenue-streams"
    if 20 <= slide_number <= 45:
        return "customer-segments"
    if 46 <= slide_number <= 99:
        return "value-propositions"
    if 100 <= slide_number <= 122:
        return "channels"
    if 123 <= slide_number <= 144:
        return "customer-relationships"
    return "business-model-root"


def disposition(slide_number: int) -> str:
    if slide_number == 145:
        return "visual-only"
    if slide_number in CONTEXTUAL_SLIDES:
        return "contextual"
    return "imported"


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def file_record(path: Path, logical_name: str, role: str) -> dict:
    record = {
        "logicalName": logical_name,
        "role": role,
        "filename": path.name,
        "sizeBytes": path.stat().st_size,
        "modifiedUtc": datetime.fromtimestamp(path.stat().st_mtime, tz=timezone.utc).isoformat(),
        "sha256": sha256(path),
    }
    try:
        from PIL import Image

        with Image.open(path) as image:
            record["image"] = {"width": image.width, "height": image.height, "mode": image.mode, "format": image.format}
    except Exception:
        pass
    return record


def build_asset_records() -> list[dict]:
    records = []
    paths = [
        (ROOT / "Data" / "20260906-Simorgh-SA-V07.pptx", "sources/presentation.pptx", "primary-content"),
        (ROOT / "Data" / "20260906-Simorgh-SA-V07.pdf", "sources/presentation.pdf", "visual-cross-check"),
        (ROOT.parent / "ILIA_BrandBook_v10.pdf", "brand/ILIA_BrandBook_v10.pdf", "brand-authority"),
        (ROOT.parent / "YekanBakh3-ProPlus.zip", "brand/YekanBakh3-ProPlus.zip", "font-package"),
        (ROOT.parent / "prompt-iran-opportunity-ecosystem.md", "brief/prompt-iran-opportunity-ecosystem.md", "project-brief"),
        (ROOT / "Font" / "YekanBakh-Regular.ttf", "fonts/YekanBakh-Regular.ttf", "local-font"),
    ]
    for path, logical, role in paths:
        if path.exists():
            records.append(file_record(path, logical, role))

    for path in sorted((ROOT / "Logo").glob("*")):
        if path.is_file():
            records.append(file_record(path, f"brand/workspace-logo/{path.name}", "logo"))
    for path in sorted((ROOT / "photo-sample").glob("*")):
        if path.is_file():
            records.append(file_record(path, f"references/{path.name}", "visual-reference"))
    external_logo_dir = ROOT.parent / "Logo"
    if external_logo_dir.exists():
        for path in sorted(external_logo_dir.glob("*")):
            if path.is_file():
                records.append(file_record(path, f"brand/official-logo/{path.name}", "official-logo"))
    return records


def title_for(slide: dict) -> str:
    return TITLE_OVERRIDES.get(slide["slideNumber"], slide["title"]).replace("|", "\\|")


def inventory_markdown(deck: dict) -> str:
    counts = Counter(disposition(slide["slideNumber"]) for slide in deck["slides"])
    rows = []
    for slide in deck["slides"]:
        number = slide["slideNumber"]
        section_key, section_title = section_for(number)
        metrics = slide["metrics"]
        media = []
        if metrics["tableCount"]:
            media.append(f"{metrics['tableCount']} جدول")
        if metrics["imageCount"]:
            media.append(f"{metrics['imageCount']} تصویر")
        if metrics["connectorCount"]:
            media.append(f"{metrics['connectorCount']} اتصال")
        media_text = "، ".join(media) or "—"
        rows.append(
            f"| {number} | {title_for(slide)} | {section_title} | `{slide['contentType']}` | "
            f"{metrics['characterCount']} | {media_text} | `{disposition(number)}` | `{node_for(number)}` |"
        )
    return f"""# فهرست محتوای منبع

این فهرست خروجی ممیزی فاز صفر است. شماره‌ها شماره فیزیکی اسلاید در فایل منبع هستند و به شماره‌های درج‌شده داخل فهرست‌های خود پاورپوینت وابسته نیستند.

## خلاصه پوشش

- کل اسلایدها: **{len(deck['slides'])}**
- واردشده به استخراج خام: **{counts['imported']}**
- اسلایدهای زمینه‌ای/راهنما: **{counts['contextual']}**
- اسلایدهای صرفاً بصری: **{counts['visual-only']}**
- duplicate متنی دقیق: **0**؛ اسلایدهای دارای state بصری مشابه به‌جای حذف، به یک node مشترک نگاشت شده‌اند.
- excluded-with-reason: **0**
- متن استخراج‌شده از slide shapes: **{sum(s['metrics']['characterCount'] for s in deck['slides']):,} کاراکتر**
- shape: **{sum(s['metrics']['shapeCount'] for s in deck['slides']):,}**؛ text shape: **{sum(s['metrics']['textShapeCount'] for s in deck['slides']):,}**؛ جدول بومی: **{sum(s['metrics']['tableCount'] for s in deck['slides'])}**؛ اتصال/خط: **{sum(s['metrics']['connectorCount'] for s in deck['slides'])}**
- نمودار بومی PowerPoint: **0**؛ embedding: **0**؛ media part: **{deck['packageMetrics']['mediaCount']}**

## راهنمای وضعیت

- `imported`: متن و ساختار shapeها در `artifacts/phase0/presentation.json` ثبت شده است.
- `contextual`: برای درک توالی، section، benchmark یا state بصری لازم است ولی معمولاً node محتوایی مستقل در runtime نمی‌شود.
- `visual-only`: متن در سطح slide shape موجود نیست و باید از PDF/تصویر و master بررسی شود.

## فهرست اسلایدبه‌اسلاید

| اسلاید | عنوان ممیزی‌شده | بخش | نوع استخراجی | کاراکتر | عناصر ساختاری | وضعیت | node پیشنهادی |
|---:|---|---|---|---:|---|---|---|
{chr(10).join(rows)}
"""


def mapping_markdown(deck: dict) -> str:
    rows = []
    for slide in deck["slides"]:
        number = slide["slideNumber"]
        section_key, _ = section_for(number)
        shape_ids = [shape["shapeId"] for shape in slide["shapes"]]
        rows.append(
            f"| {number} | `source-slide-{number:03d}` | `{section_key}` | `{canvas_block_for(number)}` | "
            f"`{node_for(number)}` | {len(shape_ids)} | `{slide['textHash'] or 'no-slide-text'}` |"
        )
    return f"""# نگاشت داده و provenance

این سند نگاشت اولیه منبع به nodeهای پایدار را ثبت می‌کند. nodeها در فاز ۱ به رکوردهای محتوایی دوزبانه شکسته می‌شوند؛ فعلاً هیچ ترجمه یا عددی خارج از منبع تولید نشده است.

## قواعد نگاشت

- شناسه provenance هر اسلاید تغییرناپذیر و به شکل `source-slide-NNN` است.
- shape IDهای کامل در `data/source-manifest.json` و جزئیات bbox/text/table در `artifacts/phase0/presentation.json` نگهداری می‌شوند.
- یک اسلاید می‌تواند چند node نهایی بسازد؛ ستون node در این جدول parent پیشنهادی را نشان می‌دهد.
- اسلایدهای ۱۵ و ۱۶ دو state از مدل مفهومی‌اند و parent مشترک دارند.
- اسلایدهای ۲۱، ۴۷ و ۱۰۲ stateهای تمرکز متفاوت از بوم یکسان‌اند و باید یک canvas schema مشترک داشته باشند.
- اسلایدهای ۶۶ تا ۸۹ یک ماتریس ۶ پرسونا × ۴ محرک ارزش هستند.

| اسلاید | source ID | section | canvas block | parent node پیشنهادی | shape count | text hash |
|---:|---|---|---|---|---:|---|
{chr(10).join(rows)}
"""


def phase0_audit_markdown(deck: dict, pdf: dict, asset_records: list[dict]) -> str:
    return f"""# گزارش ممیزی فاز صفر

## نتیجه اجرایی

منبع اصلی `20260906-Simorgh-SA-V07.pptx` دقیقاً **۱۴۵ اسلاید** دارد و PDF هم‌نام نیز **۱۴۵ صفحه** است. زمان تغییر PDF چهار ثانیه قبل از PPTX است و فایل جدیدتری در پوشه `Data` وجود ندارد؛ بنابراین PPTX منبع معنایی و PDF مرجع رندر بصری باقی می‌ماند. PDF به‌صورت خودکار جایگزین PPTX نشده است.

هیچ کد یا repository موجودی برای حفظ یا مهاجرت یافت نشد. workspace در شروع فقط شامل PPTX/PDF، چهار لوگوی PNG، یک فایل فونت و پنج تصویر مرجع بود. بنابراین فاز بعد می‌تواند با Next.js App Router آغاز شود، بدون هزینه بازنویسی پشته موجود.

## شواهد ممیزی

- SHA-256 پاورپوینت: `{deck['source']['sha256']}`
- SHA-256 PDF: `{pdf['source']['sha256']}`
- slide/page parity: **۱۴۵/۱۴۵**
- shapeهای استخراج‌شده: **{sum(s['metrics']['shapeCount'] for s in deck['slides']):,}**
- جدول‌های بومی: **{sum(s['metrics']['tableCount'] for s in deck['slides'])}** در ۵۱ اسلاید
- connectorها و خطوط: **{sum(s['metrics']['connectorCount'] for s in deck['slides'])}**
- تصویرهای روی اسلاید: **{sum(s['metrics']['imageCount'] for s in deck['slides'])}**؛ ۱۳ مورد SVG داخلی‌اند که `python-pptx` raster metadata آن‌ها را decode نمی‌کند، اما relationship داخلی و رندر PDF سالم است.
- chart بومی، SmartArt/diagram part و embedded workbook: **صفر**. نمودارها و ماتریس‌های موجود عمدتاً با shape و table ساخته شده‌اند و برای وب باید به visualization schema تبدیل شوند.
- notes slide part: **۲**، اما هیچ یادداشت معنایی بازیابی نشد.
- comment author part: **۱** و comment body: **صفر**.

## ساختار واقعی محتوا

1. اسلایدهای ۱–۴: تز فرصت و زمینه اقتصاد/سرمایه.
2. اسلایدهای ۵–۱۳: مسیر پروژه، منطق شکل‌گیری، EEN و الگوهای درآمد/ارزش benchmark.
3. اسلایدهای ۱۴–۱۹: مدل مفهومی و فرضیات کلیدی.
4. اسلایدهای ۲۰–۴۵: بخش‌بندی مشتری، شش پرسونا، روش و ریسک‌ها.
5. اسلایدهای ۴۶–۹۹: نقشه کارها، دردسرها و منافع؛ چرخه خلق ارزش؛ ۲۴ نقشه ارزش؛ ارزش پیشنهادی؛ MVE و Being/Doing.
6. اسلایدهای ۱۰۰–۱۲۲: کانال، شش تحلیل پرسونا، Enablerها، امتیازدهی، اقدامات و appendix اکوسیستمی.
7. اسلایدهای ۱۲۳–۱۴۴: هفت آرکی‌تایپ رابطه، معیارها، ماتریس و تخصیص به شش پرسونا.
8. اسلاید ۱۴۵: پایان‌بندی برند/اطلاعات تماس که متن آن در master/render است، نه slide shape.

## وضعیت ۹ بلوک بوم

| بلوک | وضعیت | شواهد |
|---|---|---|
| بخش‌های مشتری | `available` | اسلایدهای ۲۰–۴۵ |
| ارزش‌های پیشنهادی | `available` | اسلایدهای ۴۶–۹۹ |
| کانال‌ها | `available` | اسلایدهای ۱۰۰–۱۲۲ |
| ارتباط با مشتری | `available` | اسلایدهای ۱۲۳–۱۴۴ |
| جریان‌های درآمدی | `partial` | benchmark درآمدی ۱۰–۱۱ و سازوکارهای Being در ۹۸؛ بلوک نهایی کامل نیست |
| شرکای کلیدی | `partial` | مدل مفهومی ۱۵–۱۶ و نقش‌های اکوسیستمی ۱۲۲؛ فهرست/معیار مستقل کامل نیست |
| فعالیت‌های کلیدی | `partial` | مدل مفهومی و خطوط کسب‌وکار موجود است؛ بلوک مستقل تکمیل نشده |
| منابع کلیدی | `partial` | قابلیت‌ها و دارایی بنیان‌گذار در ۹۹ آمده، اما بلوک مستقل کامل نیست |
| ساختار هزینه | `not_provided` | فقط پرسش‌های قالب بوم دیده می‌شود و داده هزینه‌ای مستقل وجود ندارد |

## ممیزی برند و تصویر

- Brand Book نسخه ۲۰۲۵، ۵۷ صفحه و مرجع لوگو، تایپوگرافی، رنگ و data visualization است.
- لوگوی کامل باید حداقل ۳۲px ارتفاع داشته باشد؛ زیر آن فقط Sign تا حداقل ۱۶px مجاز است. clear space حداقل برابر یک واحد `&` است. لوگو نباید rotate، stretch، retype، border یا effect بگیرد.
- Brand Book، Yekan Bakh 3 Pro را برای فارسی و Acumin Variable را برای انگلیسی تعریف می‌کند. بسته Yekan Bakh در ورودی وجود دارد ولی هیچ LICENSE/EULA همراه آن یافت نشد؛ استفاده self-hosted باید تا تأیید مجوز متوقف بماند.
- رنگ‌های رسمی Brand Book: `#F8F8F8`، `#141414`، `#7800DC`؛ رنگ‌های ثانویه `#F0BE0F` و `#41AFC8`.
- brief محصول به‌طور مشخص `#09132A`، `#FFC000` و `#FFFFFF` را الزام و کپی‌کردن بنفش مرجع Mindway را منع می‌کند. بنابراین brief محصول بر palette عمومی Brand Book تقدم دارد؛ قواعد لوگو و تایپوگرافی همچنان از Brand Book می‌آید.
- نمونه‌برداری از نواحی خالی تصویر Mindway طیف‌های غالب `#151110`، `#10051A`، `#09050E` و انتهای گرم `#1B1510` را نشان می‌دهد. این نمونه فقط برای عمق/گرادیان پس‌زمینه است.
- چهار تصویر Business Model Canvas فقط topology استاندارد ۵ ستون بالا و ۲ بلوک پایین را تأیید می‌کنند؛ هیچ متن، رنگ یا برند داخل آن‌ها وارد مدل محتوا نمی‌شود.

## خروجی‌های فاز صفر

- `docs/content-inventory.md`
- `docs/information-architecture.md`
- `docs/data-mapping.md`
- `docs/design-system.md`
- `docs/assumptions-and-gaps.md`
- `docs/architecture-decision-record.md`
- `data/source-manifest.json`
- `artifacts/phase0/presentation.json`, `pdf.json`, `source-comparison.json`, contact sheets

فایل‌های `data/content.fa.json` و `data/content.en.json` عمداً در فاز صفر ساخته نشده‌اند: اولی نیازمند normalizing انسانی رکوردها و دومی نیازمند ترجمه وفادار و review واژگان رسمی است؛ ساخت placeholder با اصل «عدم تولید محتوای ساختگی» تعارض داشت. هر دو خروجی در فاز ۱ قرار دارند و قبل از UI الزامی‌اند.
"""


def ia_markdown() -> str:
    return """# معماری اطلاعات

## اصل سازمان‌دهی

ساختار runtime باید معنایی باشد، نه اسلایدی. اسلاید فقط provenance است. صفحه اول بوم ۹ بلوکی است؛ هر بلوک به topicها و data itemها drill می‌شود و پرسونا، محرک ارزش، کانال و آرکی‌تایپ رابطه ابعاد مشترک cross-filter هستند.

```text
OpportunityEcosystem
├── BusinessModelCanvas
│   ├── CustomerSegments ── Persona[6]
│   ├── ValuePropositions ── ValueDriver[4] ── ValueMap[6×4]
│   ├── Channels ── ChannelType / Phase / Ownership / Candidate
│   ├── CustomerRelationships ── Archetype[7] / DecisionMatrix / Allocation[6]
│   ├── RevenueStreams (partial)
│   ├── KeyPartners (partial)
│   ├── KeyActivities (partial)
│   ├── KeyResources (partial)
│   └── CostStructure (not_provided)
├── CustomerWork
│   ├── Job
│   ├── Pain
│   ├── Gain
│   └── OpportunityMatrix
├── ValueCreation
│   ├── ReinforcingLoop
│   ├── ValueDriver[4]
│   └── MVE / MeaningfulBeing / BeingVsDoing / MaturityMap
├── Evidence
│   ├── Benchmark
│   ├── Source
│   ├── Assumption
│   ├── Risk
│   └── ValidationState
└── Provenance
    └── SourceFile ── Slide ── Shape
```

## موجودیت‌های اصلی

| موجودیت | کلید پایدار | رابطه‌های کلیدی | نمایش پیشنهادی |
|---|---|---|---|
| CanvasBlock | `canvas-block-*` | topic, persona, filter tag | بلوک شماتیک |
| Persona | `persona-01..06` | job, pain, gain, value map, channel, relationship | صفحه/کارت پرسونا |
| Job/Pain/Gain | ID مستقل | persona, opportunity cell | node + detail panel |
| ValueDriver | `driver-01..04` | persona, product, pain reliever, gain creator | tab/axis فیلتر |
| ValueMap | persona × driver | products, relievers, creators | ماتریس/پنل |
| Channel | ID مستقل | persona, phase, type, ownership, score | جدول و drill-down |
| RelationshipArchetype | `relationship-01..07` | complexity, customer value, benchmark | spectrum + detail |
| RelationshipAllocation | persona × matrix zone | archetype, use case | matrix + table |
| Evidence | ID مستقل | هر node محتوایی | source drawer |
| Provenance | `source-slide-NNN` + shape IDs | file, slide, shape | لینک بازگشت به منبع |

## روابط محوری

- Persona → Jobs/Pains/Gains یک‌به‌چند.
- Persona × ValueDriver → ValueMap؛ این ترکیب دقیقاً از اسلایدهای ۶۶–۸۹ پشتیبانی می‌شود.
- Persona → ChannelCandidate چندبه‌چند، با metadata نیاز محوری، رفتار و تصمیم‌گیرنده.
- Persona → RelationshipAllocation چندبه‌چند؛ تخصیص می‌تواند هم‌زمان چند آرکی‌تایپ داشته باشد.
- Node → Evidence چندبه‌چند؛ یک منبع می‌تواند چند node را پشتیبانی کند.
- Node → Provenance حداقل یک‌به‌یک؛ هر ادعا/عدد باید slide number و در صورت امکان shape ID داشته باشد.

## hierarchyهای معتبر برای drill-down

1. Canvas block → topic → data item.
2. Persona → job → pain/gain → evidence.
3. Persona → value driver → product/pain reliever/gain creator.
4. Channel ownership/type → channel candidate → score dimension → evidence.
5. Relationship matrix zone → persona allocation → archetype → benchmark.

هیچ hierarchy عددی برای chart در منبع وجود ندارد؛ نمودارهای drill-down فقط پس از نرمال‌سازی فاز ۱ و در جایی ساخته می‌شوند که parent/child واقعی وجود دارد.

## routeها و URL state

- `/{locale}/canvas`
- `/{locale}/model/{canvasBlockSlug}`
- `/{locale}/model/{canvasBlockSlug}/{topicSlug}`
- `/{locale}/personas/{personaSlug}`
- `/{locale}/sources`
- `/{locale}/search`
- queryهای پایدار: `persona`, `driver`, `channelType`, `relationship`, `status`, `detail`.

## جست‌وجو و فیلتر

Index شامل title، summary، body، KPI، persona، source title و benchmark است. منطق فیلتر: OR درون یک facet و AND میان facetها. non-match حذف نمی‌شود و opacity آن به ۳۰–۴۰٪ کاهش می‌یابد. دلیل match از رابطه واقعی node با facet تولید می‌شود، نه از متن حدسی.

## مرز محتوای runtime

`artifacts/phase0` داده تشخیصی و شامل bbox/text خام است و نباید مستقیم client-bundled شود. runtime فقط JSON نرمال‌شده، مسیر منطقی منبع و شماره اسلاید را دریافت می‌کند؛ هیچ مسیر مطلق Windows منتشر نمی‌شود.
"""


def design_system_markdown() -> str:
    return """# سیستم طراحی — مبنای ممیزی‌شده

این سند تصمیم‌های پایه پیش از prototype را ثبت می‌کند. مسیر منتخب «Quiet Signal» است: سطح مات و بسیار تیره، بوم هندسی روشن، طلایی فقط برای focus/selection و Sign کم‌رنگ ILIA در فضای منفی.

## tokenهای رنگ

```css
:root {
  --brand-navy: #09132A;
  --brand-gold: #FFC000;
  --brand-white: #FFFFFF;
  --surface-1: #0D1B3D;
  --surface-2: #111F45;
  --bg-sampled-start: #170427;
  --bg-sampled-center: #0E0A12;
  --bg-sampled-end: #1B1510;
  --text-primary: rgba(255, 255, 255, 0.94);
  --text-secondary: rgba(255, 255, 255, 0.65);
  --divider: rgba(255, 255, 255, 0.12);
  --focus-ring: #FFC000;
}
```

پس‌زمینه پایه همیشه `#09132A` است. gradient نمونه‌برداری‌شده به‌صورت overlay کم‌کنتراست روی آن می‌آید. رنگ‌های Brand Book (`#7800DC`, `#F0BE0F`, `#41AFC8`) برای ارجاع برند ثبت‌اند، اما بنفش در UI محصول استفاده نمی‌شود چون brief صراحتاً آن را منع کرده است.

## تایپوگرافی

- فارسی: Yekan Bakh 3 Pro؛ وزن‌های Regular، SemiBold، Bold/Black. تا تأیید مجوز self-hosting، fallback: `Tahoma, Arial, sans-serif`.
- انگلیسی: Acumin Variable طبق Brand Book؛ چون فایل فونت ارائه نشده، fallback موقت: `Inter, Arial, sans-serif` و وضعیت gap ثبت می‌شود.
- بدنه فارسی راست‌چین؛ بدنه انگلیسی چپ‌چین. full justification و کشیده فارسی ممنوع.
- leading فارسی حداقل ۱۴۰٪ اندازه فونت.
- ستون متن فارسی ترجیحاً ۵ تا ۱۵ واژه در هر خط؛ از orphan/widow جلوگیری شود.
- اعداد فارسی با رقم‌های فارسی و جداکننده هزارگان `U+066C`؛ زمان ۲۴ساعته؛ واحد در header ستون.

## لوگو

- header: لوگوی کامل سفید/تک‌رنگ با ارتفاع حداقل ۳۲px.
- watermark: Sign رسمی سفید، opacity بین ۴–۹٪، بدون crop/stretch/effect.
- clear space: حداقل یک واحد `&` اطراف لوگوی کامل.
- زیر ۳۲px لوگوی کامل استفاده نشود؛ Sign تا حداقل ۱۶px مجاز است.
- جای پیش‌فرض Brand Book بالا-چپ است؛ در محصول، header logo نیز بالا-چپ باقی می‌ماند و RTL فقط جریان محتوا را تغییر می‌دهد.

## Canvas geometry

در دسکتاپ topology استاندارد ۵ ستون بالا + ۲ بلوک پایین حفظ می‌شود. Customer Segments ستون راست، Value Propositions مرکز، Key Partners ستون چپ، و Cost/Revenue ردیف پایین‌اند. کارت‌های هم‌اندازه یا grid ۳×۳ جایگزین مجاز نیست.

## stateها

| state | border | opacity | motion |
|---|---|---:|---|
| default | divider ۱۲٪ | ۱۰۰٪ | ambient بسیار ظریف |
| hover | طلایی ۴۰–۶۰٪ | ۱۰۰٪ | translate/scale حداکثر ۱–۲٪ |
| focus-visible | ring طلایی ۲px + offset | ۱۰۰٪ | بدون وابستگی به hover |
| selected/match | طلایی کامل + glow محدود | ۱۰۰٪ | ۲۰۰–۲۵۰ms |
| non-match | border خنثی | ۳۰–۴۰٪ | همچنان clickable |
| unavailable | dashed divider + badge وضعیت | ۶۰–۷۰٪ | بدون pulse |

## motion

- transition بلوک به صفحه: ۴۵۰–۷۰۰ms؛ scale نقطه آغاز تا حدود ۱٫۱۵.
- modal/drill: ۲۰۰–۲۵۰ms؛ connector با SVG و مختصات زنده.
- stagger: ۵۰–۸۰ms.
- type-on فقط متن کوتاه، ۱۵–۲۵ms/char و قابل skip.
- `prefers-reduced-motion`: همه حرکت‌ها به fade کوتاه تبدیل شوند.

## نمودار و جدول

- chart palette از navy/gold/white و tintهای کنترل‌شده ساخته می‌شود؛ extended palette Brand Book فقط وقتی چند سری واقعاً نیاز است.
- فارسی: Yekan Bakh برای label و عدد؛ انگلیسی: Acumin، و برای رقم ثابت DIN طبق Brand Book در صورت فراهم‌شدن font/license.
- legend تعاملی، tooltip دوزبانه، source/slide number، table fallback و export فقط برای داده مجاز.
- واحد همیشه در header؛ precision مالی دو رقم و علمی حداکثر چهار رقم.

## دسترس‌پذیری

- WCAG 2.2 AA، target حداقل ۴۴px، focus واضح، focus trap در dialog، بازگرداندن focus به origin.
- ترتیب DOM مستقل از موقعیت visual و در هر دو RTL/LTR منطقی باشد.
- جهت‌ها با logical properties پیاده شوند؛ left/right hardcoded فقط برای هندسه ثابت Canvas و با abstraction مجاز است.
"""


def gaps_markdown() -> str:
    return """# فرضیات، شکاف‌ها و موارد نیازمند تأیید

## شکاف‌های محتوایی

| شدت | مورد | شاهد | اثر | اقدام پیشنهادی |
|---|---|---|---|---|
| بالا | ساختار هزینه ارائه نشده | فقط prompt عمومی بوم در اسلایدهای ۷/۲۱/۴۷/۱۰۲ | بلوک بدون صفحه داده واقعی | `not_provided` و empty state شفاف |
| بالا | چهار بلوک Key Partners/Activities/Resources/Revenue کامل نیستند | داده پراکنده در ۱۰–۱۹، ۹۸–۹۹ و ۱۲۲ | امکان برداشت بیش از حد از context | `partial` و جلوگیری از ادعای completeness |
| بالا | ترجمه رسمی انگلیسی همه محتوا موجود نیست | فقط بخش‌هایی از اسلایدها دو‌زبانه‌اند | `content.en.json` نیازمند ترجمه و review | glossary و review انسانی در فاز ۱ |
| متوسط | اسلایدهای ۳۷، ۳۹ و ۴۱ برچسب (۱/۲) را تکرار می‌کنند | متن source shape | deep link و عنوان ممکن است مبهم شود | source label حفظ و خطا در metadata ثبت شود؛ اصلاح فقط با تأیید مالک محتوا |
| متوسط | فهرست‌های اسلایدهای ۲۰، ۴۹ و ۶۳ در بخش‌هایی یک شماره جلوتر از موقعیت فیزیکی‌اند | مقایسه TOC با slide order | provenance مبهم | شماره فیزیکی canonical؛ شماره نمایشی منبع به‌عنوان metadata جدا |
| متوسط | slide 145 متن slide-shape ندارد | متن در render/master دیده می‌شود | extractor ساده آن را empty می‌بیند | fallback PDF/master parser و وضعیت `visual-only` |
| متوسط | PDF text layer برای فارسی ترتیب حروف معکوس دارد | استخراج pdfplumber | diff متنی PDF↔PPTX قابل اتکا نیست | PDF برای visual diff؛ PPTX برای semantic text |
| متوسط | ۱۳ SVG داخلی با `python-pptx` decode نمی‌شوند | اسلایدهای ۹ و ۴۴ | image metadata ناقص | parse relationship/OOXML و renderer PDF |
| پایین | هیچ chart بومی وجود ندارد | package audit | hierarchy از chart metadata قابل استخراج نیست | schema از table/shape و روابط محتوا ساخته شود |

## شکاف‌های برند و دارایی

| شدت | مورد | نتیجه |
|---|---|---|
| بالا | بسته Yekan Bakh فاقد LICENSE/EULA همراه است | self-hosting تا تأیید مجوز متوقف بماند |
| متوسط | فایل Acumin Variable و DIN ارائه نشده | fallback موقت و درخواست asset/license در فاز اجرا |
| پایین | نام SVGهای `Black/White/Gray` با fillهای داخلی به‌سادگی قابل استنباط نیست | انتخاب نهایی با render روی light/dark و تطبیق Brand Book انجام شود |
| پایین | چهار PNG workspace حاشیه شفاف بسیار بزرگ دارند | برای UI بهتر است SVG رسمی با viewBox صحیح استفاده شود |

## فرضیات ثبت‌شده

1. PPTX منبع معنایی canonical و PDF هم‌نام فقط مرجع رندر است.
2. شماره اسلاید canonical همان ترتیب فیزیکی ۱ تا ۱۴۵ است.
3. اسلایدهای ۶۶–۸۹ با ترتیب ۶ پرسونا × ۴ محرک مدل می‌شوند؛ ترتیب driver از جابه‌جایی highlight و توالی اسلایدها استنباط شده و در review queue می‌ماند.
4. نام فنی پرسوناها فعلاً `persona-01..06` است تا ترجمه یا slug حدسی وارد سیستم نشود.
5. هیچ داده‌ای برای Cost Structure تولید نمی‌شود.
6. palette محصول از brief پیروی می‌کند؛ Brand Book برای قواعد هویت، logo، type و data viz مرجع است.

## review queue فاز ۱

1. تأیید مجوز Yekan Bakh و تهیه Acumin/DIN یا تصویب fallback.
2. تأیید اصلاح برچسب اسلایدهای ۳۷/۳۹/۴۱.
3. تأیید نام انگلیسی رسمی شش پرسونا و چهار محرک ارزش.
4. تعیین اینکه داده‌های پراکنده revenue/partners/resources باید به بلوک‌های partial نمایش داده شوند یا فقط cross-link باشند.
5. تأیید نمایش یا عدم نمایش اطلاعات تماس slide 145 در محصول عمومی.
"""


def adr_markdown() -> str:
    return """# ADR-0001: پشته پایه محصول

- وضعیت: پذیرفته برای شروع فاز ۱
- تاریخ: 2026-09-10

## زمینه

workspace کد یا پشته موجود ندارد. نیازها شامل route محلی‌شده، RTL/LTR، state پایدار در URL، جست‌وجو و فیلتر، modal deep-linkable، ingestion، validation و تست E2E است.

## تصمیم

Next.js با App Router، React، TypeScript strict و Tailwind CSS انتخاب می‌شود. محتوای MVP از JSON نرمال‌شده پشت repository abstraction خوانده می‌شود. Zod برای schema/validation، next-intl برای i18n، ECharts برای visualization، Framer Motion برای transition و Playwright/Vitest برای تست استفاده می‌شوند. Zustand فقط اگر state رابط از URL و component state فراتر رفت اضافه می‌شود؛ nuqs فقط در صورت نیاز به serialisation پیچیده queryها.

## پیامدها

- locale route و intercepting route برای modalها به‌صورت بومی قابل پیاده‌سازی است.
- MVP می‌تواند static-export compatible بماند، اما ingestion در build/CLI اجرا می‌شود.
- مهاجرت production به PostgreSQL/Prisma از طریق repository abstraction ممکن است.
- از افزودن GSAP تا اثبات نیاز به timeline/connector پیچیده خودداری می‌شود.

## گزینه ردشده

HTML/CSS/JavaScript تک‌فایلی به دلیل نبود routing، validation، i18n و pipeline قابل نگهداری رد شد. Vite SPA فقط fallback میزبانی است و هنوز نیازمند همان schema، URL state و i18n خواهد بود.
"""


def source_diff_markdown(deck: dict, pdf: dict) -> str:
    return f"""# گزارش تفاوت منبع PPTX و PDF

## نتیجه

نسخه PDF جایگزین منبع اصلی نیست. هر دو فایل ۱۴۵ واحد صفحه/اسلاید دارند و نام پایه آن‌ها یکسان است. PDF در `2026-09-06T11:53:58Z` و PPTX چهار ثانیه بعد در `2026-09-06T11:54:02Z` ثبت شده‌اند؛ این الگو با export هم‌زمان سازگار است و نشانه‌ای از نسخه محتوایی جدیدتر دیده نشد.

| ویژگی | PPTX | PDF |
|---|---:|---:|
| اسلاید/صفحه | {len(deck['slides'])} | {pdf['pageCount']} |
| اندازه فایل | {deck['source']['sizeBytes']:,} bytes | {pdf['source']['sizeBytes']:,} bytes |
| SHA-256 | `{deck['source']['sha256']}` | `{pdf['source']['sha256']}` |
| ساختار قابل استخراج | shape، table، connector، media relation | صفحه تخت + text layer |
| کاربرد canonical | محتوا و provenance | کنترل بصری |

## تفاوت‌های ساختاری

- PPTX دارای {sum(s['metrics']['shapeCount'] for s in deck['slides']):,} shape، {sum(s['metrics']['tableCount'] for s in deck['slides'])} جدول و {sum(s['metrics']['connectorCount'] for s in deck['slides'])} connector است؛ PDF این ساختارها را flatten می‌کند.
- ۱۳ SVG داخلی در PPTX از relationshipهای داخلی بارگیری می‌شوند. `python-pptx` metadata raster آن‌ها را decode نمی‌کند، ولی PDF آن‌ها را رندر کرده است.
- text layer فارسی PDF حروف هر واژه را در ترتیب معکوس برمی‌گرداند؛ بنابراین similarity متنی خام معیار version diff قابل اعتماد نیست. متن PPTX canonical باقی می‌ماند.
- اسلاید ۱۴۵ در slide shape متن ندارد، اما PDF پایان‌بندی برند و اطلاعات تماس را نشان می‌دهد؛ این محتوا از master/render می‌آید.

## کنترل بصری

هر ۱۴۵ صفحه در ۱۳ contact sheet مرور شد. صفحه حذف‌شده یا PDF اضافه مشاهده نشد. PDF برای QA هندسه، رنگ، جدول، SVG و پایان‌بندی نگهداری می‌شود؛ ادعای pixel-perfect equivalence تا زمان رندر مستقل PPTX در pipeline نهایی مطرح نمی‌شود.

داده ماشین‌خوان مقایسه در `artifacts/phase0/source-comparison.json` است. فیلد `tokenJaccard` به دلیل محدودیت bidi فارسی فقط diagnostic است و نباید به‌تنهایی تصمیم versioning بسازد.
"""


def source_manifest(deck: dict, pdf: dict, asset_records: list[dict]) -> dict:
    slides = []
    for slide in deck["slides"]:
        number = slide["slideNumber"]
        section_key, _ = section_for(number)
        slides.append(
            {
                "id": f"source-slide-{number:03d}",
                "file": deck["source"]["filename"],
                "slideNumber": number,
                "title": title_for(slide).replace("\\|", "|"),
                "sectionKey": section_key,
                "canvasBlock": canvas_block_for(number),
                "parentNodeCandidate": node_for(number),
                "disposition": disposition(number),
                "textHash": slide["textHash"],
                "shapeIds": [shape["shapeId"] for shape in slide["shapes"]],
                "metrics": slide["metrics"],
            }
        )
    return {
        "schemaVersion": "0.1.0-phase0",
        "generatedUtc": datetime.now(timezone.utc).isoformat(),
        "canonicalSource": deck["source"]["filename"],
        "visualCrossCheckSource": pdf["source"]["filename"],
        "security": {"absolutePathsIncluded": False, "clientSafePathsOnly": True},
        "assets": asset_records,
        "slides": slides,
    }


def main() -> None:
    DOCS.mkdir(parents=True, exist_ok=True)
    DATA.mkdir(parents=True, exist_ok=True)
    deck = json.loads(PRESENTATION.read_text(encoding="utf-8"))
    pdf = json.loads(PDF_DATA.read_text(encoding="utf-8"))
    assets = build_asset_records()

    outputs = {
        DOCS / "phase-0-audit.md": phase0_audit_markdown(deck, pdf, assets),
        DOCS / "source-diff.md": source_diff_markdown(deck, pdf),
        DOCS / "content-inventory.md": inventory_markdown(deck),
        DOCS / "data-mapping.md": mapping_markdown(deck),
        DOCS / "information-architecture.md": ia_markdown(),
        DOCS / "design-system.md": design_system_markdown(),
        DOCS / "assumptions-and-gaps.md": gaps_markdown(),
        DOCS / "architecture-decision-record.md": adr_markdown(),
    }
    for path, content in outputs.items():
        path.write_text(content.strip() + "\n", encoding="utf-8")

    manifest = source_manifest(deck, pdf, assets)
    (DATA / "source-manifest.json").write_text(json.dumps(manifest, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    (ARTIFACTS / "asset-inventory.json").write_text(json.dumps(assets, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
    print(json.dumps({"docs": [str(path.relative_to(ROOT)) for path in outputs], "slides": len(manifest["slides"]), "assets": len(assets)}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
