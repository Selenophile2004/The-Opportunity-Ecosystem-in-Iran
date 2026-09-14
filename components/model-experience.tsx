"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { createPortal } from "react-dom";
import { useEffect, useMemo, useRef, useState } from "react";

import type { Locale, ModelItemViewModel, ModelViewModel } from "@/lib/content";
import { ModelOverview } from "@/components/model-overview";
import { VisualizationWorkbench } from "@/components/visualization-workbench";

type DetailPayload = {
  id: string;
  title: string;
  summary?: string;
  body?: string;
  typeLabel: string;
  status: string;
  statusLabel: string;
  translationPending: boolean;
  visualizationKind?: string;
  related: Array<{ id: string; title: string; type: string }>;
  personas: Array<{ id: string; title: string }>;
  source: { file: string; slideNumbers: number[]; slideLabel: string; shapeCount: number };
  emptyMessage?: string;
};

type DetailInsight = {
  id: string;
  label: string;
  value: React.ReactNode;
  hint: string;
};

type DetailPoint = { x: number; y: number };
type ModelPanel = "overview" | "analysis" | "evidence";

const detailPointLayouts: Record<number, DetailPoint[]> = {
  1: [{ x: 50, y: 16 }],
  2: [{ x: 20, y: 23 }, { x: 80, y: 23 }],
  3: [{ x: 50, y: 14 }, { x: 82, y: 72 }, { x: 18, y: 72 }],
  4: [{ x: 50, y: 13 }, { x: 82, y: 50 }, { x: 50, y: 87 }, { x: 18, y: 50 }],
  5: [{ x: 50, y: 12 }, { x: 83, y: 35 }, { x: 71, y: 84 }, { x: 29, y: 84 }, { x: 17, y: 35 }],
  6: [{ x: 50, y: 13 }, { x: 82, y: 30 }, { x: 82, y: 70 }, { x: 50, y: 87 }, { x: 18, y: 70 }, { x: 18, y: 30 }],
  7: [{ x: 50, y: 12 }, { x: 78, y: 24 }, { x: 87, y: 55 }, { x: 68, y: 84 }, { x: 32, y: 84 }, { x: 13, y: 55 }, { x: 22, y: 24 }],
};

function getDetailPointLayout(count: number): DetailPoint[] {
  return detailPointLayouts[Math.min(7, Math.max(1, count))] ?? detailPointLayouts[7];
}

const labels = {
  fa: {
    back: "بازگشت به بوم",
    language: "English",
    breadcrumb: "بوم مدل کسب‌وکار",
    records: "رکورد منبع",
    slides: "بازه اسلاید",
    topics: "نقشه زیرموضوع‌ها",
    evidence: "رشته شواهد",
    evidenceHint: "هر ردیف به متن استخراج‌شده و اسلاید منبع متصل است.",
    search: "جست‌وجو در این مدل",
    searchPlaceholder: "عنوان یا متن رکورد",
    persona: "پرسونای مرتبط",
    all: "همه",
    clear: "پاک‌کردن فیلترها",
    open: "نمایش جزئیات",
    noMatch: "رکوردی با این فیلترها پیدا نشد.",
    emptyTitle: "جزئیات این بلوک در منبع ارائه نشده است",
    emptyBody: "وضعیت بلوک ثبت شده و با ورود دادهٔ معتبر در ingestion بعدی به‌روزرسانی می‌شود.",
    close: "بستن جزئیات",
    loading: "در حال بارگذاری جزئیات…",
    loadError: "جزئیات بارگذاری نشد. دوباره تلاش کنید.",
    source: "منبع",
    sourceFile: "فایل",
    shapes: "عنصر استخراج‌شده",
    related: "موضوع‌های مرتبط",
    relatedPersonas: "پرسوناهای مرتبط",
    visualization: "نوع نمایش منبع",
    detailedContent: "محتوای تفصیلی منبع",
    translationPending: "ترجمهٔ انگلیسی این رکورد هنوز تأیید نشده است.",
    chooseInsight: "هر نقطه را برای بازکردن لایه‌ی بعد انتخاب کنید",
    summaryPoint: "خلاصه",
    bodyPoint: "شرح کامل",
    personaPoint: "پرسوناها",
    relatedPoint: "پیوندها",
    sourcePoint: "رد منبع",
    visualPoint: "نمایش داده",
    closeInsight: "بستن این نکته",
    readFull: "نمایش متن کامل منبع",
    visualRecord: "رکورد دارای نمایش دیداری است",
    overviewTab: "نمای کلی",
    analysisTab: "نمودار و تحلیل",
    evidenceTab: "شواهد",
    previousPage: "قبلی",
    nextPage: "بعدی",
    page: "صفحه",
  },
  en: {
    back: "Back to canvas",
    language: "فارسی",
    breadcrumb: "Business Model Canvas",
    records: "source records",
    slides: "slide range",
    topics: "Topic map",
    evidence: "Evidence trace",
    evidenceHint: "Each row opens the extracted content and its source slide.",
    search: "Search this model",
    searchPlaceholder: "Record title or preview",
    persona: "Related persona",
    all: "All",
    clear: "Clear filters",
    open: "Open detail",
    noMatch: "No record matches these filters.",
    emptyTitle: "Details for this block are not provided in the source",
    emptyBody: "The block is tracked and will update when validated material is ingested.",
    close: "Close detail",
    loading: "Loading detail…",
    loadError: "Detail could not be loaded. Try again.",
    source: "Source",
    sourceFile: "File",
    shapes: "extracted elements",
    related: "Related topics",
    relatedPersonas: "Related personas",
    visualization: "Source visualization",
    detailedContent: "Detailed source content",
    translationPending: "The English body for this record is awaiting review.",
    chooseInsight: "Select each point to open its next layer",
    summaryPoint: "Summary",
    bodyPoint: "Full detail",
    personaPoint: "Personas",
    relatedPoint: "Connections",
    sourcePoint: "Source trail",
    visualPoint: "Data view",
    closeInsight: "Close this insight",
    readFull: "Read full source text",
    visualRecord: "This record includes a visual form",
    overviewTab: "Overview",
    analysisTab: "Charts & analysis",
    evidenceTab: "Evidence",
    previousPage: "Previous",
    nextPage: "Next",
    page: "Page",
  },
} as const;

function ProgressiveDetailText({ text, label }: { text: string; label: string }) {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= 360) return <p className="detail-body">{normalized}</p>;
  const excerpt = `${normalized.slice(0, 330).trimEnd()}…`;
  return (
    <div className="progressive-detail">
      <p className="detail-body">{excerpt}</p>
      <details>
        <summary>{label}</summary>
        <p>{normalized}</p>
      </details>
    </div>
  );
}

function DetailVisualCue({ label, kind }: { label: string; kind: string }) {
  return (
    <div className="detail-visual-cue">
      <span aria-hidden="true"><i /><i /><i /><i /></span>
      <p>{label}</p>
      <small>{kind.replaceAll("-", " ")}</small>
    </div>
  );
}

function buildQuery(pathname: string, values: { query: string; persona: string; detailId: string | null }) {
  const params = new URLSearchParams(typeof window === "undefined" ? "" : window.location.search);
  if (values.query.trim()) params.set("q", values.query.trim());
  else params.delete("q");
  if (values.persona !== "all") params.set("persona", values.persona);
  else params.delete("persona");
  if (values.detailId) params.set("detail", values.detailId);
  else params.delete("detail");
  return params.toString() ? `${pathname}?${params.toString()}` : pathname;
}

function TypeOnText({ text, locale }: { text: string; locale: Locale }) {
  const reducedMotion = useReducedMotion();
  const shouldAnimate = !reducedMotion && text.length <= 180;
  const [count, setCount] = useState(shouldAnimate ? 0 : text.length);

  useEffect(() => {
    setCount(shouldAnimate ? 0 : text.length);
    if (!shouldAnimate) return;
    const timer = window.setInterval(() => {
      setCount((current) => {
        if (current >= text.length) {
          window.clearInterval(timer);
          return current;
        }
        return current + 1;
      });
    }, locale === "fa" ? 18 : 16);
    return () => window.clearInterval(timer);
  }, [locale, shouldAnimate, text]);

  return (
    <button className="type-on" type="button" onClick={() => setCount(text.length)} aria-label={text}>
      <span aria-hidden="true">{text.slice(0, count)}</span>
      <span className="sr-only">{text}</span>
    </button>
  );
}

function DetailModal({
  locale,
  detailId,
  detail,
  loading,
  error,
  panelRef,
  onClose,
}: {
  locale: Locale;
  detailId: string;
  detail: DetailPayload | null;
  loading: boolean;
  error: boolean;
  panelRef: React.RefObject<HTMLElement | null>;
  onClose: () => void;
}) {
  const text = labels[locale];
  const reducedMotion = useReducedMotion();
  const titleId = `detail-title-${detailId}`;
  const [activeInsight, setActiveInsight] = useState<string | null>(null);

  const insights = useMemo<DetailInsight[]>(() => {
    if (!detail) return [];
    const items: DetailInsight[] = [];
    if (detail.summary) items.push({ id: "summary", label: text.summaryPoint, hint: locale === "fa" ? "چکیده‌ی رکورد" : "Record in brief", value: <p>{detail.summary}</p> });
    if (detail.body) items.push({ id: "body", label: text.bodyPoint, hint: locale === "fa" ? "متن استخراج‌شده" : "Extracted narrative", value: <ProgressiveDetailText text={detail.body} label={text.readFull} /> });
    if (detail.personas.length) items.push({ id: "personas", label: text.personaPoint, hint: `${detail.personas.length.toLocaleString(locale === "fa" ? "fa-IR" : "en")} ${text.relatedPersonas}`, value: <ul className="detail-tags">{detail.personas.map((persona) => <li key={persona.id}>{persona.title}</li>)}</ul> });
    if (detail.related.length) items.push({ id: "related", label: text.relatedPoint, hint: `${detail.related.length.toLocaleString(locale === "fa" ? "fa-IR" : "en")} ${text.related}`, value: <ul className="detail-related">{detail.related.map((item) => <li key={item.id}><span>{item.type}</span>{item.title}</li>)}</ul> });
    if (detail.visualizationKind) items.push({ id: "visual", label: text.visualPoint, hint: detail.visualizationKind.replaceAll("-", " "), value: <DetailVisualCue label={text.visualRecord} kind={detail.visualizationKind} /> });
    items.push({
      id: "source",
      label: text.sourcePoint,
      hint: detail.source.slideLabel,
      value: <dl className="detail-source-card"><div><dt>{text.sourceFile}</dt><dd>{detail.source.file}</dd></div><div><dt>{detail.source.slideLabel}</dt><dd>{detail.source.shapeCount.toLocaleString(locale === "fa" ? "fa-IR" : "en")} {text.shapes}</dd></div></dl>,
    });
    return items;
  }, [detail, locale, text]);

  const selectedInsight = insights.find((item) => item.id === activeInsight) ?? null;
  const insightPositions = useMemo(() => getDetailPointLayout(insights.length), [insights.length]);

  return (
    <motion.div
      className={`detail-backdrop detail-backdrop--${locale}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reducedMotion ? 0.01 : 0.2 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
    >
      <div className="detail-dismiss-layer" aria-hidden="true" onMouseDown={onClose} />
      <motion.section
        ref={panelRef}
        className={`detail-panel detail-panel--${locale}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.72, rotateX: 10, clipPath: "circle(8% at 50% 50%)" }}
        animate={{ opacity: 1, scale: 1, rotateX: 0, clipPath: "circle(75% at 50% 50%)" }}
        exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.86, clipPath: "circle(10% at 50% 50%)" }}
        transition={{ duration: reducedMotion ? 0.01 : 0.58, ease: [0.16, 1, 0.3, 1] }}
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="detail-panel__topline">
          <span>{detail?.source.slideLabel ?? text.loading}</span>
          <button className="detail-close" type="button" onClick={onClose} aria-label={text.close}>
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        {loading ? <div className="detail-state" role="status">{text.loading}</div> : null}
        {error ? <div className="detail-state detail-state--error" role="alert">{text.loadError}</div> : null}
        {detail ? <div className="detail-constellation">
          <div className="detail-nucleus">
            <div className="detail-kinds"><span>{detail.typeLabel}</span><span>{detail.statusLabel}</span></div>
            <h2 id={titleId}>{detail.title}</h2>
            <p>{text.chooseInsight}</p>
            {detail.translationPending ? <small>{detail.emptyMessage || text.translationPending}</small> : null}
          </div>
          <svg className="detail-orbit-lines" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true"><ellipse cx="50" cy="50" rx="40" ry="36" />{insights.map((_, index) => { const point = insightPositions[index]; const direction = index % 2 === 0 ? 1 : -1; const controlX = (50 + point.x) / 2 + (point.y - 50) * 0.09 * direction; const controlY = (50 + point.y) / 2 - (point.x - 50) * 0.09 * direction; return <motion.path key={index} d={`M50 50 Q${controlX} ${controlY} ${point.x} ${point.y}`} initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: reducedMotion ? 0 : 0.24 + index * 0.055, duration: reducedMotion ? 0.01 : 0.38 }} />; })}</svg>
          <div className="detail-insight-points" data-count={insights.length}>
            {insights.map((insight, index) => <motion.button key={insight.id} type="button" className={`detail-insight-point detail-insight-point--${index + 1}`} style={{ left: `${insightPositions[index].x}%`, top: `${insightPositions[index].y}%`, "--point-x": `${insightPositions[index].x}%`, "--point-y": `${insightPositions[index].y}%` } as React.CSSProperties} onClick={() => setActiveInsight(insight.id)} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: reducedMotion ? 0 : 0.3 + index * 0.065, type: "spring", stiffness: 175, damping: 16 }}><i aria-hidden="true" /><strong>{insight.label}</strong><small>{insight.hint}</small></motion.button>)}
          </div>
        </div> : null}

        <AnimatePresence>
          {selectedInsight ? <motion.aside
            className="insight-popup"
            role="dialog"
            aria-modal="true"
            aria-labelledby={`insight-title-${selectedInsight.id}`}
            tabIndex={-1}
            initial={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.76, y: 32, rotate: locale === "fa" ? 1.5 : -1.5 }}
            animate={{ opacity: 1, scale: 1, y: 0, rotate: 0 }}
            exit={reducedMotion ? { opacity: 0 } : { opacity: 0, scale: 0.84, y: 20 }}
            transition={{ duration: reducedMotion ? 0.01 : 0.38, ease: [0.16, 1, 0.3, 1] }}
            onKeyDown={(event) => { if (event.key === "Escape") { event.stopPropagation(); setActiveInsight(null); } }}
          >
            <span className="insight-popup__signal" aria-hidden="true" />
            <button autoFocus type="button" className="insight-popup__close" onClick={() => setActiveInsight(null)} aria-label={text.closeInsight}>×</button>
            <p>{selectedInsight.hint}</p><h3 id={`insight-title-${selectedInsight.id}`}>{selectedInsight.label}</h3>
            <div className="insight-popup__body">{selectedInsight.value}</div>
          </motion.aside> : null}
        </AnimatePresence>
      </motion.section>
    </motion.div>
  );
}

export function ModelExperience(view: ModelViewModel) {
  const { locale, items, personas } = view;
  const text = labels[locale];
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [mounted, setMounted] = useState(false);
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [persona, setPersona] = useState(searchParams.get("persona") ?? "all");
  const [detailId, setDetailId] = useState<string | null>(searchParams.get("detail"));
  const [detail, setDetail] = useState<DetailPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [activePanel, setActivePanel] = useState<ModelPanel>("overview");
  const [evidencePage, setEvidencePage] = useState(0);
  const panelRef = useRef<HTMLElement | null>(null);
  const previousFocusRef = useRef<HTMLElement | null>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    const handlePopState = () => {
      const params = new URLSearchParams(window.location.search);
      setDetailId(params.get("detail"));
      setQuery(params.get("q") ?? "");
      setPersona(params.get("persona") ?? "all");
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    if (!mounted) return;
    const next = buildQuery(pathname, { query, persona, detailId });
    window.history.replaceState(window.history.state, "", next);
  }, [detailId, mounted, pathname, persona, query]);

  useEffect(() => {
    if (!detailId) {
      setDetail(null);
      return;
    }
    const controller = new AbortController();
    setLoading(true);
    setError(false);
    fetch(`/api/content/${locale}/${encodeURIComponent(detailId)}`, { signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error("Unable to load detail");
        return response.json() as Promise<DetailPayload>;
      })
      .then((payload) => setDetail(payload))
      .catch((reason: unknown) => {
        if (reason instanceof DOMException && reason.name === "AbortError") return;
        setError(true);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [detailId, locale]);

  function closeDetail() {
    const params = new URLSearchParams(window.location.search);
    params.delete("detail");
    window.history.replaceState(window.history.state, "", params.toString() ? `${pathname}?${params}` : pathname);
    setDetailId(null);
    window.setTimeout(() => previousFocusRef.current?.focus(), 30);
  }

  useEffect(() => {
    if (!detailId || !mounted) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const focusTimer = window.setTimeout(() => panelRef.current?.focus(), 30);
    const handleKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        if (document.querySelector(".insight-popup")) return;
        event.preventDefault();
        closeDetail();
        return;
      }
      if (event.key !== "Tab" || !panelRef.current) return;
      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(
          'button:not([disabled]), a[href], input:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      );
      if (focusable.length === 0) {
        event.preventDefault();
        panelRef.current.focus();
        return;
      }
      const first = focusable[0];
      const last = focusable.at(-1)!;
      if (event.shiftKey && (document.activeElement === first || document.activeElement === panelRef.current)) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleKey);
    return () => {
      window.clearTimeout(focusTimer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKey);
    };
  });

  const matchingItems = useMemo(() => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return items.filter((item) => {
      const queryMatches = !needle || item.searchableText.includes(needle);
      const personaMatches = persona === "all" || item.personaIds.includes(persona);
      return queryMatches && personaMatches;
    });
  }, [items, locale, persona, query]);

  const hasFilters = query.trim() !== "" || persona !== "all";
  const evidencePageSize = 4;
  const evidencePageCount = Math.max(1, Math.ceil(matchingItems.length / evidencePageSize));
  const visibleEvidence = matchingItems.slice(evidencePage * evidencePageSize, (evidencePage + 1) * evidencePageSize);
  const otherLocale = locale === "fa" ? "en" : "fa";
  const otherLocaleHref = `/${otherLocale}/model/${view.slug}${detailId ? `?detail=${detailId}` : ""}`;

  function openDetailFromOrigin(origin: HTMLElement, id: string) {
    previousFocusRef.current = origin;
    setDetailId(id);
    const params = new URLSearchParams(window.location.search);
    params.set("detail", id);
    window.history.pushState({ ...window.history.state, opportunityDetail: id }, "", `${pathname}?${params.toString()}`);
  }

  function openDetail(event: React.MouseEvent<HTMLElement>, id: string) {
    openDetailFromOrigin(event.currentTarget, id);
  }

  function clearFilters() {
    setQuery("");
    setPersona("all");
  }

  useEffect(() => setEvidencePage(0), [persona, query, view.slug]);

  useEffect(() => {
    if (evidencePage >= evidencePageCount) setEvidencePage(evidencePageCount - 1);
  }, [evidencePage, evidencePageCount]);

  return (
    <>
      <main className={`model-page ${detailId ? "has-open-detail" : ""}`}>
        <Image className="model-watermark" src="/brand/ilia-sign-light.png" alt="" width={620} height={732} priority />
        <header className="site-header model-header">
          <Link className="brand-link" href={`/${locale}/canvas`} aria-label="ILIA">
            <Image src="/brand/ilia-logo-light.png" alt="ILIA" width={126} height={84} priority />
          </Link>
          <nav className="header-actions" aria-label={locale === "fa" ? "ناوبری مدل" : "Model navigation"}>
            <Link className="model-back" href={`/${locale}/canvas?view=ecosystem`}>
              <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
              {text.back}
            </Link>
            <Link className="locale-switch" href={otherLocaleHref} hrefLang={otherLocale}>{text.language}</Link>
          </nav>
        </header>

        <div className="model-wrap">
          <nav className="model-breadcrumb" aria-label={locale === "fa" ? "مسیر صفحه" : "Breadcrumb"}>
            <Link href={`/${locale}/canvas`}>{text.breadcrumb}</Link>
            <span aria-hidden="true">/</span>
            <span aria-current="page">{view.title}</span>
          </nav>

          <section className="model-hero">
            <div className="model-hero__copy">
              <p className={`status-pill status-pill--${view.status}`}>{view.statusLabel}</p>
              <h1>{view.title}</h1>
              <p>{view.description}</p>
            </div>
            <dl className="model-facts">
              <div><dt>{text.records}</dt><dd>{items.length.toLocaleString(locale === "fa" ? "fa-IR" : "en")}</dd></div>
              <div><dt>{text.slides}</dt><dd>{view.sourceSlidesLabel}</dd></div>
            </dl>
          </section>

          <nav className="model-switcher" aria-label={locale === "fa" ? "بلوک‌های بوم" : "Canvas blocks"}>
            {view.navigation.map((block) => (
              <Link key={block.slug} href={`/${locale}/model/${block.slug}`} aria-current={block.active ? "page" : undefined}>
                <span className={`status-dot status-dot--${block.status}`} aria-hidden="true" />
                {block.title}
              </Link>
            ))}
          </nav>

          <nav className="model-view-switcher" aria-label={locale === "fa" ? "نمای محتوای میدان" : "Model content view"}>
            <button type="button" aria-pressed={activePanel === "overview"} onClick={() => setActivePanel("overview")}><i />{text.overviewTab}</button>
            {view.analysis ? <button type="button" aria-pressed={activePanel === "analysis"} onClick={() => setActivePanel("analysis")}><i />{text.analysisTab}</button> : null}
            <button type="button" aria-pressed={activePanel === "evidence"} onClick={() => setActivePanel("evidence")}><i />{text.evidenceTab}<small>{matchingItems.length.toLocaleString(locale === "fa" ? "fa-IR" : "en")}</small></button>
          </nav>

          <div className="model-workspace">
            {activePanel === "overview" ? <div className="model-workspace-panel model-workspace-panel--overview"><ModelOverview locale={locale} items={items} personas={personas} /></div> : null}

            {activePanel === "analysis" && view.analysis ? <div className="model-workspace-panel model-workspace-panel--analysis"><VisualizationWorkbench
              analysis={view.analysis}
              locale={locale}
              personas={personas}
              activePersona={persona}
              onPersonaChange={setPersona}
              onOpenDetail={openDetailFromOrigin}
            /></div> : null}

            {activePanel === "evidence" ? <section className="model-workspace-panel model-workspace-panel--evidence">
              <header className="evidence-heading evidence-heading--workspace">
                <div><h2>{text.evidence}</h2><p>{text.evidenceHint}</p></div>
                <div className="model-evidence-controls">
                  <label className="model-evidence-search"><span className="sr-only">{text.search}</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg><input type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} /></label>
                  {personas.length ? <label className="model-evidence-persona"><span>{text.persona}</span><select value={persona} onChange={(event) => setPersona(event.target.value)}><option value="all">{text.all}</option>{personas.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}</select></label> : null}
                  {hasFilters ? <button className="model-evidence-clear" type="button" onClick={clearFilters}>{text.clear}</button> : null}
                </div>
              </header>

              {items.length === 0 ? <div className="model-empty"><h2>{text.emptyTitle}</h2><p>{text.emptyBody}</p></div>
                : matchingItems.length === 0 ? <div className="model-empty"><h2>{text.noMatch}</h2><button type="button" onClick={clearFilters}>{text.clear}</button></div>
                : <div className="evidence-list evidence-list--paged" aria-live="polite">{visibleEvidence.map((item) => <EvidenceRow key={item.id} item={item} locale={locale} openLabel={text.open} onOpen={openDetail} />)}</div>}

              {matchingItems.length > evidencePageSize ? <footer className="evidence-pager"><button type="button" onClick={() => setEvidencePage((page) => Math.max(0, page - 1))} disabled={evidencePage === 0}>{text.previousPage}</button><span>{text.page} {(evidencePage + 1).toLocaleString(locale === "fa" ? "fa-IR" : "en")} / {evidencePageCount.toLocaleString(locale === "fa" ? "fa-IR" : "en")}</span><button type="button" onClick={() => setEvidencePage((page) => Math.min(evidencePageCount - 1, page + 1))} disabled={evidencePage >= evidencePageCount - 1}>{text.nextPage}</button></footer> : null}
            </section> : null}
          </div>
        </div>
      </main>

      {mounted
        ? createPortal(
            <AnimatePresence>
              {detailId ? (
                <DetailModal
                  locale={locale}
                  detailId={detailId}
                  detail={detail}
                  loading={loading}
                  error={error}
                  panelRef={panelRef}
                  onClose={closeDetail}
                />
              ) : null}
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  );
}

function EvidenceRow({
  item,
  locale,
  openLabel,
  onOpen,
}: {
  item: ModelItemViewModel;
  locale: Locale;
  openLabel: string;
  onOpen: (event: React.MouseEvent<HTMLElement>, id: string) => void;
}) {
  return (
    <button
      className="evidence-row"
      type="button"
      data-item-id={item.id}
      aria-haspopup="dialog"
      aria-label={`${openLabel}: ${item.title}`}
      onClick={(event) => onOpen(event, item.id)}
    >
      <span className="evidence-source">{item.slideLabel}</span>
      <span className="evidence-content">
        <span className="evidence-title">{item.title}</span>
        {item.preview ? <span className="evidence-preview">{item.preview}</span> : null}
      </span>
      <span className="evidence-meta">
        <span>{item.typeLabel}</span>
        {item.visualizationKind ? <span>{item.visualizationKind.replaceAll("-", " ")}</span> : null}
        {item.translationPending ? <span>{locale === "fa" ? "بازبینی ترجمه" : "Translation review"}</span> : null}
      </span>
      <svg className="evidence-open" viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
    </button>
  );
}
