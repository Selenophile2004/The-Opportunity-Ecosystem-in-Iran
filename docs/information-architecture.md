# معماری اطلاعات

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
