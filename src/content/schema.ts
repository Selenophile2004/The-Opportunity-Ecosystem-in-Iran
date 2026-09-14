import { z } from "zod";

export const contentStatusSchema = z.enum([
  "available",
  "partial",
  "planned",
  "not_provided",
]);

export const contentTypeSchema = z.enum([
  "canvas-block",
  "topic",
  "persona",
  "insight",
  "kpi",
  "chart",
  "table",
  "list",
  "matrix",
  "source",
  "mixed",
]);

export const sourceProvenanceSchema = z.object({
  file: z.string().regex(/^[^\\/:*?"<>|]+\.pptx$/),
  slideNumbers: z.array(z.number().int().min(1).max(145)).min(1),
  shapeIds: z.array(z.string().min(1)),
});

const channelPriorityVisualizationSchema = z.object({
  kind: z.literal("ranked-dot-plot"),
  renderer: z.literal("echarts"),
  interactive: z.literal(true),
  hierarchy: z.tuple([z.literal("channel"), z.literal("score-dimension"), z.literal("evidence")]),
  sourceNodeId: z.string(),
  rows: z.array(z.object({
    id: z.string().regex(/^channel-priority-\d{2}$/),
    label: z.string().min(1),
    sourceLabel: z.string().min(1),
    priority: z.number().int().min(1).max(4),
    personaIds: z.array(z.string()),
    dimensions: z.array(z.object({
      id: z.enum(["access", "acquisition-cost", "trust-fit", "controllability", "scalability"]),
      label: z.string().min(1),
      value: z.string().min(1),
      sourceValue: z.string().min(1),
    })).length(5),
  })).length(11),
});

const relationshipMatrixVisualizationSchema = z.object({
  kind: z.literal("qualitative-matrix"),
  renderer: z.literal("echarts"),
  interactive: z.literal(true),
  hierarchy: z.tuple([
    z.literal("matrix-zone"),
    z.literal("relationship-archetype"),
    z.literal("persona-allocation"),
    z.literal("evidence"),
  ]),
  sourceNodeId: z.string(),
  axes: z.object({ x: z.string().min(1), y: z.string().min(1), low: z.string().min(1), high: z.string().min(1) }),
  zones: z.array(z.object({
    id: z.enum(["A", "B", "C", "D", "E"]),
    label: z.string().min(1),
    x: z.number().min(1).max(3),
    y: z.number().min(1).max(3),
    relationshipIds: z.array(z.string()).min(1),
    allocationIds: z.array(z.string()).length(6),
  })).length(5),
});

const visualizationSchema = z.record(z.string(), z.unknown()).superRefine((value, context) => {
  const specialized = value.kind === "ranked-dot-plot"
    ? channelPriorityVisualizationSchema.safeParse(value)
    : value.kind === "qualitative-matrix"
      ? relationshipMatrixVisualizationSchema.safeParse(value)
      : null;
  if (specialized?.success === false) {
    specialized.error.issues.forEach((issue) => context.addIssue({
      code: "custom",
      message: issue.message,
      path: issue.path,
    }));
  }
});

export const contentNodeSchema = z.object({
  id: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  slug: z.string().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  type: contentTypeSchema,
  status: contentStatusSchema,
  title: z.string().min(1),
  summary: z.string().optional(),
  body: z.string().optional(),
  parentId: z.string().nullable(),
  relatedIds: z.array(z.string()),
  personaIds: z.array(z.string()),
  filterTags: z.array(z.string()),
  source: sourceProvenanceSchema,
  visualization: visualizationSchema.optional(),
  translationStatus: z.enum([
    "complete",
    "source",
    "source_english",
    "title_only",
    "working_terminology",
  ]),
});

export const localizedContentSchema = z.object({
  schemaVersion: z.literal("1.0.0"),
  locale: z.enum(["fa", "en"]),
  direction: z.enum(["rtl", "ltr"]),
  generatedUtc: z.iso.datetime({ offset: true }),
  sourceRevision: z.string().regex(/^[0-9a-f]{64}$/),
  nodes: z.array(contentNodeSchema),
});

export type ContentNode = z.infer<typeof contentNodeSchema>;
export type LocalizedContent = z.infer<typeof localizedContentSchema>;
