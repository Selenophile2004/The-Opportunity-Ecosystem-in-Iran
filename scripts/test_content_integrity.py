"""Final integrity checks for the file-backed content repository.

These tests deliberately use only Python's standard library so they can run in CI
without adding a second package manager to the project.
"""

from __future__ import annotations

import hashlib
import json
import re
import unittest
from collections import Counter
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
DATA = ROOT / "Data"
CONTENT = ROOT / "content"
EXPECTED_SLIDES = set(range(1, 146))
ALLOWED_DISPOSITIONS = {"imported", "contextual", "visual-only", "duplicate", "excluded-with-reason"}


def read_json(path: Path) -> dict:
    return json.loads(path.read_text(encoding="utf-8"))


class ContentIntegrityTests(unittest.TestCase):
    @classmethod
    def setUpClass(cls) -> None:
        cls.fa = read_json(DATA / "content.fa.json")
        cls.en = read_json(DATA / "content.en.json")
        cls.manifest = read_json(DATA / "source-manifest.json")
        cls.fa_nodes = {node["id"]: node for node in cls.fa["nodes"]}
        cls.en_nodes = {node["id"]: node for node in cls.en["nodes"]}

    def test_locales_have_one_to_one_node_identity(self) -> None:
        self.assertEqual(180, len(self.fa_nodes))
        self.assertEqual(set(self.fa_nodes), set(self.en_nodes))
        self.assertEqual("rtl", self.fa["direction"])
        self.assertEqual("ltr", self.en["direction"])
        for node_id in self.fa_nodes:
            self.assertEqual(self.fa_nodes[node_id]["slug"], self.en_nodes[node_id]["slug"])
            self.assertEqual(self.fa_nodes[node_id]["source"], self.en_nodes[node_id]["source"])

    def test_relationships_resolve_and_source_references_are_bounded(self) -> None:
        ids = set(self.fa_nodes)
        for locale_nodes in (self.fa_nodes, self.en_nodes):
            for node in locale_nodes.values():
                if node.get("parentId"):
                    self.assertIn(node["parentId"], ids, node["id"])
                for related_id in node.get("relatedIds", []):
                    self.assertIn(related_id, ids, node["id"])
                for persona_id in node.get("personaIds", []):
                    self.assertIn(persona_id, ids, node["id"])
                self.assertRegex(node["source"]["file"], r"^[^/\\]+\.pptx$")
                self.assertTrue(set(node["source"]["slideNumbers"]).issubset(EXPECTED_SLIDES), node["id"])

    def test_all_145_slides_are_accounted_for_once_in_manifest(self) -> None:
        slides = self.manifest["slides"]
        numbers = [slide["slideNumber"] for slide in slides]
        self.assertEqual(145, len(slides))
        self.assertEqual(EXPECTED_SLIDES, set(numbers))
        self.assertEqual([], [number for number, count in Counter(numbers).items() if count != 1])
        self.assertTrue({slide["disposition"] for slide in slides}.issubset(ALLOWED_DISPOSITIONS))
        self.assertEqual(
            {"imported": 127, "contextual": 17, "visual-only": 1},
            dict(Counter(slide["disposition"] for slide in slides)),
        )

    def test_every_slide_is_reachable_from_runtime_content(self) -> None:
        covered = {
            number
            for node in self.fa_nodes.values()
            for number in node["source"]["slideNumbers"]
        }
        self.assertEqual(EXPECTED_SLIDES, covered)

    def test_manifest_hash_matches_canonical_source(self) -> None:
        canonical = self.manifest["canonicalSource"]
        asset = next(item for item in self.manifest["assets"] if item["filename"] == canonical)
        digest = hashlib.sha256((DATA / canonical).read_bytes()).hexdigest()
        self.assertEqual(asset["sha256"], digest)
        self.assertEqual(self.fa["sourceRevision"], digest)
        self.assertEqual(self.en["sourceRevision"], digest)

    def test_runtime_files_are_paired_between_locales(self) -> None:
        def relatives(locale: str) -> set[Path]:
            base = CONTENT / locale
            return {path.relative_to(base) for path in base.rglob("*.json")}

        self.assertEqual(relatives("fa"), relatives("en"))
        for relative in relatives("fa"):
            fa_item = read_json(CONTENT / "fa" / relative)
            en_item = read_json(CONTENT / "en" / relative)
            if "locale" in fa_item or "locale" in en_item:
                self.assertEqual(fa_item.get("locale"), "fa", str(relative))
                self.assertEqual(en_item.get("locale"), "en", str(relative))
            if "id" in fa_item or "id" in en_item:
                self.assertEqual(fa_item.get("id"), en_item.get("id"), str(relative))

    def test_client_content_contains_no_absolute_workspace_paths(self) -> None:
        windows_absolute = re.compile(r"[A-Za-z]:[\\/]")
        for path in [*DATA.glob("*.json"), *CONTENT.rglob("*.json")]:
            value = path.read_text(encoding="utf-8")
            self.assertIsNone(windows_absolute.search(value), str(path))
            self.assertNotIn(str(ROOT), value, str(path))
        self.assertFalse(self.manifest["security"]["absolutePathsIncluded"])
        self.assertTrue(self.manifest["security"]["clientSafePathsOnly"])

    def test_inventory_has_a_row_for_every_slide(self) -> None:
        inventory = (ROOT / "docs" / "content-inventory.md").read_text(encoding="utf-8")
        row_numbers = {
            int(match.group(1))
            for match in re.finditer(r"^\|\s*(\d+)\s*\|", inventory, flags=re.MULTILINE)
        }
        self.assertEqual(EXPECTED_SLIDES, row_numbers)


if __name__ == "__main__":
    unittest.main(verbosity=2)
