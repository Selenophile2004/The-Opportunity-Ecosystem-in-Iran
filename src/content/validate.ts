import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import { localizedContentSchema, type LocalizedContent } from "./schema.js";

function readContent(locale: "fa" | "en"): LocalizedContent {
  const path = resolve(process.cwd(), "data", `content.${locale}.json`);
  return localizedContentSchema.parse(JSON.parse(readFileSync(path, "utf8")));
}

function validateReferences(content: LocalizedContent): string[] {
  const errors: string[] = [];
  const ids = new Set(content.nodes.map((node) => node.id));

  for (const node of content.nodes) {
    const references = [
      ...(node.parentId ? [node.parentId] : []),
      ...node.relatedIds,
      ...node.personaIds,
    ];
    for (const reference of references) {
      if (!ids.has(reference)) {
        errors.push(`${content.locale}/${node.id} -> ${reference}`);
      }
    }
  }
  return errors;
}

const fa = readContent("fa");
const en = readContent("en");
const faById = new Map(fa.nodes.map((node) => [node.id, node]));
const enById = new Map(en.nodes.map((node) => [node.id, node]));
const errors = [...validateReferences(fa), ...validateReferences(en)];

if (faById.size !== enById.size) {
  errors.push(`Locale node counts differ: fa=${faById.size}, en=${enById.size}`);
}

for (const [id, faNode] of faById) {
  const enNode = enById.get(id);
  if (!enNode) {
    errors.push(`Missing English pair: ${id}`);
    continue;
  }
  if (faNode.slug !== enNode.slug) {
    errors.push(`Slug mismatch: ${id}`);
  }
  if (JSON.stringify(faNode.source) !== JSON.stringify(enNode.source)) {
    errors.push(`Provenance mismatch: ${id}`);
  }
}

const coveredSlides = new Set(
  fa.nodes.flatMap((node) => node.source.slideNumbers),
);
for (let slide = 1; slide <= 145; slide += 1) {
  if (!coveredSlides.has(slide)) errors.push(`Uncovered source slide: ${slide}`);
}

if (errors.length > 0) {
  console.error(JSON.stringify({ valid: false, errors }, null, 2));
  process.exit(1);
}

const translationReview = en.nodes.filter((node) =>
  ["title_only", "working_terminology"].includes(node.translationStatus),
).length;

console.log(JSON.stringify({
  valid: true,
  validator: "zod",
  nodesPerLocale: fa.nodes.length,
  coveredSlides: coveredSlides.size,
  translationReview,
}, null, 2));
