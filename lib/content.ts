import enContentJson from "@/data/content.en.json";
import faContentJson from "@/data/content.fa.json";
import { localizedContentSchema, type ContentNode, type LocalizedContent } from "@/src/content/schema";

export const locales = ["fa", "en"] as const;
export type Locale = (typeof locales)[number];

export type CanvasBlockViewModel = {
  id: string;
  slug: string;
  title: string;
  status: ContentNode["status"];
  statusLabel: string;
  sourceCount: number;
  itemCount: number;
  personaIds: string[];
  values: CanvasValueViewModel[];
  searchableText: string;
};

export type CanvasValueViewModel = {
  id: string;
  title: string;
  parentSlug: string;
  parentTitle: string;
  status: ContentNode["status"];
  statusLabel: string;
  sourceSlides: number[];
  personaIds: string[];
  tags: string[];
};

export type CanvasViewModel = {
  locale: Locale;
  title: string;
  description: string;
  blocks: CanvasBlockViewModel[];
  personas: Array<{ id: string; title: string }>;
  totalSlides: number;
};

export type ModelItemViewModel = {
  id: string;
  title: string;
  preview?: string;
  type: ContentNode["type"];
  typeLabel: string;
  status: ContentNode["status"];
  statusLabel: string;
  slideNumbers: number[];
  slideLabel: string;
  personaIds: string[];
  translationPending: boolean;
  visualizationKind?: string;
  searchableText: string;
};

export type ChannelDimensionViewModel = {
  id: string;
  label: string;
  value: string;
  sourceValue: string;
};

export type ChannelPriorityRowViewModel = {
  id: string;
  label: string;
  sourceLabel: string;
  priority: number;
  personaIds: string[];
  dimensions: ChannelDimensionViewModel[];
};

export type ChannelAnalysisViewModel = {
  kind: "channel-priority";
  id: string;
  title: string;
  sourceNodeId: string;
  sourceFile: string;
  slideLabel: string;
  translationPending: boolean;
  rows: ChannelPriorityRowViewModel[];
};

export type RelationshipZoneViewModel = {
  id: string;
  label: string;
  x: number;
  y: number;
  relationships: Array<{ id: string; title: string }>;
  allocations: Array<{ id: string; title: string; personaId?: string }>;
};

export type RelationshipAnalysisViewModel = {
  kind: "relationship-matrix";
  id: string;
  title: string;
  sourceNodeId: string;
  sourceFile: string;
  slideLabel: string;
  translationPending: boolean;
  axes: { x: string; y: string; low: string; high: string };
  zones: RelationshipZoneViewModel[];
};

export type AnalysisViewModel = ChannelAnalysisViewModel | RelationshipAnalysisViewModel;

export type ModelViewModel = {
  locale: Locale;
  slug: string;
  blockId: string;
  title: string;
  description: string;
  status: ContentNode["status"];
  statusLabel: string;
  sourceSlides: number[];
  sourceSlidesLabel: string;
  items: ModelItemViewModel[];
  featureItems: Array<{ id: string; title: string; slideLabel: string }>;
  personas: Array<{ id: string; title: string; count: number }>;
  navigation: Array<{ slug: string; title: string; active: boolean; status: ContentNode["status"] }>;
  analysis?: AnalysisViewModel;
};

const contentByLocale: Record<Locale, LocalizedContent> = {
  fa: localizedContentSchema.parse(faContentJson),
  en: localizedContentSchema.parse(enContentJson),
};

const copy = {
  fa: {
    description: "نقشه‌ای تعاملی از مدل کسب‌وکار، بازیگران و شواهد سند؛ هر بلوک مسیر ورود به دادهٔ واقعی و اسلاید منبع است.",
    statuses: {
      available: "داده موجود",
      partial: "داده جزئی",
      planned: "برنامه‌ریزی‌شده",
      not_provided: "ارائه‌نشده",
    },
    types: {
      "canvas-block": "بلوک بوم",
      topic: "موضوع",
      persona: "پرسونا",
      insight: "یافته",
      kpi: "شاخص",
      chart: "نمودار",
      table: "جدول",
      list: "فهرست",
      matrix: "ماتریس",
      source: "منبع",
      mixed: "ترکیبی",
    },
  },
  en: {
    description: "An interactive map of the business model, actors and evidence; each block leads to source-backed records and slides.",
    statuses: {
      available: "Available",
      partial: "Partial",
      planned: "Planned",
      not_provided: "Not provided",
    },
    types: {
      "canvas-block": "Canvas block",
      topic: "Topic",
      persona: "Persona",
      insight: "Insight",
      kpi: "KPI",
      chart: "Chart",
      table: "Table",
      list: "List",
      matrix: "Matrix",
      source: "Source",
      mixed: "Mixed",
    },
  },
} as const;

export function isLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export function getContent(locale: Locale): LocalizedContent {
  return contentByLocale[locale];
}

function unique<T>(values: T[]): T[] {
  return Array.from(new Set(values));
}

function sourceSlides(nodes: ContentNode[]): number[] {
  return unique(nodes.flatMap((node) => node.source.slideNumbers)).sort((a, b) => a - b);
}

type CuratedCanvasValue = {
  id: string;
  en: string;
  fa: string;
  slides: number[];
  personaIds?: string[];
  tags: string[];
};

const allPersonaIds = ["persona-01", "persona-02", "persona-03", "persona-04", "persona-05", "persona-06"];

const curatedCanvasValues: Record<string, CuratedCanvasValue[]> = {
  "key-partners": [
    { id: "partner-founding-core", en: "Founding core", fa: "هسته بنیان‌گذاران", slides: [15, 16], tags: ["trust", "capability", "coordination"] },
    { id: "partner-network", en: "Partner network", fa: "شبکه شرکا", slides: [15, 16], tags: ["network", "access", "coordination"] },
    { id: "partner-stakeholders", en: "Stakeholder network", fa: "شبکه ذی‌نفعان", slides: [15, 16], tags: ["network", "trust", "governance"] },
    { id: "partner-international-brands", en: "International brands", fa: "برندهای بین‌المللی", slides: [122], personaIds: ["persona-02", "persona-04", "persona-06"], tags: ["international", "access", "trust"] },
    { id: "partner-associations", en: "Chambers & associations", fa: "اتاق‌ها و انجمن‌ها", slides: [122], personaIds: ["persona-01", "persona-03"], tags: ["network", "access", "trust"] },
    { id: "partner-trade-offices", en: "Trade offices", fa: "دفاتر تجاری", slides: [122], personaIds: ["persona-02", "persona-04"], tags: ["international", "access", "service"] },
  ],
  "key-activities": [
    { id: "activity-intelligence", en: "Opportunity intelligence", fa: "هوشمندی فرصت", slides: [15], tags: ["intelligence", "validation"] },
    { id: "activity-access", en: "Access discovery", fa: "کشف دسترسی", slides: [15], tags: ["access", "network"] },
    { id: "activity-diagnosis", en: "Needs diagnosis", fa: "تشخیص نیاز", slides: [15], tags: ["intelligence", "service"] },
    { id: "activity-delivery", en: "Service delivery", fa: "ارائه خدمت", slides: [15], tags: ["service", "coordination"] },
    { id: "activity-validation", en: "Idea validation", fa: "اعتبارسنجی ایده", slides: [15], personaIds: ["persona-03", "persona-04", "persona-05"], tags: ["validation", "venture"] },
    { id: "activity-venture", en: "Venture design", fa: "طراحی کسب‌وکار", slides: [15], personaIds: ["persona-05"], tags: ["venture", "capability"] },
    { id: "activity-capital", en: "Capital allocation", fa: "تخصیص سرمایه", slides: [15], personaIds: ["persona-05", "persona-06"], tags: ["investment", "governance"] },
    { id: "activity-portfolio", en: "Portfolio development", fa: "توسعه سبد", slides: [15], personaIds: ["persona-06"], tags: ["investment", "coordination"] },
  ],
  "key-resources": [
    { id: "resource-backbone", en: "Shared backbone", fa: "زیرساخت مشترک", slides: [16], tags: ["capability", "coordination"] },
    { id: "resource-culture", en: "Shared culture", fa: "فرهنگ مشترک", slides: [16], tags: ["trust", "governance"] },
    { id: "resource-network", en: "Trusted network", fa: "شبکه مورد اعتماد", slides: [16], tags: ["network", "access", "trust"] },
    { id: "resource-capability", en: "Professional capability", fa: "توانمندی حرفه‌ای", slides: [16], tags: ["capability", "service"] },
    { id: "resource-founder-assets", en: "Founder assets", fa: "دارایی‌های بنیان‌گذار", slides: [99], personaIds: ["persona-05"], tags: ["venture", "capability"] },
    { id: "resource-investment", en: "Investment judgment", fa: "قضاوت سرمایه‌گذاری", slides: [99], personaIds: ["persona-06"], tags: ["investment", "intelligence"] },
  ],
  "cost-structure": [
    { id: "cost-resources", en: "Key resource costs", fa: "هزینه منابع کلیدی", slides: [7], tags: ["cost", "capability"] },
    { id: "cost-activities", en: "Key activity costs", fa: "هزینه فعالیت‌های کلیدی", slides: [7], tags: ["cost", "service"] },
    { id: "cost-channels", en: "Channel delivery costs", fa: "هزینه ارائه کانال", slides: [7, 102], tags: ["cost", "access"] },
    { id: "cost-relationships", en: "Relationship costs", fa: "هزینه روابط مشتری", slides: [7, 21, 47], tags: ["cost", "trust"] },
  ],
  "revenue-streams": [
    { id: "revenue-fixed-project", en: "Fixed project fee", fa: "حق‌الزحمه ثابت پروژه", slides: [10], tags: ["revenue", "service"] },
    { id: "revenue-monthly-retainer", en: "Monthly retainer", fa: "قرارداد ماهانه", slides: [10], tags: ["revenue", "service"] },
    { id: "revenue-annual-retainer", en: "Annual retainer", fa: "قرارداد سالانه", slides: [10], tags: ["revenue", "service"] },
    { id: "revenue-time-fee", en: "Hourly / daily fee", fa: "حق‌الزحمه ساعتی / روزانه", slides: [10], tags: ["revenue", "service"] },
    { id: "revenue-representation", en: "Annual representation fee", fa: "حق نمایندگی سالانه", slides: [10], tags: ["revenue", "international", "access"] },
    { id: "revenue-commission", en: "Sales commission", fa: "کمیسیون فروش", slides: [10], tags: ["revenue", "access"] },
    { id: "revenue-success", en: "Success fee", fa: "کارمزد موفقیت", slides: [10], tags: ["revenue", "coordination"] },
    { id: "revenue-hybrid", en: "Fixed + success fee", fa: "ثابت + کارمزد موفقیت", slides: [10], tags: ["revenue", "coordination"] },
    { id: "revenue-lead", en: "Per lead / introduction", fa: "به‌ازای سرنخ / معرفی", slides: [11], tags: ["revenue", "access", "network"] },
    { id: "revenue-match", en: "Per meeting / match", fa: "به‌ازای جلسه / تطبیق", slides: [11], tags: ["revenue", "access"] },
    { id: "revenue-membership", en: "Membership / subscription", fa: "عضویت / اشتراک", slides: [11], tags: ["revenue", "digital"] },
    { id: "revenue-event", en: "Event participation fee", fa: "هزینه حضور در رویداد", slides: [11], tags: ["revenue", "network"] },
    { id: "revenue-sponsorship", en: "Sponsorship / advertising", fa: "حمایت مالی / تبلیغات", slides: [11], tags: ["revenue", "network"] },
    { id: "revenue-public", en: "Government contract / user fee", fa: "قرارداد دولتی / هزینه کاربر", slides: [11], tags: ["revenue", "governance"] },
  ],
};

const semanticTags: Record<string, string[]> = {
  "value-driver-01": ["intelligence", "validation"],
  "value-driver-02": ["access", "trust", "network"],
  "value-driver-03": ["capability", "investment"],
  "value-driver-04": ["coordination", "service", "venture"],
  "relationship-01": ["service", "revenue"],
  "relationship-02": ["service", "trust"],
  "relationship-03": ["intelligence", "service", "trust"],
  "relationship-04": ["coordination", "service"],
  "relationship-05": ["coordination", "capability", "venture"],
  "relationship-06": ["trust", "network", "international"],
  "relationship-07": ["network", "digital", "access"],
  "persona-01": ["access", "international", "trust", "service"],
  "persona-02": ["international", "access", "governance", "trust"],
  "persona-03": ["capability", "validation", "digital"],
  "persona-04": ["intelligence", "validation", "international"],
  "persona-05": ["venture", "capability", "coordination", "investment"],
  "persona-06": ["investment", "intelligence", "access", "trust"],
};

function canvasValues(content: LocalizedContent, locale: Locale, block: ContentNode): CanvasValueViewModel[] {
  const fromNode = (node: ContentNode, personaIds = node.personaIds, tags = semanticTags[node.id] ?? node.filterTags): CanvasValueViewModel => ({
    id: node.id,
    title: node.title,
    parentSlug: block.slug,
    parentTitle: block.title,
    status: node.status,
    statusLabel: copy[locale].statuses[node.status],
    sourceSlides: node.source.slideNumbers,
    personaIds,
    tags,
  });

  if (block.slug === "value-propositions") {
    return content.nodes.filter((node) => /^value-driver-\d+$/.test(node.id)).map((node) => fromNode(node, allPersonaIds));
  }
  if (block.slug === "customer-relationships") {
    return content.nodes.filter((node) => /^relationship-\d+$/.test(node.id)).map((node) => fromNode(node, allPersonaIds));
  }
  if (block.slug === "customer-segments") {
    return content.nodes.filter((node) => node.type === "persona").map((node) => fromNode(node, [node.id]));
  }
  if (block.slug === "channels") {
    const source = content.nodes.find((node) => node.id === "slide-115");
    const rows = (source?.visualization?.rows ?? []) as Array<{ id: string; label: string; personaIds: string[]; dimensions?: Array<{ id: string }> }>;
    return rows.map((row) => ({
      id: row.id,
      title: row.label,
      parentSlug: block.slug,
      parentTitle: block.title,
      status: source?.status ?? block.status,
      statusLabel: copy[locale].statuses[source?.status ?? block.status],
      sourceSlides: [115],
      personaIds: row.personaIds,
      tags: unique(["access", "network", ...(row.dimensions?.map((dimension) => dimension.id) ?? [])]),
    }));
  }

  return (curatedCanvasValues[block.slug] ?? []).map((value) => ({
    id: value.id,
    title: locale === "fa" ? value.fa : value.en,
    parentSlug: block.slug,
    parentTitle: block.title,
    status: block.status,
    statusLabel: copy[locale].statuses[block.status],
    sourceSlides: value.slides,
    personaIds: value.personaIds ?? [],
    tags: value.tags,
  }));
}

export function getCanvasView(locale: Locale): CanvasViewModel {
  const content = getContent(locale);
  const root = content.nodes.find((node) => node.id === "ecosystem-root");
  if (!root) throw new Error("Missing ecosystem root");

  const blocks = content.nodes
    .filter((node) => node.type === "canvas-block")
    .map((block): CanvasBlockViewModel => {
      const descendants = content.nodes.filter((node) => node.parentId === block.id);
      const personas = unique(
        descendants.flatMap((node) => [
          ...node.personaIds,
          ...(node.type === "persona" ? [node.id] : []),
        ]),
      );
      const slides = sourceSlides([block, ...descendants]);
      const values = canvasValues(content, locale, block);
      return {
        id: block.id,
        slug: block.slug,
        title: block.title,
        status: block.status,
        statusLabel: copy[locale].statuses[block.status],
        sourceCount: slides.length,
        itemCount: descendants.length,
        personaIds: personas,
        values,
        searchableText: [block.title, block.summary, ...descendants.map((node) => node.title), ...values.map((value) => value.title)]
          .filter(Boolean)
          .join(" ")
          .toLocaleLowerCase(locale),
      };
    });

  const personas = content.nodes
    .filter((node) => node.type === "persona")
    .map((node) => ({ id: node.id, title: node.title }));

  return {
    locale,
    title: root.title,
    description: copy[locale].description,
    blocks,
    personas,
    totalSlides: sourceSlides(content.nodes).length,
  };
}

export function getBlockDetail(locale: Locale, slug: string) {
  const content = getContent(locale);
  const block = content.nodes.find((node) => node.type === "canvas-block" && node.slug === slug);
  if (!block) return null;
  const items = content.nodes
    .filter((node) => node.parentId === block.id)
    .sort((a, b) => Math.min(...a.source.slideNumbers) - Math.min(...b.source.slideNumbers));
  const slides = sourceSlides([block, ...items]);
  const isFa = locale === "fa";
  const fallbackDescription = isFa
    ? `این صفحه داده‌های موجود برای «${block.title}» را با ارجاع مستقیم به منبع جمع می‌کند.`
    : `This page gathers the available source-backed records for ${block.title}.`;

  return {
    title: block.title,
    status: block.status,
    statusLabel: copy[locale].statuses[block.status],
    description: block.summary || fallbackDescription,
    sourceSlidesLabel: slides.length
      ? `${slides[0].toLocaleString(isFa ? "fa-IR" : "en")}–${slides.at(-1)?.toLocaleString(isFa ? "fa-IR" : "en")}`
      : isFa
        ? "ندارد"
        : "None",
    items: items.map((item) => ({
      id: item.id,
      title: item.title,
      summary: item.summary || (item.body ? item.body.slice(0, 180) : undefined),
      slideLabel: isFa
        ? `اسلاید ${item.source.slideNumbers[0].toLocaleString("fa-IR")}`
        : `Slide ${item.source.slideNumbers[0].toLocaleString("en")}`,
    })),
  };
}

function normalizedPreview(node: ContentNode): string | undefined {
  const value = node.summary || node.body;
  if (!value) return undefined;
  const normalized = value.replace(/\s+/g, " ").trim();
  return normalized.length > 260 ? `${normalized.slice(0, 257).trimEnd()}…` : normalized;
}

function slideLabel(locale: Locale, numbers: number[]): string {
  const numberLocale = locale === "fa" ? "fa-IR" : "en";
  if (numbers.length === 1) {
    return locale === "fa"
      ? `اسلاید ${numbers[0].toLocaleString(numberLocale)}`
      : `Slide ${numbers[0].toLocaleString(numberLocale)}`;
  }
  return locale === "fa"
    ? `${numbers.length.toLocaleString(numberLocale)} اسلاید`
    : `${numbers.length.toLocaleString(numberLocale)} slides`;
}

function visualizationKind(node: ContentNode): string | undefined {
  const kind = node.visualization?.kind;
  return typeof kind === "string" ? kind : undefined;
}

type ChannelPriorityConfig = {
  kind: "ranked-dot-plot";
  sourceNodeId: string;
  translationStatus: string;
  rows: ChannelPriorityRowViewModel[];
};

type RelationshipMatrixConfig = {
  kind: "qualitative-matrix";
  sourceNodeId: string;
  translationStatus: string;
  axes: RelationshipAnalysisViewModel["axes"];
  zones: Array<{
    id: string;
    label: string;
    x: number;
    y: number;
    relationshipIds: string[];
    allocationIds: string[];
  }>;
};

function getAnalysisView(locale: Locale, slug: string, content: LocalizedContent): AnalysisViewModel | undefined {
  const byId = new Map(content.nodes.map((node) => [node.id, node]));
  if (slug === "channels") {
    const node = byId.get("slide-115");
    const config = node?.visualization as ChannelPriorityConfig | undefined;
    if (!node || config?.kind !== "ranked-dot-plot") return undefined;
    return {
      kind: "channel-priority",
      id: "channel-priority",
      title: node.title,
      sourceNodeId: config.sourceNodeId,
      sourceFile: node.source.file,
      slideLabel: slideLabel(locale, node.source.slideNumbers),
      translationPending: config.translationStatus === "working_terminology",
      rows: config.rows,
    };
  }
  if (slug === "customer-relationships") {
    const node = byId.get("slide-136");
    const config = node?.visualization as RelationshipMatrixConfig | undefined;
    if (!node || config?.kind !== "qualitative-matrix") return undefined;
    return {
      kind: "relationship-matrix",
      id: "relationship-portfolio",
      title: node.title,
      sourceNodeId: config.sourceNodeId,
      sourceFile: node.source.file,
      slideLabel: slideLabel(locale, node.source.slideNumbers),
      translationPending: config.translationStatus === "working_terminology",
      axes: config.axes,
      zones: config.zones.map((zone) => ({
        id: zone.id,
        label: zone.label,
        x: zone.x,
        y: zone.y,
        relationships: zone.relationshipIds
          .map((id) => byId.get(id))
          .filter((candidate): candidate is ContentNode => candidate !== undefined)
          .map((candidate) => ({ id: candidate.id, title: candidate.title })),
        allocations: zone.allocationIds
          .map((id) => byId.get(id))
          .filter((candidate): candidate is ContentNode => candidate !== undefined)
          .map((candidate) => ({ id: candidate.id, title: candidate.title, personaId: candidate.personaIds[0] })),
      })),
    };
  }
  return undefined;
}

export function getModelView(locale: Locale, slug: string): ModelViewModel | null {
  const content = getContent(locale);
  const block = content.nodes.find((node) => node.type === "canvas-block" && node.slug === slug);
  if (!block) return null;
  const isFa = locale === "fa";
  const rawItems = content.nodes
    .filter((node) => node.parentId === block.id)
    .sort((a, b) => {
      const aSemantic = a.id.startsWith("slide-") ? 1 : 0;
      const bSemantic = b.id.startsWith("slide-") ? 1 : 0;
      return aSemantic - bSemantic || Math.min(...a.source.slideNumbers) - Math.min(...b.source.slideNumbers);
    });
  const slides = sourceSlides([block, ...rawItems]);
  const itemPersonaIds = (node: ContentNode) => unique([
    ...node.personaIds,
    ...(node.type === "persona" ? [node.id] : []),
  ]);
  const items: ModelItemViewModel[] = rawItems.map((node) => {
    const personaIds = itemPersonaIds(node);
    const preview = normalizedPreview(node);
    return {
      id: node.id,
      title: node.title,
      preview,
      type: node.type,
      typeLabel: copy[locale].types[node.type],
      status: node.status,
      statusLabel: copy[locale].statuses[node.status],
      slideNumbers: node.source.slideNumbers,
      slideLabel: slideLabel(locale, node.source.slideNumbers),
      personaIds,
      translationPending: locale === "en" && ["title_only", "working_terminology"].includes(node.translationStatus),
      visualizationKind: visualizationKind(node),
      searchableText: [node.title, preview].filter(Boolean).join(" ").toLocaleLowerCase(locale),
    };
  });
  const personas = content.nodes
    .filter((node) => node.type === "persona")
    .map((persona) => ({
      id: persona.id,
      title: persona.title,
      count: items.filter((item) => item.personaIds.includes(persona.id)).length,
    }))
    .filter((persona) => persona.count > 0 || block.id === "canvas-block-customer-segments");
  const fallbackDescription = isFa
    ? `شواهد و رکوردهای استخراج‌شده برای «${block.title}» با امکان مراجعه به اسلاید منبع.`
    : `Source-backed records for ${block.title}, with direct slide provenance.`;

  return {
    locale,
    slug,
    blockId: block.id,
    title: block.title,
    description: block.summary || fallbackDescription,
    status: block.status,
    statusLabel: copy[locale].statuses[block.status],
    sourceSlides: slides,
    sourceSlidesLabel: slides.length
      ? `${slides[0].toLocaleString(isFa ? "fa-IR" : "en")}–${slides.at(-1)?.toLocaleString(isFa ? "fa-IR" : "en")}`
      : isFa
        ? "بدون اسلاید"
        : "No slides",
    items,
    featureItems: items
      .filter((item) => !item.id.startsWith("slide-"))
      .map((item) => ({ id: item.id, title: item.title, slideLabel: item.slideLabel })),
    personas,
    navigation: content.nodes
      .filter((node) => node.type === "canvas-block")
      .map((node) => ({ slug: node.slug, title: node.title, active: node.id === block.id, status: node.status })),
    analysis: getAnalysisView(locale, slug, content),
  };
}

export function getItemDetail(locale: Locale, id: string) {
  const content = getContent(locale);
  const node = content.nodes.find((candidate) => candidate.id === id);
  if (!node) return null;
  const byId = new Map(content.nodes.map((candidate) => [candidate.id, candidate]));
  const isFa = locale === "fa";
  const translationPending = locale === "en" && ["title_only", "working_terminology"].includes(node.translationStatus);

  return {
    id: node.id,
    title: node.title,
    summary: node.summary,
    body: node.body,
    type: node.type,
    typeLabel: copy[locale].types[node.type],
    status: node.status,
    statusLabel: copy[locale].statuses[node.status],
    translationStatus: node.translationStatus,
    translationPending,
    visualizationKind: visualizationKind(node),
    related: node.relatedIds
      .map((relatedId) => byId.get(relatedId))
      .filter((candidate): candidate is ContentNode => candidate !== undefined)
      .map((candidate) => ({ id: candidate.id, title: candidate.title, type: candidate.type })),
    personas: unique([
      ...node.personaIds,
      ...(node.type === "persona" ? [node.id] : []),
    ])
      .map((personaId) => byId.get(personaId))
      .filter((candidate): candidate is ContentNode => candidate !== undefined)
      .map((candidate) => ({ id: candidate.id, title: candidate.title })),
    source: {
      file: node.source.file,
      slideNumbers: node.source.slideNumbers,
      slideLabel: slideLabel(locale, node.source.slideNumbers),
      shapeCount: node.source.shapeIds.length,
    },
    emptyMessage: translationPending
      ? isFa
        ? undefined
        : "The English body is awaiting translation review. Source provenance remains available."
      : isFa
        ? "برای این رکورد متن تفصیلی مستقلی در منبع وجود ندارد."
        : "No separate detailed body is provided for this record.",
  };
}
