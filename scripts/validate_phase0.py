from __future__ import annotations

import json
import re
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]


def load_json(path: Path):
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> None:
    deck = load_json(ROOT / "artifacts" / "phase0" / "presentation.json")
    pdf = load_json(ROOT / "artifacts" / "phase0" / "pdf.json")
    manifest = load_json(ROOT / "data" / "source-manifest.json")
    inventory = (ROOT / "docs" / "content-inventory.md").read_text(encoding="utf-8")
    mapping = (ROOT / "docs" / "data-mapping.md").read_text(encoding="utf-8")

    inventory_rows = re.findall(r"^\| \d+ \|", inventory, flags=re.MULTILINE)
    mapping_rows = re.findall(r"^\| \d+ \|", mapping, flags=re.MULTILINE)
    manifest_text = json.dumps(manifest, ensure_ascii=False)

    checks = {
        "deck_slides_145": len(deck["slides"]) == 145,
        "pdf_pages_145": pdf["pageCount"] == 145,
        "manifest_slides_145": len(manifest["slides"]) == 145,
        "manifest_sequence_complete": [s["slideNumber"] for s in manifest["slides"]] == list(range(1, 146)),
        "inventory_rows_145": len(inventory_rows) == 145,
        "mapping_rows_145": len(mapping_rows) == 145,
        "manifest_has_no_absolute_windows_paths": re.search(r"[A-Za-z]:[\\/]", manifest_text) is None,
        "all_manifest_titles_present": all(s["title"].strip() for s in manifest["slides"]),
        "all_shapes_have_ids": all(all(shape["shapeId"] for shape in slide["shapes"]) for slide in deck["slides"]),
    }

    failures = [name for name, passed in checks.items() if not passed]
    print(json.dumps({
        "checks": checks,
        "disposition": dict(Counter(s["disposition"] for s in manifest["slides"])),
        "inventoryRows": len(inventory_rows),
        "mappingRows": len(mapping_rows),
        "manifestAssets": len(manifest["assets"]),
    }, ensure_ascii=False, indent=2))
    if failures:
        raise SystemExit("Validation failed: " + ", ".join(failures))


if __name__ == "__main__":
    main()
