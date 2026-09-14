"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import type { ECharts, EChartsOption } from "echarts";

import type {
  AnalysisViewModel,
  ChannelAnalysisViewModel,
  ChannelPriorityRowViewModel,
  Locale,
  RelationshipAnalysisViewModel,
  RelationshipZoneViewModel,
} from "@/lib/content";

type ChartDatum = { id?: string; name?: string; value?: unknown };

const copy = {
  fa: {
    eyebrow: "تحلیل تعاملی",
    channelInsight: "نقشه اولویت کانال‌ها",
    channelTakeaway: "اولویت‌های ۱ تا ۴ عیناً از سند آمده‌اند و مقیاس اثر کمی نیستند.",
    relationshipInsight: "پرتفوی رابطه با مشتری",
    relationshipTakeaway: "پنج ناحیه، جایگاه کیفی رابطه‌ها را بر پایه ارزش و پیچیدگی نشان می‌دهند.",
    chart: "نمودار",
    table: "جدول دسترس‌پذیر",
    exportCsv: "دریافت CSV",
    exportPng: "دریافت PNG",
    reset: "بازنشانی نما",
    allPriorities: "همه اولویت‌ها",
    priority: "اولویت",
    source: "منبع",
    openSource: "بازکردن جزئیات منبع",
    drillHint: "برای دیدن ابعاد، یک نقطه را انتخاب کنید.",
    zoneHint: "برای دیدن آرکی‌تایپ‌ها، یک ناحیه را انتخاب کنید.",
    dimensions: "ابعاد امتیاز کیفی",
    relationships: "آرکی‌تایپ‌های این ناحیه",
    allocations: "تخصیص پرسوناها",
    allPersonas: "همه پرسوناها",
    pending: "برچسب‌های انگلیسی ترجمهٔ کاری‌اند و نیاز به بازبینی دارند.",
    qualitative: "کیفی — فاقد مقیاس کمی",
    chartFailure: "رندر نمودار در دسترس نیست؛ جدول کامل همچنان قابل استفاده است.",
    columnChannel: "کانال",
    columnPriority: "اولویت",
    columnPersonas: "پرسونا",
    columnZone: "ناحیه",
    columnArchetype: "آرکی‌تایپ",
    noRows: "داده‌ای با فیلتر فعال باقی نمانده است.",
    filters: "فیلترهای تحلیل",
    hideFilters: "بستن فیلترها",
  },
  en: {
    eyebrow: "Interactive analysis",
    channelInsight: "Channel priority map",
    channelTakeaway: "Priorities 1–4 reproduce the source's ordinal labels; they are not measured effect sizes.",
    relationshipInsight: "Customer relationship portfolio",
    relationshipTakeaway: "Five qualitative zones position relationships by potential value and need complexity.",
    chart: "Chart",
    table: "Accessible table",
    exportCsv: "Download CSV",
    exportPng: "Download PNG",
    reset: "Reset view",
    allPriorities: "All priorities",
    priority: "Priority",
    source: "Source",
    openSource: "Open source detail",
    drillHint: "Select a point to inspect its dimensions.",
    zoneHint: "Select a zone to inspect its archetypes.",
    dimensions: "Qualitative score dimensions",
    relationships: "Archetypes in this zone",
    allocations: "Persona allocations",
    allPersonas: "All personas",
    pending: "English chart labels are a working translation awaiting review.",
    qualitative: "Qualitative — no quantitative scale",
    chartFailure: "The chart renderer is unavailable; the complete table remains usable.",
    columnChannel: "Channel",
    columnPriority: "Priority",
    columnPersonas: "Persona",
    columnZone: "Zone",
    columnArchetype: "Archetype",
    noRows: "No data remains under the active filter.",
    filters: "Analysis filters",
    hideFilters: "Hide filters",
  },
} as const;

function normalizedPriority(value: string | null) {
  return value && ["1", "2", "3", "4"].includes(value) ? value : "all";
}

function setUrlState(pathname: string, updates: Record<string, string | null>, push = false) {
  const params = new URLSearchParams(window.location.search);
  Object.entries(updates).forEach(([key, value]) => {
    if (value) params.set(key, value);
    else params.delete(key);
  });
  const next = params.toString() ? `${pathname}?${params.toString()}` : pathname;
  window.history[push ? "pushState" : "replaceState"](window.history.state, "", next);
}

function downloadBlob(name: string, type: string, content: BlobPart) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = name;
  anchor.click();
  URL.revokeObjectURL(url);
}

function csvCell(value: string | number) {
  const normalized = String(value).replaceAll('"', '""');
  return `"${normalized}"`;
}

function EChartSurface({
  option,
  ariaLabel,
  onSelect,
  onReady,
  onFailure,
}: {
  option: EChartsOption;
  ariaLabel: string;
  onSelect: (datum: ChartDatum, origin: HTMLElement) => void;
  onReady: (chart: ECharts | null) => void;
  onFailure: () => void;
}) {
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const chartRef = useRef<ECharts | null>(null);
  const optionRef = useRef(option);
  const selectRef = useRef(onSelect);
  const readyRef = useRef(onReady);
  const failureRef = useRef(onFailure);

  optionRef.current = option;
  selectRef.current = onSelect;
  readyRef.current = onReady;
  failureRef.current = onFailure;

  useEffect(() => {
    let active = true;
    let observer: ResizeObserver | null = null;
    import("echarts")
      .then((echarts) => {
        if (!active || !surfaceRef.current) return;
        const chart = echarts.init(surfaceRef.current, undefined, { renderer: "canvas" });
        chartRef.current = chart;
        chart.setOption(optionRef.current, true);
        chart.on("click", (params) => selectRef.current((params.data ?? {}) as ChartDatum, surfaceRef.current!));
        observer = new ResizeObserver(() => chart.resize());
        observer.observe(surfaceRef.current);
        readyRef.current(chart);
      })
      .catch(() => failureRef.current());
    return () => {
      active = false;
      observer?.disconnect();
      chartRef.current?.dispose();
      chartRef.current = null;
      readyRef.current(null);
    };
  }, []);

  useEffect(() => {
    chartRef.current?.setOption(option, true);
  }, [option]);

  return <div ref={surfaceRef} className="viz-chart" role="img" aria-label={ariaLabel} />;
}

function chartBase(locale: Locale, reducedMotion: boolean): EChartsOption {
  return {
    animation: !reducedMotion,
    animationDuration: reducedMotion ? 0 : 220,
    animationDurationUpdate: reducedMotion ? 0 : 180,
    backgroundColor: "transparent",
    textStyle: { color: "rgba(255,255,255,.76)", fontFamily: "inherit" },
    aria: { enabled: true },
    tooltip: {
      trigger: "item",
      renderMode: "richText",
      backgroundColor: "#09132A",
      borderColor: "rgba(255,192,0,.52)",
      textStyle: { color: "#fff", fontFamily: "inherit" },
      extraCssText: `direction:${locale === "fa" ? "rtl" : "ltr"};`,
    },
  };
}

function channelOption(locale: Locale, rows: ChannelPriorityRowViewModel[], compact: boolean, reducedMotion: boolean, selected?: ChannelPriorityRowViewModel): EChartsOption {
  if (selected) {
    return {
      ...chartBase(locale, reducedMotion),
      series: [{
        type: "tree",
        orient: locale === "fa" ? "RL" : "LR",
        left: "10%",
        right: "10%",
        top: "12%",
        bottom: "10%",
        symbol: "circle",
        symbolSize: 13,
        lineStyle: { color: "rgba(255,255,255,.22)", width: 1.5 },
        itemStyle: { color: "#FFC000", borderColor: "#09132A", borderWidth: 3 },
        label: { color: "rgba(255,255,255,.9)", fontSize: 12, lineHeight: 18 },
        leaves: { label: { color: "rgba(255,255,255,.76)" } },
        expandAndCollapse: false,
        data: [{
          id: selected.id,
          name: selected.label,
          children: selected.dimensions.map((dimension) => ({
            id: dimension.id,
            name: `${dimension.label}\n${dimension.value}`,
            value: dimension.value,
          })),
        }],
      }],
    };
  }
  const displayRows = [...rows].sort((a, b) => b.priority - a.priority || a.label.localeCompare(b.label, locale));
  return {
    ...chartBase(locale, reducedMotion),
    grid: { top: 20, right: compact ? 20 : 34, bottom: 48, left: compact ? 132 : locale === "fa" ? 250 : 280, containLabel: false },
    xAxis: {
      type: "value",
      min: 0.5,
      max: 4.5,
      interval: 1,
      name: copy[locale].priority,
      nameLocation: "middle",
      nameGap: 34,
      axisLine: { lineStyle: { color: "rgba(255,255,255,.22)" } },
      axisLabel: { color: "rgba(255,255,255,.74)" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,.08)" } },
    },
    yAxis: {
      type: "category",
      data: displayRows.map((row) => row.label),
      axisTick: { show: false },
      axisLine: { show: false },
      axisLabel: { color: "rgba(255,255,255,.82)", width: compact ? 118 : 230, overflow: "truncate", fontSize: compact ? 9 : 11 },
    },
    series: [{
      type: "scatter",
      symbolSize: 23,
      data: displayRows.map((row) => ({ id: row.id, name: row.label, value: [row.priority, row.label], priority: row.priority })),
      itemStyle: { color: "#FFC000", borderColor: "rgba(255,255,255,.92)", borderWidth: 2, shadowBlur: 10, shadowColor: "rgba(255,192,0,.28)" },
      label: { show: true, color: "#09132A", fontWeight: 800, formatter: (params: { value?: unknown }) => Array.isArray(params.value) ? String(params.value[0]) : "" },
      emphasis: { scale: 1.28, itemStyle: { shadowBlur: 18 } },
    }],
  };
}

function relationshipOption(locale: Locale, analysis: RelationshipAnalysisViewModel, compact: boolean, reducedMotion: boolean, selected?: RelationshipZoneViewModel): EChartsOption {
  if (selected) {
    return {
      ...chartBase(locale, reducedMotion),
      series: [{
        type: "tree",
        orient: locale === "fa" ? "RL" : "LR",
        left: "12%",
        right: "12%",
        top: "15%",
        bottom: "12%",
        symbolSize: 15,
        lineStyle: { color: "rgba(255,255,255,.24)" },
        itemStyle: { color: "#FFC000", borderColor: "#09132A", borderWidth: 3 },
        label: { color: "rgba(255,255,255,.9)", fontSize: 12 },
        expandAndCollapse: false,
        data: [{ id: selected.id, name: `${selected.id} · ${selected.label}`, children: selected.relationships.map((item) => ({ id: item.id, name: item.title })) }],
      }],
    };
  }
  return {
    ...chartBase(locale, reducedMotion),
    grid: { top: 34, right: compact ? 28 : 48, bottom: 64, left: compact ? 56 : 72 },
    xAxis: {
      type: "value", min: 0.5, max: 3.5, interval: 1, name: analysis.axes.x, nameLocation: "middle", nameGap: 38,
      axisLabel: { formatter: (value: number) => value === 1 ? analysis.axes.low : value === 2 ? analysis.axes.high : "", color: "rgba(255,255,255,.7)" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,.09)" } }, axisLine: { lineStyle: { color: "rgba(255,255,255,.24)" } },
    },
    yAxis: {
      type: "value", min: 0.5, max: 3.5, interval: 1, name: analysis.axes.y, nameLocation: "middle", nameGap: 50,
      axisLabel: { formatter: (value: number) => value === 1 ? analysis.axes.low : value === 2 ? analysis.axes.high : "", color: "rgba(255,255,255,.7)" },
      splitLine: { lineStyle: { color: "rgba(255,255,255,.09)" } }, axisLine: { lineStyle: { color: "rgba(255,255,255,.24)" } },
    },
    series: [{
      type: "scatter",
      data: analysis.zones.map((zone) => ({ id: zone.id, name: `${zone.id} · ${zone.label}`, value: [zone.x, zone.y] })),
      symbolSize: (value: number[]) => value[0] === 3 ? 66 : 54,
      itemStyle: { color: "rgba(255,192,0,.92)", borderColor: "#fff", borderWidth: 2, shadowBlur: 14, shadowColor: "rgba(255,192,0,.28)" },
      label: { show: true, position: "top", distance: 9, color: "rgba(255,255,255,.92)", width: compact ? 86 : 180, overflow: "truncate", fontSize: compact ? 9 : 11, formatter: "{b}" },
      emphasis: { scale: 1.18 },
    }],
  };
}

export function VisualizationWorkbench({
  analysis,
  locale,
  personas,
  activePersona,
  onPersonaChange,
  onOpenDetail,
}: {
  analysis: AnalysisViewModel;
  locale: Locale;
  personas: Array<{ id: string; title: string; count: number }>;
  activePersona: string;
  onPersonaChange: (persona: string) => void;
  onOpenDetail: (origin: HTMLElement, id: string) => void;
}) {
  const text = copy[locale];
  const pathname = usePathname();
  const params = useSearchParams();
  const [priority, setPriority] = useState(() => analysis.kind === "channel-priority" ? normalizedPriority(params.get("priority")) : "all");
  const [drill, setDrill] = useState(() => params.get("viz") === analysis.id ? params.get("drill") : null);
  const [view, setView] = useState<"chart" | "table">(() => params.get("vizView") === "table" ? "table" : "chart");
  const [sort, setSort] = useState<"label" | "priority">("priority");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [rendererFailed, setRendererFailed] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compact, setCompact] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const chartRef = useRef<ECharts | null>(null);

  useEffect(() => {
    const compactQuery = window.matchMedia("(max-width: 600px)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => {
      setCompact(compactQuery.matches);
      setReducedMotion(motionQuery.matches);
    };
    update();
    compactQuery.addEventListener("change", update);
    motionQuery.addEventListener("change", update);
    return () => {
      compactQuery.removeEventListener("change", update);
      motionQuery.removeEventListener("change", update);
    };
  }, []);

  useEffect(() => {
    const onPop = () => {
      const next = new URLSearchParams(window.location.search);
      setPriority(normalizedPriority(next.get("priority")));
      setDrill(next.get("viz") === analysis.id ? next.get("drill") : null);
      setView(next.get("vizView") === "table" ? "table" : "chart");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [analysis.id]);

  useEffect(() => {
    const validDrillIds = analysis.kind === "channel-priority" ? analysis.rows.map((item) => item.id) : analysis.zones.map((item) => item.id);
    if (drill && !validDrillIds.includes(drill)) {
      setDrill(null);
      setUrlState(pathname, { viz: null, drill: null });
    }
    if (analysis.kind === "channel-priority" && priority === "all" && params.get("priority")) {
      setUrlState(pathname, { priority: null });
    }
  }, [analysis, drill, params, pathname, priority]);

  const channelRows = useMemo(() => {
    if (analysis.kind !== "channel-priority") return [];
    return analysis.rows.filter((row) => {
      const matchesPriority = priority === "all" || row.priority === Number(priority);
      const matchesPersona = activePersona === "all" || row.personaIds.includes(activePersona);
      return matchesPriority && matchesPersona;
    });
  }, [activePersona, analysis, priority]);

  const selectedChannel = analysis.kind === "channel-priority" ? analysis.rows.find((row) => row.id === drill) : undefined;
  const selectedZone = analysis.kind === "relationship-matrix" ? analysis.zones.find((zone) => zone.id === drill) : undefined;
  const option = useMemo(
    () => analysis.kind === "channel-priority"
      ? channelOption(locale, channelRows, compact, reducedMotion, selectedChannel)
      : relationshipOption(locale, analysis, compact, reducedMotion, selectedZone),
    [analysis, channelRows, compact, locale, reducedMotion, selectedChannel, selectedZone],
  );
  const title = analysis.kind === "channel-priority" ? text.channelInsight : text.relationshipInsight;
  const takeaway = analysis.kind === "channel-priority" ? text.channelTakeaway : text.relationshipTakeaway;
  const ariaLabel = `${title}. ${takeaway}`;

  const setCommittedDrill = (value: string | null) => {
    setDrill(value);
    setUrlState(pathname, { viz: value ? analysis.id : null, drill: value }, true);
  };

  const onChartSelect = (datum: ChartDatum, origin: HTMLElement) => {
    if (!datum.id) return;
    if (analysis.kind === "channel-priority") {
      if (!selectedChannel) setCommittedDrill(datum.id);
      else if (datum.id !== selectedChannel.id) onOpenDetail(origin, analysis.sourceNodeId);
      return;
    }
    if (!selectedZone) setCommittedDrill(datum.id);
    else if (datum.id !== selectedZone.id) onOpenDetail(origin, datum.id);
  };

  const changePriority = (value: string) => {
    setPriority(value);
    setCommittedDrill(null);
    setUrlState(pathname, { priority: value === "all" ? null : value });
  };

  const changeView = (value: "chart" | "table") => {
    setView(value);
    setUrlState(pathname, { vizView: value === "chart" ? null : value });
  };

  const reset = () => {
    setPriority("all");
    setDrill(null);
    onPersonaChange("all");
    setUrlState(pathname, { viz: null, drill: null, priority: null, persona: null }, true);
  };

  const changeSort = (next: "label" | "priority") => {
    if (sort === next) setSortDirection((current) => current === "asc" ? "desc" : "asc");
    else {
      setSort(next);
      setSortDirection("asc");
    }
  };

  const exportCsv = () => {
    let lines: string[][];
    if (analysis.kind === "channel-priority") {
      lines = [
        [text.columnChannel, text.columnPriority, text.columnPersonas, ...analysis.rows[0].dimensions.map((item) => item.label)],
        ...channelRows.map((row) => [row.label, String(row.priority), row.personaIds.join(" | "), ...row.dimensions.map((item) => item.value)]),
      ];
    } else {
      lines = [
        [text.columnZone, text.columnArchetype, text.allocations],
        ...analysis.zones.map((zone) => [zone.id, zone.relationships.map((item) => item.title).join(" | "), zone.allocations.map((item) => item.title).join(" | ")]),
      ];
    }
    downloadBlob(`${analysis.id}.csv`, "text/csv;charset=utf-8", `\uFEFF${lines.map((line) => line.map(csvCell).join(",")).join("\r\n")}`);
  };

  const exportPng = () => {
    const dataUrl = chartRef.current?.getDataURL({ type: "png", pixelRatio: 2, backgroundColor: "#09132A" });
    if (!dataUrl) return;
    const anchor = document.createElement("a");
    anchor.href = dataUrl;
    anchor.download = `${analysis.id}.png`;
    anchor.click();
  };

  const tableChannelRows = [...(selectedChannel ? [selectedChannel] : channelRows)].sort((left, right) => {
    const result = sort === "priority" ? left.priority - right.priority : left.label.localeCompare(right.label, locale);
    return sortDirection === "asc" ? result : -result;
  });
  const personaLabel = (id: string) => personas.find((item) => item.id === id)?.title ?? id;
  const allocations = selectedZone?.allocations.filter((item) => activePersona === "all" || item.personaId === activePersona) ?? [];

  return (
    <section className="viz-workbench" aria-labelledby={`${analysis.id}-title`}>
      <header className="viz-header">
        <div>
          <p>{text.eyebrow}</p>
          <h2 id={`${analysis.id}-title`}>{title}</h2>
          <span>{takeaway}</span>
        </div>
        <div className="viz-source"><strong>{text.source}</strong><span>{analysis.slideLabel}</span><small>{analysis.sourceFile}</small></div>
      </header>

      <div className="viz-toolbar" aria-label={locale === "fa" ? "کنترل‌های تحلیل" : "Analysis controls"}>
        <div className="viz-segmented">
          <button type="button" aria-pressed={view === "chart"} onClick={() => changeView("chart")}>{text.chart}</button>
          <button type="button" aria-pressed={view === "table"} onClick={() => changeView("table")}>{text.table}</button>
        </div>
        <div className="viz-actions">
          <button type="button" onClick={exportCsv}>{text.exportCsv}</button>
          <button type="button" onClick={exportPng} disabled={rendererFailed}>{text.exportPng}</button>
          <button type="button" onClick={reset}>{text.reset}</button>
        </div>
      </div>

      <button
        className="viz-filter-toggle"
        type="button"
        aria-expanded={filtersOpen}
        aria-controls={`${analysis.id}-filters`}
        onClick={() => setFiltersOpen((current) => !current)}
      >
        <span>{filtersOpen ? text.hideFilters : text.filters}</span>
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4" /></svg>
      </button>

      <div className="viz-filters" id={`${analysis.id}-filters`} data-open={filtersOpen ? "true" : "false"}>
        {analysis.kind === "channel-priority" ? (
          <fieldset><legend>{text.priority}</legend><div>
            <button type="button" aria-pressed={priority === "all"} onClick={() => changePriority("all")}>{text.allPriorities}</button>
            {[1, 2, 3, 4].map((value) => <button type="button" key={value} aria-pressed={priority === String(value)} onClick={() => changePriority(String(value))}>{value.toLocaleString(locale === "fa" ? "fa-IR" : "en")}</button>)}
          </div></fieldset>
        ) : null}
        <fieldset><legend>{locale === "fa" ? "پرسونا" : "Persona"}</legend><div>
          <button type="button" aria-pressed={activePersona === "all"} onClick={() => onPersonaChange("all")}>{text.allPersonas}</button>
          {personas.map((item) => <button type="button" key={item.id} aria-pressed={activePersona === item.id} onClick={() => onPersonaChange(item.id)}>{item.title}</button>)}
        </div></fieldset>
      </div>

      <nav className="viz-breadcrumb" aria-label={locale === "fa" ? "سطح تحلیل" : "Analysis level"}>
        <button type="button" aria-current={!drill ? "page" : undefined} onClick={() => setCommittedDrill(null)}>{analysis.title}</button>
        {selectedChannel ? <><span>/</span><span aria-current="page">{selectedChannel.label}</span></> : null}
        {selectedZone ? <><span>/</span><span aria-current="page">{selectedZone.id} · {selectedZone.label}</span></> : null}
      </nav>

      <label className="viz-point-picker">
        <span>{analysis.kind === "channel-priority" ? text.columnChannel : text.columnZone}</span>
        <select value={drill ?? ""} onChange={(event) => setCommittedDrill(event.target.value || null)}>
          <option value="">{analysis.title}</option>
          {analysis.kind === "channel-priority"
            ? channelRows.map((row) => <option key={row.id} value={row.id}>{row.label}</option>)
            : analysis.zones.map((zone) => <option key={zone.id} value={zone.id}>{zone.id} · {zone.label}</option>)}
        </select>
      </label>

      {view === "chart" ? (
        <div className="viz-stage">
          {rendererFailed ? <p className="viz-error" role="status">{text.chartFailure}</p> : (
            <EChartSurface option={option} ariaLabel={ariaLabel} onSelect={onChartSelect} onReady={(chart) => { chartRef.current = chart; }} onFailure={() => setRendererFailed(true)} />
          )}
          <p className="viz-hint">{selectedChannel ? text.dimensions : selectedZone ? text.relationships : analysis.kind === "channel-priority" ? text.drillHint : text.zoneHint}</p>
        </div>
      ) : null}

      {analysis.kind === "channel-priority" && tableChannelRows.length === 0 ? <p className="viz-empty">{text.noRows}</p> : null}
      {view === "table" ? (
        <div className="viz-table-scroll" tabIndex={0}>
          <ul className="viz-mobile-records" aria-label={title}>
            {analysis.kind === "channel-priority"
              ? tableChannelRows.map((row) => (
                <li key={row.id}>
                  <button type="button" onClick={() => setCommittedDrill(row.id)}>{row.label}</button>
                  <dl>
                    <div><dt>{text.columnPriority}</dt><dd>{row.priority.toLocaleString(locale === "fa" ? "fa-IR" : "en")}</dd></div>
                    <div><dt>{text.columnPersonas}</dt><dd>{row.personaIds.map(personaLabel).join("، ") || "—"}</dd></div>
                    {row.dimensions.map((item) => <div key={item.id}><dt>{item.label}</dt><dd>{item.value}</dd></div>)}
                  </dl>
                </li>
              ))
              : analysis.zones.map((zone) => (
                <li key={zone.id}>
                  <button type="button" onClick={() => setCommittedDrill(zone.id)}>{zone.id} · {zone.label}</button>
                  <dl>
                    <div><dt>{text.columnArchetype}</dt><dd>{zone.relationships.map((item) => item.title).join("، ") || "—"}</dd></div>
                    <div><dt>{text.allocations}</dt><dd>{zone.allocations.filter((item) => activePersona === "all" || item.personaId === activePersona).map((item) => item.title).join("، ") || "—"}</dd></div>
                  </dl>
                </li>
              ))}
          </ul>
          {analysis.kind === "channel-priority" ? (
            <table><caption className="sr-only">{title}</caption><thead><tr><th><button type="button" className="viz-sort" onClick={() => changeSort("label")}>{text.columnChannel}<span aria-hidden="true">{sort === "label" ? sortDirection === "asc" ? " ↑" : " ↓" : ""}</span></button></th><th><button type="button" className="viz-sort" onClick={() => changeSort("priority")}>{text.columnPriority}<span aria-hidden="true">{sort === "priority" ? sortDirection === "asc" ? " ↑" : " ↓" : ""}</span></button></th><th>{text.columnPersonas}</th>{analysis.rows[0].dimensions.map((item) => <th key={item.id}>{item.label}</th>)}</tr></thead><tbody>
              {tableChannelRows.map((row) => <tr key={row.id}><th scope="row"><button className="viz-row-button" type="button" onClick={() => setCommittedDrill(row.id)}>{row.label}</button></th><td>{row.priority.toLocaleString(locale === "fa" ? "fa-IR" : "en")}</td><td>{row.personaIds.map(personaLabel).join("، ")}</td>{row.dimensions.map((item) => <td key={item.id}>{item.value}</td>)}</tr>)}
            </tbody></table>
          ) : (
            <table><caption className="sr-only">{title}</caption><thead><tr><th>{text.columnZone}</th><th>{text.columnArchetype}</th><th>{text.allocations}</th></tr></thead><tbody>
              {analysis.zones.map((zone) => <tr key={zone.id}><th scope="row"><button className="viz-row-button" type="button" onClick={() => setCommittedDrill(zone.id)}>{zone.id} · {zone.label}</button></th><td>{zone.relationships.map((item) => item.title).join("، ")}</td><td>{zone.allocations.filter((item) => activePersona === "all" || item.personaId === activePersona).map((item) => item.title).join("، ")}</td></tr>)}
            </tbody></table>
          )}
        </div>
      ) : null}

      {selectedZone ? <div className="viz-drill-detail"><h3>{text.allocations}</h3><div>{allocations.map((item) => <button type="button" key={item.id} onClick={(event) => onOpenDetail(event.currentTarget, item.id)}>{item.title}</button>)}</div></div> : null}
      {drill ? <button className="viz-open-source" type="button" onClick={(event) => onOpenDetail(event.currentTarget, analysis.sourceNodeId)}>{text.openSource}</button> : null}
      <footer className="viz-notes"><span>{text.qualitative}</span>{analysis.translationPending ? <span>{text.pending}</span> : null}</footer>
    </section>
  );
}
