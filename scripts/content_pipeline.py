from __future__ import annotations

import argparse
import copy
import hashlib
import json
import re
import shutil
from collections import Counter
from datetime import datetime, timezone
from pathlib import Path

from generate_phase0_docs import canvas_block_for, disposition, node_for, section_for, title_for


ROOT = Path(__file__).resolve().parents[1]
ARTIFACTS = ROOT / "artifacts" / "phase0"
DATA_DIR = ROOT / "data"
CONTENT_DIR = ROOT / "content"
DOCS_DIR = ROOT / "docs"
PRESENTATION_PATH = ARTIFACTS / "presentation.json"
SOURCE_MANIFEST_PATH = DATA_DIR / "source-manifest.json"
OVERRIDES_PATH = CONTENT_DIR / "overrides.json"
REVIEW_QUEUE_PATH = CONTENT_DIR / "review-queue.json"
STATE_PATH = DATA_DIR / "ingestion-state.json"


SCHEMA_VERSION = "1.0.0"
SOURCE_FILE = "20260906-Simorgh-SA-V07.pptx"


SECTION_DEFS = [
    ("section-opportunity-context", "opportunity-context", "زمینه و تز فرصت", "Opportunity context and thesis", range(1, 5)),
    ("section-project-benchmarks", "project-and-benchmarks", "مسیر پروژه و بنچمارک", "Project path and benchmarks", range(5, 14)),
    ("section-business-model-foundation", "business-model-foundation", "مدل مفهومی و فرضیات", "Conceptual model and assumptions", range(14, 20)),
    ("section-customer-segments", "customer-segments", "بخش‌های مشتری و پرسوناها", "Customer segments and personas", range(20, 46)),
    ("section-value-propositions", "value-propositions", "ارزش پیشنهادی و نقشه ارزش", "Value propositions and value maps", range(46, 100)),
    ("section-channels", "channels", "کانال‌های مشتری", "Customer channels", range(100, 123)),
    ("section-customer-relationships", "customer-relationships", "ارتباط با مشتری", "Customer relationships", range(123, 145)),
    ("section-closing", "closing", "پایان‌بندی", "Closing", range(145, 146)),
]


BLOCK_DEFS = [
    ("canvas-block-key-partners", "key-partners", "شرکای کلیدی", "Key Partners", "partial", [15, 16, 122]),
    ("canvas-block-key-activities", "key-activities", "فعالیت‌های کلیدی", "Key Activities", "partial", [7, 15, 16]),
    ("canvas-block-key-resources", "key-resources", "منابع کلیدی", "Key Resources", "partial", [7, 99]),
    ("canvas-block-value-propositions", "value-propositions", "ارزش‌های پیشنهادی", "Value Propositions", "available", list(range(46, 100))),
    ("canvas-block-customer-relationships", "customer-relationships", "ارتباط با مشتری", "Customer Relationships", "available", list(range(123, 145))),
    ("canvas-block-channels", "channels", "کانال‌ها", "Channels", "available", list(range(100, 123))),
    ("canvas-block-customer-segments", "customer-segments", "بخش‌های مشتری", "Customer Segments", "available", list(range(20, 46))),
    ("canvas-block-cost-structure", "cost-structure", "ساختار هزینه", "Cost Structure", "not_provided", [7, 21, 47, 102]),
    ("canvas-block-revenue-streams", "revenue-streams", "جریان‌های درآمدی", "Revenue Streams", "partial", [10, 11, 98]),
]


PERSONAS = [
    ("persona-01", "persona-01", "کسب‌وکار تراز ایرانی", "Qualified Iranian Business"),
    ("persona-02", "persona-02", "کسب‌وکار تراز خارجی", "Qualified Foreign Business"),
    ("persona-03", "persona-03", "کسب‌وکار مشتاق", "Aspiring Business"),
    ("persona-04", "persona-04", "کسب‌وکار کنجکاو", "Exploratory Business"),
    ("persona-05", "persona-05", "خالق کسب‌وکار", "Business Creator"),
    ("persona-06", "persona-06", "سرمایه‌گذار", "Investor"),
]


DRIVERS = [
    ("value-driver-01", "value-driver-01", "هوشمندی و اعتبارسنجی فرصت", "Opportunity Intelligence and Validation"),
    ("value-driver-02", "value-driver-02", "ایجاد دسترسی مورداعتماد", "Creating Trusted Access"),
    ("value-driver-03", "value-driver-03", "تأمین و فعال‌سازی منابع و قابلیت‌ها", "Mobilizing Resources and Capabilities"),
    ("value-driver-04", "value-driver-04", "هماهنگ‌سازی و تبدیل فرصت به نتیجه", "Coordinating and Converting Opportunity into Outcomes"),
]


RELATIONSHIPS = [
    ("relationship-01", "relationship-01", "تراکنشی", "Transactional", 127),
    ("relationship-02", "relationship-02", "همراه / خدماتی", "Assisted / Service", 128),
    ("relationship-03", "relationship-03", "مشاوره‌ای", "Advisory", 129),
    ("relationship-04", "relationship-04", "مدیریت‌شده", "Managed", 130),
    ("relationship-05", "relationship-05", "مشارکتی / هم‌آفرینی", "Collaborative / Co-Creation", 131),
    ("relationship-06", "relationship-06", "شراکت راهبردی", "Strategic Partnership", 132),
    ("relationship-07", "relationship-07", "اکوسیستمی / پلتفرمی", "Ecosystem / Platform", 133),
]


EN_TITLES = {
    1: "Designing the business value, operating, and financial models",
    2: "Global capital-machine profitability through the Always on War strategy",
    3: "A more profitable source for the capital machine: ownership of digital networks and AI",
    4: "Iran as the missing link in the new playing field",
    5: "Project delivery path",
    6: "Business formation logic",
    7: "Business Model Canvas",
    8: "Review of initiatives analogous to Simorgh",
    9: "Enterprise Europe Network",
    10: "Revenue models — part 1",
    11: "Revenue models — part 2",
    12: "Benchmark value proposition — part 1",
    13: "Benchmark value proposition — part 2",
    14: "Simorgh business model",
    15: "Conceptual business model — base view",
    16: "Conceptual business model — shared backbone and culture",
    17: "Key business assumptions — part 1 of 3",
    18: "Key business assumptions — part 2 of 3",
    19: "Key business assumptions — part 3 of 3",
    20: "Customer segmentation",
    21: "Canvas view focused on Customer Segments",
    22: "Strategic customer-segmentation question",
    23: "Initial map of actors in the Simorgh ecosystem",
    24: "Customer-segmentation methodology",
    25: "Segmentation dimension — need",
    26: "Segmentation dimension — behavior",
    27: "Segmentation dimension — company characteristics",
    28: "Identified customer segments",
    29: "Key customer personas",
    42: "Customer-segmentation caveats",
    43: "Optional follow-up customer-segmentation analyses",
    44: "Customer Profile and Value Map method",
    45: "Risks in business-model design",
    46: "Simorgh value propositions",
    47: "Canvas view focused on Value Propositions",
    48: "Executive summary",
    49: "Index of jobs, pains, and gains",
    50: "Overview of customer jobs by persona",
    57: "Shared jobs across personas",
    58: "Customer-pain analysis",
    59: "Customer-gain analysis",
    60: "Opportunity matrix",
    61: "Strategic synthesis",
    62: "Sources and evidence",
    63: "Index of value drivers and value maps",
    64: "Value-creation reinforcing loop",
    65: "Core value-creation drivers",
    90: "Value proposition by persona",
    91: "Core value proposition",
    92: "Next action",
    93: "Minimum Viable Ecosystem (MVE)",
    94: "Meaningful Being",
    95: "Maturity and entry map for a foreign actor",
    96: "Being-led focus in the value chain",
    97: "Being versus Doing — operational definition",
    98: "Three monetization mechanisms for Being",
    99: "Twelve founder-asset dimensions in five clusters",
    100: "Customer channels",
    101: "Summary of previous work",
    102: "Canvas view focused on Channels",
    103: "Reference quote on ownership of customer relationships",
    104: "Customer-channel definition and importance",
    105: "Channel classification and five-phase model",
    106: "Channel-analysis workflow",
    113: "Non-customer referral and Enabler channels",
    114: "Channel taxonomy by ownership and access mode",
    115: "Channel scoring and prioritization",
    116: "Channel assumptions, uncertainties, and risks",
    117: "Three channels with the greatest ecosystem-wide impact",
    118: "Channel actions for the start of the operating phase",
    119: "Channel sources and digital benchmarks",
    120: "Appendix",
    121: "Ecosystem patterns in management literature",
    122: "Ecosystem roles in the business",
    123: "Customer Relationships",
    124: "Customer-relationship architecture — contents",
    125: "Relationship-design framework",
    126: "Selected relationship model",
    134: "Relationship-archetype summary",
    135: "Two relationship-decision criteria",
    136: "Final relationship matrix",
    143: "Customer-relationship conclusions",
    144: "Customer-relationship sources",
    145: "Brand closing and contact information",
}


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as source:
        for chunk in iter(lambda: source.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def slugify(value: str) -> str:
    value = value.casefold().replace("_", "-")
    value = re.sub(r"[^a-z0-9-]+", "-", value)
    return re.sub(r"-+", "-", value).strip("-")


def english_title(slide_number: int) -> str:
    if slide_number in EN_TITLES:
        return EN_TITLES[slide_number]
    if 30 <= slide_number <= 41:
        persona = (slide_number - 30) // 2 + 1
        part = (slide_number - 30) % 2 + 1
        suffix = "source repeats the part 1 of 2 label" if slide_number in {37, 39, 41} else f"part {part} of 2"
        return f"Customer profile — Persona {persona} — {suffix}"
    if 51 <= slide_number <= 56:
        return f"Jobs, pains, and gains map — Persona {slide_number - 50}"
    if 66 <= slide_number <= 89:
        persona = (slide_number - 66) // 4 + 1
        driver = (slide_number - 66) % 4
        return f"Value map — Persona {persona} — {DRIVERS[driver][3]}"
    if 107 <= slide_number <= 112:
        return f"Deep channel analysis — Persona {slide_number - 106}"
    if 127 <= slide_number <= 133:
        return f"Relationship archetype {slide_number - 126} of 7 — {RELATIONSHIPS[slide_number - 127][3]}"
    if 137 <= slide_number <= 142:
        return f"Relationship allocation — Persona {slide_number - 136} of 6"
    return f"Source slide {slide_number}"


def source_for(slide_numbers: list[int], slide_lookup: dict[int, dict]) -> dict:
    shape_ids = []
    for number in slide_numbers:
        shape_ids.extend(shape["shapeId"] for shape in slide_lookup[number]["shapes"])
    return {"file": SOURCE_FILE, "slideNumbers": slide_numbers, "shapeIds": list(dict.fromkeys(shape_ids))}


def make_node(
    *, node_id: str, slug: str, node_type: str, status: str, title: str,
    source: dict, locale: str, parent_id: str | None = None, summary: str | None = None,
    body: str | None = None, related_ids: list[str] | None = None,
    persona_ids: list[str] | None = None, filter_tags: list[str] | None = None,
    visualization: dict | None = None, translation_status: str = "complete",
) -> dict:
    node = {
        "id": node_id,
        "slug": slug,
        "type": node_type,
        "status": status,
        "title": title,
        "parentId": parent_id,
        "relatedIds": related_ids or [],
        "personaIds": persona_ids or [],
        "filterTags": list(dict.fromkeys(filter_tags or [])),
        "source": source,
        "translationStatus": translation_status,
    }
    if summary:
        node["summary"] = summary
    if body:
        node["body"] = body
    if visualization:
        node["visualization"] = visualization
    return node


def section_id_for(slide_number: int) -> str:
    section_key, _ = section_for(slide_number)
    return next(item[0] for item in SECTION_DEFS if item[1] == section_key)


def block_id_for(slide_number: int) -> str | None:
    block_key = canvas_block_for(slide_number)
    if block_key == "business-model-root":
        return None
    return f"canvas-block-{block_key}"


def persona_ids_for(slide_number: int) -> list[str]:
    if 30 <= slide_number <= 41:
        return [f"persona-{((slide_number - 30) // 2 + 1):02d}"]
    if 51 <= slide_number <= 56:
        return [f"persona-{slide_number - 50:02d}"]
    if 66 <= slide_number <= 89:
        return [f"persona-{((slide_number - 66) // 4 + 1):02d}"]
    if 107 <= slide_number <= 112:
        return [f"persona-{slide_number - 106:02d}"]
    if 137 <= slide_number <= 142:
        return [f"persona-{slide_number - 136:02d}"]
    if slide_number in {29, 42, 43, 44, 45, 50, 57, 58, 59, 60, 61, 62, 90, 91, 114, 115, 116, 117, 118, 134, 135, 136, 143}:
        return [item[0] for item in PERSONAS]
    return []


def related_ids_for(slide_number: int) -> list[str]:
    related = persona_ids_for(slide_number)
    if 66 <= slide_number <= 89:
        related.append(f"value-driver-{((slide_number - 66) % 4 + 1):02d}")
    if 127 <= slide_number <= 133:
        related.append(f"relationship-{slide_number - 126:02d}")
    if slide_number in {134, 135, 136, 143, 144}:
        related.extend(item[0] for item in RELATIONSHIPS)
    return list(dict.fromkeys(related))


def node_type_for(slide: dict) -> str:
    number = slide["slideNumber"]
    if number in {60, 136}:
        return "matrix"
    if slide["metrics"]["tableCount"]:
        return "table"
    if slide["contentType"] == "process-or-relationship":
        return "chart"
    if slide["contentType"] == "mixed":
        return "mixed"
    if number in {1, 5, 8, 14, 20, 46, 49, 63, 93, 100, 120, 123, 124, 145}:
        return "topic"
    return "insight"


def extracted_tables(slide: dict) -> list[dict]:
    tables = []
    for index, shape in enumerate((shape for shape in slide["shapes"] if shape.get("table")), start=1):
        rows = shape["table"].get("rows", [])
        if not rows:
            continue
        tables.append({
            "id": f"slide-{slide['slideNumber']:03d}-table-{index}",
            "columns": rows[0],
            "rows": rows[1:],
            "contentLanguage": "fa",
        })
    return tables


CHANNEL_NAMES_EN = [
    "Founder and core-team personal network",
    "Chambers of commerce and trade associations",
    "Content and coverage in reputable business media",
    "Iranians abroad",
    "Cross-referrals between business lines (internal)",
    "International partner brand",
    "Digital self-assessment tool",
    "Trade-office network",
    "International trade event or delegation",
    "Board members, CEOs, and external advisers network",
    "Two-sided digital transaction platform",
]


CHANNEL_DIMENSION_LABELS = {
    "fa": ["دسترسی", "هزینه جذب", "تناسب اعتماد", "کنترل‌پذیری", "مقیاس‌پذیری"],
    "en": ["Access", "Acquisition cost", "Trust fit", "Controllability", "Scalability"],
}


QUALITATIVE_EN = {
    "کم": "Low",
    "پایین": "Low",
    "پایین (زمانی)": "Low (time)",
    "بسیار پایین": "Very low",
    "متوسط": "Medium",
    "متوسط-بالا": "Medium–high",
    "پایین-متوسط": "Low–medium",
    "بالا": "High",
    "بسیار بالا": "Very high",
    "پایین*": "Low*",
    "بالا (بالقوه)": "High (potential)",
    "پایین پس از ساخت": "Low after build",
    "شبکه بالا (بالقوه)": "High network access (potential)",
    "بالا (ساخت اولیه)": "High (initial build)",
}


def channel_priority_visualization(slide: dict, locale: str) -> dict:
    table = extracted_tables(slide)[0]
    rows = []
    digit_map = str.maketrans("۱۲۳۴۵۶", "123456")
    for index, source_row in enumerate(table["rows"], start=1):
        source_name = source_row[6]
        persona_marker = re.search(r"\(پ([۱-۶1-6،,]+)\)\s*$", source_name)
        persona_numbers = re.findall(r"[۱-۶1-6]", persona_marker.group(1)) if persona_marker else []
        persona_ids = [f"persona-{int(value.translate(digit_map)):02d}" for value in persona_numbers]
        visible_source_name = re.sub(r"\s*\(پ[۱-۶1-6،,]+\)\s*$", "", source_name).strip()
        values = source_row[:5]
        rows.append({
            "id": f"channel-priority-{index:02d}",
            "label": visible_source_name if locale == "fa" else CHANNEL_NAMES_EN[index - 1],
            "sourceLabel": visible_source_name,
            "priority": int(source_row[5]),
            "personaIds": persona_ids,
            "dimensions": [
                {
                    "id": key,
                    "label": CHANNEL_DIMENSION_LABELS[locale][dimension_index],
                    "value": value if locale == "fa" else QUALITATIVE_EN.get(value, value),
                    "sourceValue": value,
                }
                for dimension_index, (key, value) in enumerate(zip(
                    ["access", "acquisition-cost", "trust-fit", "controllability", "scalability"],
                    values,
                ))
            ],
        })
    return {
        "kind": "ranked-dot-plot",
        "renderer": "echarts",
        "interactive": True,
        "hierarchy": ["channel", "score-dimension", "evidence"],
        "sourceNodeId": "slide-115",
        "rows": rows,
        "tables": [table],
        "contentLanguage": locale,
        "translationStatus": "source" if locale == "fa" else "working_terminology",
    }


def relationship_matrix_visualization(slide: dict, locale: str) -> dict:
    fa_labels = {
        "A": "تراکنشی",
        "B": "همراه / اختصاصی",
        "C": "مشاوره‌ای / محصولی‌شده",
        "D": "مدیریت‌شده + مشارکتی",
        "E": "شراکت راهبردی + اکوسیستمی",
    }
    en_labels = {
        "A": "Transactional",
        "B": "Assisted / dedicated",
        "C": "Advisory / productized",
        "D": "Managed + collaborative",
        "E": "Strategic partnership + ecosystem",
    }
    relationships = {
        "A": ["relationship-01"],
        "B": ["relationship-02"],
        "C": ["relationship-03"],
        "D": ["relationship-04", "relationship-05"],
        "E": ["relationship-06", "relationship-07"],
    }
    coordinates = {"A": [1, 1], "B": [1, 2], "C": [2, 1], "D": [2, 2], "E": [3, 3]}
    labels = fa_labels if locale == "fa" else en_labels
    return {
        "kind": "qualitative-matrix",
        "renderer": "echarts",
        "interactive": True,
        "hierarchy": ["matrix-zone", "relationship-archetype", "persona-allocation", "evidence"],
        "sourceNodeId": "slide-136",
        "axes": {
            "x": "پیچیدگی نیاز" if locale == "fa" else "Need complexity",
            "y": "ارزش بالقوه مشتری" if locale == "fa" else "Potential customer value",
            "low": "کم" if locale == "fa" else "Low",
            "high": "زیاد" if locale == "fa" else "High",
        },
        "zones": [
            {
                "id": zone_id,
                "label": labels[zone_id],
                "x": coordinates[zone_id][0],
                "y": coordinates[zone_id][1],
                "relationshipIds": relationships[zone_id],
                "allocationIds": [f"slide-{number:03d}" for number in range(137, 143)],
            }
            for zone_id in ["A", "B", "C", "D", "E"]
        ],
        "contentLanguage": locale,
        "translationStatus": "source" if locale == "fa" else "working_terminology",
    }


def visualization_for(slide: dict, locale: str) -> dict | None:
    number = slide["slideNumber"]
    if number == 115:
        return channel_priority_visualization(slide, locale)
    if number == 136:
        return relationship_matrix_visualization(slide, locale)
    if number in {7, 21, 47, 102}:
        return {"kind": "business-model-canvas", "interactive": True, "hierarchy": ["canvas-block", "topic", "data-item"]}
    if number == 60:
        return {"kind": "matrix", "interactive": True}
    if number == 64:
        return {"kind": "reinforcing-loop", "interactive": True}
    if number == 95:
        return {"kind": "maturity-map", "interactive": True}
    if number in {15, 16, 121, 122}:
        return {"kind": "relationship-map", "interactive": True}
    if slide["metrics"]["tableCount"]:
        return {
            "kind": "table",
            "interactive": True,
            "sortable": True,
            "sourceVisible": True,
            "tables": extracted_tables(slide),
            "contentLanguage": "fa",
            "translationStatus": "source" if locale == "fa" else "source_only",
        }
    if slide["metrics"]["connectorCount"]:
        return {"kind": "diagram", "interactive": True}
    return None


def extract_source_english(text: str) -> str | None:
    latin_words = re.findall(r"\b[A-Za-z][A-Za-z0-9+&/().,'’:-]*\b", text)
    total_words = re.findall(r"[A-Za-z\u0600-\u06ff]+", text)
    if total_words and len(latin_words) / len(total_words) >= 0.58:
        return text
    return None


def build_nodes(locale: str, presentation: dict) -> list[dict]:
    slides = presentation["slides"]
    slide_lookup = {slide["slideNumber"]: slide for slide in slides}
    nodes = []

    root_title = "اکوسیستم فرصت ایران" if locale == "fa" else "The Opportunity Ecosystem in Iran"
    nodes.append(make_node(
        node_id="ecosystem-root", slug="opportunity-ecosystem-iran", node_type="topic", status="available",
        title=root_title, locale=locale, parent_id=None, source=source_for(list(range(1, 146)), slide_lookup),
        summary=("مدل داده ساختاریافته سند کسب‌وکار و اکوسیستم فرصت ایران" if locale == "fa" else "Structured content model for the Opportunity Ecosystem in Iran"),
    ))

    for node_id, slug, fa_title, en_title, numbers in SECTION_DEFS:
        nodes.append(make_node(
            node_id=node_id, slug=slug, node_type="topic", status="available",
            title=fa_title if locale == "fa" else en_title, locale=locale,
            parent_id="ecosystem-root", source=source_for(list(numbers), slide_lookup),
            filter_tags=[f"section:{slug}"],
        ))

    for node_id, slug, fa_title, en_title, status, numbers in BLOCK_DEFS:
        nodes.append(make_node(
            node_id=node_id, slug=slug, node_type="canvas-block", status=status,
            title=fa_title if locale == "fa" else en_title, locale=locale,
            parent_id="ecosystem-root", source=source_for(numbers, slide_lookup),
            filter_tags=[f"canvas-block:{slug}", f"status:{status}"],
            visualization={"kind": "canvas-block", "interactive": status != "not_provided"},
        ))

    persona_sources = {
        index: [29, 30 + (index - 1) * 2, 31 + (index - 1) * 2, 50 + index, *range(66 + (index - 1) * 4, 70 + (index - 1) * 4), 106 + index, 136 + index]
        for index in range(1, 7)
    }
    for index, (node_id, slug, fa_title, en_title) in enumerate(PERSONAS, start=1):
        nodes.append(make_node(
            node_id=node_id, slug=slug, node_type="persona", status="available",
            title=fa_title if locale == "fa" else en_title, locale=locale,
            parent_id="canvas-block-customer-segments", source=source_for(persona_sources[index], slide_lookup),
            filter_tags=[f"persona:{node_id}", "canvas-block:customer-segments"],
            translation_status="complete" if locale == "fa" else "working_terminology",
        ))

    for index, (node_id, slug, fa_title, en_title) in enumerate(DRIVERS, start=1):
        numbers = [65] + [66 + (persona - 1) * 4 + index - 1 for persona in range(1, 7)]
        nodes.append(make_node(
            node_id=node_id, slug=slug, node_type="topic", status="available",
            title=fa_title if locale == "fa" else en_title, locale=locale,
            parent_id="canvas-block-value-propositions", source=source_for(numbers, slide_lookup),
            related_ids=[item[0] for item in PERSONAS],
            filter_tags=[f"value-driver:{node_id}", "canvas-block:value-propositions"],
            translation_status="complete" if locale == "fa" else "working_terminology",
        ))

    for node_id, slug, fa_title, en_title, slide_number in RELATIONSHIPS:
        nodes.append(make_node(
            node_id=node_id, slug=slug, node_type="topic", status="available",
            title=fa_title if locale == "fa" else en_title, locale=locale,
            parent_id="canvas-block-customer-relationships", source=source_for([slide_number, 134], slide_lookup),
            filter_tags=[f"relationship:{node_id}", "canvas-block:customer-relationships"],
        ))

    for slide in slides:
        number = slide["slideNumber"]
        section_id = section_id_for(number)
        block_id = block_id_for(number)
        parent_id = block_id or section_id
        fa_title = title_for(slide).replace("\\|", "|")
        body = slide["text"] if locale == "fa" else extract_source_english(slide["text"])
        translation_status = "source" if locale == "fa" else ("source_english" if body else "title_only")
        status = "partial" if number == 145 else "available"
        tags = [f"section:{section_for(number)[0]}", f"source-slide:{number:03d}", f"disposition:{disposition(number)}"]
        if block_id:
            tags.append(f"canvas-block:{block_id.removeprefix('canvas-block-')}")
        personas = persona_ids_for(number)
        tags.extend(f"persona:{persona_id}" for persona_id in personas)
        if 66 <= number <= 89:
            tags.append(f"value-driver:value-driver-{((number - 66) % 4 + 1):02d}")
        if 127 <= number <= 133:
            tags.append(f"relationship:relationship-{number - 126:02d}")
        nodes.append(make_node(
            node_id=f"slide-{number:03d}", slug=f"slide-{number:03d}", node_type=node_type_for(slide), status=status,
            title=fa_title if locale == "fa" else english_title(number), locale=locale,
            parent_id=parent_id, summary=(slide["text"][:320] if locale == "fa" and slide["text"] else None),
            body=body, related_ids=related_ids_for(number), persona_ids=personas,
            filter_tags=tags, source=source_for([number], slide_lookup),
            visualization=visualization_for(slide, locale), translation_status=translation_status,
        ))

    return nodes


def apply_overrides(nodes: list[dict], locale: str, overrides: dict) -> list[dict]:
    locale_overrides = overrides.get(locale, {})
    by_id = {node["id"]: node for node in nodes}
    for node_id, patch in locale_overrides.items():
        if node_id not in by_id:
            raise ValueError(f"Override references missing node: {locale}/{node_id}")
        protected = {"id", "slug", "source"}
        if protected & patch.keys():
            raise ValueError(f"Override cannot change protected fields {sorted(protected)}: {locale}/{node_id}")
        by_id[node_id].update(copy.deepcopy(patch))
    return nodes


def build_payload(locale: str, presentation: dict, source_hash: str, overrides: dict) -> dict:
    nodes = apply_overrides(build_nodes(locale, presentation), locale, overrides)
    return {
        "schemaVersion": SCHEMA_VERSION,
        "locale": locale,
        "direction": "rtl" if locale == "fa" else "ltr",
        "generatedUtc": datetime.now(timezone.utc).isoformat(),
        "sourceRevision": source_hash,
        "nodes": nodes,
    }


def stable_payload_hash(payload: dict) -> str:
    normalized = copy.deepcopy(payload)
    normalized.pop("generatedUtc", None)
    raw = json.dumps(normalized, ensure_ascii=False, sort_keys=True, separators=(",", ":"))
    return hashlib.sha256(raw.encode("utf-8")).hexdigest()


def compute_diff(old: dict | None, new: dict) -> dict:
    old_nodes = {node["id"]: node for node in (old or {}).get("nodes", [])}
    new_nodes = {node["id"]: node for node in new["nodes"]}
    added = sorted(new_nodes.keys() - old_nodes.keys())
    removed = sorted(old_nodes.keys() - new_nodes.keys())
    changed = []
    for node_id in sorted(new_nodes.keys() & old_nodes.keys()):
        if old_nodes[node_id] != new_nodes[node_id]:
            fields = sorted(key for key in set(old_nodes[node_id]) | set(new_nodes[node_id]) if old_nodes[node_id].get(key) != new_nodes[node_id].get(key))
            changed.append({"id": node_id, "fields": fields})
    return {"added": added, "removed": removed, "changed": changed}


def write_json(path: Path, value: object) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def build_review_queue(fa: dict, en: dict) -> dict:
    items = []
    for node in en["nodes"]:
        if node["translationStatus"] in {"title_only", "working_terminology"}:
            items.append({
                "id": f"translation:{node['id']}",
                "kind": "translation",
                "nodeId": node["id"],
                "status": "open",
                "reason": node["translationStatus"],
                "sourceSlides": node["source"]["slideNumbers"],
            })
    for number in (37, 39, 41):
        items.append({"id": f"source-label:slide-{number:03d}", "kind": "source-label", "nodeId": f"slide-{number:03d}", "status": "open", "reason": "source repeats 1/2 on the continuation slide", "sourceSlides": [number]})
    for number in (20, 49, 63):
        items.append({"id": f"source-numbering:slide-{number:03d}", "kind": "source-numbering", "nodeId": f"slide-{number:03d}", "status": "open", "reason": "internal TOC numbering differs from physical slide order", "sourceSlides": [number]})
    items.append({"id": "font-license:yekan-bakh", "kind": "asset-license", "nodeId": None, "status": "open", "reason": "font archive has no bundled license file", "sourceSlides": []})
    return {"schemaVersion": "1.0.0", "generatedUtc": datetime.now(timezone.utc).isoformat(), "items": items}


def split_runtime(payload: dict) -> dict[str, object]:
    nodes = payload["nodes"]
    by_id = {node["id"]: node for node in nodes}
    canvas_ids = ["ecosystem-root"] + [item[0] for item in BLOCK_DEFS]
    files: dict[str, object] = {
        "canvas.json": {"locale": payload["locale"], "root": by_id["ecosystem-root"], "blocks": [by_id[node_id] for node_id in canvas_ids[1:]]},
        "filters.json": {
            "locale": payload["locale"],
            "logic": {"withinFacet": "OR", "betweenFacets": "AND"},
            "facets": {
                "personas": [by_id[item[0]] for item in PERSONAS],
                "valueDrivers": [by_id[item[0]] for item in DRIVERS],
                "relationships": [by_id[item[0]] for item in RELATIONSHIPS],
                "statuses": ["available", "partial", "planned", "not_provided"],
            },
        },
        "index.json": {
            "schemaVersion": payload["schemaVersion"], "locale": payload["locale"],
            "sourceRevision": payload["sourceRevision"], "nodeIds": [node["id"] for node in nodes],
        },
    }
    for block_id, slug, *_ in BLOCK_DEFS:
        block_nodes = [node for node in nodes if node["id"] == block_id or node.get("parentId") == block_id]
        files[f"blocks/{slug}.json"] = {"locale": payload["locale"], "block": by_id[block_id], "nodes": block_nodes}
    structural = set(canvas_ids) | {item[0] for item in SECTION_DEFS}
    for node in nodes:
        if node["id"] not in structural:
            files[f"data-items/{node['id']}.json"] = node
    return files


def write_runtime(payload: dict) -> None:
    locale_dir = CONTENT_DIR / payload["locale"]
    files = split_runtime(payload)
    for relative, value in files.items():
        write_json(locale_dir / relative, value)


def archive_previous(payloads: dict[str, dict | None]) -> str | None:
    existing = {locale: payload for locale, payload in payloads.items() if payload}
    if not existing:
        return None
    revision = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    archive = DATA_DIR / "versions" / revision
    archive.mkdir(parents=True, exist_ok=True)
    for locale, payload in existing.items():
        write_json(archive / f"content.{locale}.json", payload)
    return revision


def load_optional(path: Path) -> dict | None:
    return json.loads(path.read_text(encoding="utf-8")) if path.exists() else None


def validate_payloads(fa: dict, en: dict, *, allow_translation_gaps: bool = True) -> dict:
    errors = []
    warnings = []
    fa_nodes = {node["id"]: node for node in fa["nodes"]}
    en_nodes = {node["id"]: node for node in en["nodes"]}
    if set(fa_nodes) != set(en_nodes):
        errors.append("Locale node ID sets differ")
    for node_id in sorted(set(fa_nodes) & set(en_nodes)):
        left, right = fa_nodes[node_id], en_nodes[node_id]
        if left["slug"] != right["slug"]:
            errors.append(f"Slug mismatch: {node_id}")
        if left["source"] != right["source"]:
            errors.append(f"Source mismatch: {node_id}")
        for locale, node, lookup in (("fa", left, fa_nodes), ("en", right, en_nodes)):
            for ref in ([node.get("parentId")] if node.get("parentId") else []) + node.get("relatedIds", []) + node.get("personaIds", []):
                if ref not in lookup:
                    errors.append(f"Broken reference {locale}/{node_id} -> {ref}")
            if not node.get("title"):
                errors.append(f"Missing title: {locale}/{node_id}")
            visualization = node.get("visualization", {})
            if visualization.get("kind") == "ranked-dot-plot":
                rows = visualization.get("rows", [])
                if len(rows) != 11 or len({row.get("id") for row in rows}) != 11:
                    errors.append(f"Invalid channel visualization rows: {locale}/{node_id}")
                for row in rows:
                    if row.get("priority") not in {1, 2, 3, 4} or len(row.get("dimensions", [])) != 5:
                        errors.append(f"Invalid channel priority/dimensions: {locale}/{node_id}/{row.get('id')}")
                    for persona_id in row.get("personaIds", []):
                        if persona_id not in lookup:
                            errors.append(f"Broken visualization persona {locale}/{node_id} -> {persona_id}")
            if visualization.get("kind") == "qualitative-matrix":
                zones = visualization.get("zones", [])
                if {zone.get("id") for zone in zones} != {"A", "B", "C", "D", "E"}:
                    errors.append(f"Invalid relationship matrix zones: {locale}/{node_id}")
                for zone in zones:
                    for ref in zone.get("relationshipIds", []) + zone.get("allocationIds", []):
                        if ref not in lookup:
                            errors.append(f"Broken visualization reference {locale}/{node_id} -> {ref}")
        if right["translationStatus"] in {"title_only", "working_terminology"}:
            warnings.append(f"Translation review required: {node_id}")
    covered = sorted({number for node in fa_nodes.values() for number in node["source"]["slideNumbers"]})
    if covered != list(range(1, 146)):
        errors.append("Source coverage is not exactly slides 1..145")
    public_text = json.dumps({"fa": fa, "en": en}, ensure_ascii=False)
    if re.search(r"[A-Za-z]:[\\/]", public_text):
        errors.append("Absolute Windows path leaked into runtime content")
    if warnings and not allow_translation_gaps:
        errors.extend(warnings)
    return {
        "valid": not errors,
        "errors": errors,
        "warnings": warnings,
        "stats": {
            "faNodes": len(fa_nodes), "enNodes": len(en_nodes), "coveredSlides": len(covered),
            "translationComplete": sum(1 for node in en_nodes.values() if node["translationStatus"] in {"complete", "source_english"}),
            "translationReview": sum(1 for node in en_nodes.values() if node["translationStatus"] in {"title_only", "working_terminology"}),
        },
    }


def ensure_source_current(source_manifest: dict) -> str:
    deck_path = ROOT / "Data" / SOURCE_FILE
    current_hash = sha256(deck_path)
    expected = next(asset["sha256"] for asset in source_manifest["assets"] if asset["filename"] == SOURCE_FILE and asset["role"] == "primary-content")
    if current_hash != expected:
        raise SystemExit("Source PPTX changed since phase-0 extraction. Re-run scripts/phase0_extract.py and generate_phase0_docs.py first.")
    return current_hash


def run_build(dry_run: bool) -> dict:
    presentation = json.loads(PRESENTATION_PATH.read_text(encoding="utf-8"))
    source_manifest = json.loads(SOURCE_MANIFEST_PATH.read_text(encoding="utf-8"))
    source_hash = ensure_source_current(source_manifest)
    overrides = load_optional(OVERRIDES_PATH) or {"schemaVersion": "1.0.0", "fa": {}, "en": {}}
    old_payloads = {locale: load_optional(DATA_DIR / f"content.{locale}.json") for locale in ("fa", "en")}
    payloads = {locale: build_payload(locale, presentation, source_hash, overrides) for locale in ("fa", "en")}
    validation = validate_payloads(payloads["fa"], payloads["en"])
    diffs = {locale: compute_diff(old_payloads[locale], payloads[locale]) for locale in ("fa", "en")}
    result = {"dryRun": dry_run, "validation": validation, "diff": diffs}
    if not validation["valid"]:
        return result
    if dry_run:
        return result

    archive_revision = archive_previous(old_payloads)
    for locale, payload in payloads.items():
        write_json(DATA_DIR / f"content.{locale}.json", payload)
        write_runtime(payload)
    review_queue = build_review_queue(payloads["fa"], payloads["en"])
    write_json(REVIEW_QUEUE_PATH, review_queue)
    write_json(DATA_DIR / "content-diff.json", diffs)
    state = {
        "schemaVersion": SCHEMA_VERSION,
        "updatedUtc": datetime.now(timezone.utc).isoformat(),
        "source": {"file": SOURCE_FILE, "sha256": source_hash},
        "contentHashes": {locale: stable_payload_hash(payload) for locale, payload in payloads.items()},
        "archiveRevision": archive_revision,
        "overrideHash": sha256(OVERRIDES_PATH) if OVERRIDES_PATH.exists() else None,
    }
    write_json(STATE_PATH, state)
    result["archiveRevision"] = archive_revision
    result["reviewQueueItems"] = len(review_queue["items"])
    return result


def command_validate(strict_translations: bool) -> dict:
    fa = load_optional(DATA_DIR / "content.fa.json")
    en = load_optional(DATA_DIR / "content.en.json")
    if not fa or not en:
        return {"valid": False, "errors": ["Aggregated locale files are missing"], "warnings": [], "stats": {}}
    result = validate_payloads(fa, en, allow_translation_gaps=not strict_translations)
    for locale, payload in (("fa", fa), ("en", en)):
        expected_files = split_runtime(payload)
        for relative, expected in expected_files.items():
            path = CONTENT_DIR / locale / relative
            if not path.exists():
                result["errors"].append(f"Missing runtime file: content/{locale}/{relative}")
                continue
            actual = json.loads(path.read_text(encoding="utf-8"))
            if actual != expected:
                result["errors"].append(f"Runtime file out of sync: content/{locale}/{relative}")
    result["valid"] = not result["errors"]
    return result


def command_diff() -> dict:
    presentation = json.loads(PRESENTATION_PATH.read_text(encoding="utf-8"))
    source_manifest = json.loads(SOURCE_MANIFEST_PATH.read_text(encoding="utf-8"))
    source_hash = ensure_source_current(source_manifest)
    overrides = load_optional(OVERRIDES_PATH) or {"schemaVersion": "1.0.0", "fa": {}, "en": {}}
    return {
        locale: compute_diff(load_optional(DATA_DIR / f"content.{locale}.json"), build_payload(locale, presentation, source_hash, overrides))
        for locale in ("fa", "en")
    }


def main() -> None:
    parser = argparse.ArgumentParser(description="Opportunity Ecosystem content ingestion pipeline")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("ingest")
    subparsers.add_parser("dry-run")
    validate_parser = subparsers.add_parser("validate")
    validate_parser.add_argument("--strict-translations", action="store_true")
    subparsers.add_parser("diff")
    args = parser.parse_args()

    if args.command == "ingest":
        result = run_build(False)
    elif args.command == "dry-run":
        result = run_build(True)
    elif args.command == "validate":
        result = command_validate(args.strict_translations)
    else:
        result = command_diff()
    print(json.dumps(result, ensure_ascii=False, indent=2))
    if args.command == "validate" and not result.get("valid", False):
        raise SystemExit(1)
    if args.command in {"ingest", "dry-run"} and not result["validation"]["valid"]:
        raise SystemExit(1)


if __name__ == "__main__":
    main()
