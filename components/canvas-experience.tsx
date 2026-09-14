"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { IranGlobe } from "@/components/iran-globe";
import type { CanvasValueViewModel, CanvasViewModel } from "@/lib/content";

type TransitionCard = { slug: string; title: string; rect: { top: number; left: number; width: number; height: number }; center: { top: number; left: number } };
type IntroPhase = "boot" | "reveal" | "done";
type CanvasSide = "value" | "efficiency";

const canvasSides: Record<string, readonly CanvasSide[]> = {
  "key-partners": ["efficiency"],
  "key-activities": ["efficiency"],
  "key-resources": ["efficiency"],
  "value-propositions": ["value", "efficiency"],
  "customer-relationships": ["value"],
  channels: ["value"],
  "customer-segments": ["value"],
  "cost-structure": ["efficiency"],
  "revenue-streams": ["value"],
};

const canvasFlowEdges = [
  { id: "partners-activities", from: "key-partners", to: "key-activities", path: "M188 185 C225 185 230 122 274 122" },
  { id: "partners-resources", from: "key-partners", to: "key-resources", path: "M188 220 C225 220 230 330 274 330" },
  { id: "activities-value", from: "key-activities", to: "value-propositions", path: "M386 122 C430 122 430 195 468 195" },
  { id: "resources-value", from: "key-resources", to: "value-propositions", path: "M386 330 C430 330 430 225 468 225" },
  { id: "value-relationships", from: "value-propositions", to: "customer-relationships", path: "M532 195 C570 195 570 122 614 122" },
  { id: "value-channels", from: "value-propositions", to: "channels", path: "M532 225 C570 225 570 330 614 330" },
  { id: "relationships-segments", from: "customer-relationships", to: "customer-segments", path: "M726 122 C770 122 775 185 812 185" },
  { id: "channels-segments", from: "channels", to: "customer-segments", path: "M726 330 C770 330 775 220 812 220" },
  { id: "delivery-revenue", from: "channels", to: "revenue-streams", path: "M670 405 C670 462 735 470 735 505" },
  { id: "engine-cost", from: "key-activities", to: "cost-structure", path: "M330 405 C330 462 285 470 285 505" },
] as const;

const ui = {
  fa: {
    enter: "ایران را روی کره انتخاب کنید", enterHint: "کره را بکشید و بچرخانید؛ سپس خود ایران را انتخاب کنید.",
    orbitTitle: "۹ میدان فرصت، یک اکوسیستم", orbitHint: "هر مدار یک زاویه مستقل برای طراحی کسب‌وکار در ایران است.",
    search: "جست‌وجو", searchPlaceholder: "جست‌وجوی میدان یا مؤلفه…", status: "وضعیت داده", all: "همه",
    reset: "پاک‌کردن", open: "ورود به میدان", language: "English", backToWorld: "بازگشت به جهان", noMatch: "میدانی با این فیلتر پیدا نشد.",
    values: "مؤلفه‌ها", filters: "فیلترها", results: "نتیجه", selected: "انتخاب‌شده", linked: "مرتبط", clearSelection: "حذف انتخاب", selectHint: "یک مؤلفه را برای دیدن ارتباط آن با سایر بخش‌های بوم انتخاب کنید",
    sideFilter: "تمرکز بوم", sides: { value: "بخش ارزش", efficiency: "بخش کارایی" },
  },
  en: {
    enter: "Select Iran on the globe", enterHint: "Drag to rotate the globe, then select Iran itself.",
    orbitTitle: "Nine opportunity fields. One ecosystem.", orbitHint: "Each orbit is a distinct lens for designing a business in Iran.",
    search: "Search", searchPlaceholder: "Search fields or elements…", status: "Data status", all: "All",
    reset: "Clear", open: "Enter field", language: "فارسی", backToWorld: "Back to the world", noMatch: "No field matches these filters.",
    values: "Elements", filters: "Filters", results: "results", selected: "Selected", linked: "linked", clearSelection: "Clear selection", selectHint: "Select an element to trace its links across the canvas",
    sideFilter: "Canvas focus", sides: { value: "Value side", efficiency: "Efficiency side" },
  },
} as const;

const portalFragments = [
  { x: -290, y: -190 }, { x: -110, y: -270 }, { x: 95, y: -250 }, { x: 280, y: -150 },
  { x: 340, y: 24 }, { x: 255, y: 205 }, { x: 80, y: 285 }, { x: -125, y: 265 },
  { x: -300, y: 170 }, { x: -350, y: -20 }, { x: 175, y: 90 }, { x: -170, y: 105 },
];

function valuesAreLinked(selected: CanvasValueViewModel, candidate: CanvasValueViewModel): boolean {
  if (selected.id === candidate.id) return true;
  if (selected.parentSlug === candidate.parentSlug) return false;

  const sharedPersonas = candidate.personaIds.filter((id) => selected.personaIds.includes(id)).length;
  const sharedTags = candidate.tags.filter((tag) => selected.tags.includes(tag)).length;
  const includesCustomerSegment = selected.parentSlug === "customer-segments" || candidate.parentSlug === "customer-segments";

  if (includesCustomerSegment) return sharedPersonas > 0;
  return (sharedPersonas > 0 && sharedTags > 0) || sharedTags >= 2;
}

function ModelGlyph({ index }: { index: number }) {
  const glyphs = [
    <><circle cx="7" cy="12" r="2.5" /><circle cx="17" cy="7" r="2.5" /><circle cx="17" cy="17" r="2.5" /><path d="m9.3 10.8 5.4-2.7M9.3 13.2l5.4 2.7" /></>,
    <><path d="M6 8h12M6 12h8M6 16h10" /><circle cx="18" cy="12" r="2" /></>,
    <><path d="m12 4 7 4v8l-7 4-7-4V8l7-4Z" /><path d="m5 8 7 4 7-4M12 12v8" /></>,
    <><path d="m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z" /></>,
    <><circle cx="12" cy="12" r="3" /><path d="M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1" /></>,
    <><path d="M4 16c3-8 5 0 8-8s5 0 8-4" /><circle cx="4" cy="16" r="1.5" /><circle cx="20" cy="4" r="1.5" /></>,
    <><circle cx="9" cy="9" r="3" /><circle cx="16" cy="11" r="2.5" /><path d="M4 20c0-4 2-6 5-6s5 2 5 6M13 16c1-.8 2-1 3-1 2.5 0 4 1.7 4 5" /></>,
    <><path d="M5 5v14h14M8 15l3-3 3 2 5-6" /></>,
    <><path d="M5 18h14M7 15V9M12 15V5M17 15v-3" /></>,
  ];
  return <svg viewBox="0 0 24 24" aria-hidden="true">{glyphs[index % glyphs.length]}</svg>;
}

export function CanvasExperience(view: CanvasViewModel) {
  const { locale, blocks, title } = view;
  const text = ui[locale];
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const prefersReducedMotion = useReducedMotion();
  const searchRef = useRef<HTMLInputElement>(null);
  const allValues = useMemo(() => blocks.flatMap((block) => block.values), [blocks]);
  const validValue = allValues.some((value) => value.id === searchParams.get("value")) ? searchParams.get("value") : null;
  const validSide = !validValue && (searchParams.get("side") === "value" || searchParams.get("side") === "efficiency") ? searchParams.get("side") as CanvasSide : null;
  const [entered, setEntered] = useState(searchParams.get("view") === "ecosystem");
  const [query, setQuery] = useState(searchParams.get("q") ?? "");
  const [status, setStatus] = useState(searchParams.get("status") ?? "all");
  const [selectedValueId, setSelectedValueId] = useState<string | null>(validValue);
  const [selectedSide, setSelectedSide] = useState<CanvasSide | null>(validSide);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [compactFieldSlug, setCompactFieldSlug] = useState<string | null>(null);
  const [transitionCard, setTransitionCard] = useState<TransitionCard | null>(null);
  const [introPhase, setIntroPhase] = useState<IntroPhase>(searchParams.get("view") === "ecosystem" ? "done" : "boot");

  const selectedValue = allValues.find((value) => value.id === selectedValueId) ?? null;
  const relatedIds = useMemo(() => new Set(selectedValue
    ? allValues.filter((value) => valuesAreLinked(selectedValue, value)).map((value) => value.id)
    : []), [allValues, selectedValue]);
  const linkedCount = Math.max(0, relatedIds.size - (selectedValue ? 1 : 0));
  const relatedSlugs = useMemo(() => new Set(selectedValue
    ? allValues.filter((value) => relatedIds.has(value.id)).map((value) => value.parentSlug)
    : []), [allValues, relatedIds, selectedValue]);
  const statusOptions = useMemo(() => Array.from(new Map(blocks.map((block) => [block.status, block.statusLabel])).entries()), [blocks]);

  useEffect(() => { localStorage.setItem("opportunity-ecosystem-locale", locale); }, [locale]);
  useEffect(() => {
    const launchParams = new URLSearchParams(window.location.search);
    const startsInside = launchParams.get("view") === "ecosystem";
    const forceIntro = launchParams.has("launch");
    const alreadyPlayed = sessionStorage.getItem("ilia-signal-intro") === "played";
    if (startsInside || (alreadyPlayed && !forceIntro)) { setIntroPhase("done"); return; }
    const bootDuration = prefersReducedMotion ? 360 : 3000;
    const totalDuration = prefersReducedMotion ? 620 : 4200;
    setIntroPhase("boot");
    const revealTimer = window.setTimeout(() => setIntroPhase("reveal"), bootDuration);
    const doneTimer = window.setTimeout(() => { sessionStorage.setItem("ilia-signal-intro", "played"); setIntroPhase("done"); }, totalDuration);
    return () => { window.clearTimeout(revealTimer); window.clearTimeout(doneTimer); };
  }, [prefersReducedMotion]);

  useEffect(() => {
    const handlePop = () => {
      const params = new URLSearchParams(window.location.search);
      const nextValue = params.get("value");
      setEntered(params.get("view") === "ecosystem");
      setSelectedValueId(nextValue);
      setSelectedSide(!nextValue && (params.get("side") === "value" || params.get("side") === "efficiency") ? params.get("side") as CanvasSide : null);
      setQuery(params.get("q") ?? ""); setStatus(params.get("status") ?? "all");
    };
    window.addEventListener("popstate", handlePop);
    return () => window.removeEventListener("popstate", handlePop);
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (entered) params.set("view", "ecosystem"); else params.delete("view");
    if (query.trim()) params.set("q", query.trim()); else params.delete("q");
    params.delete("persona");
    if (status !== "all") params.set("status", status); else params.delete("status");
    params.delete("field");
    if (selectedValueId) params.set("value", selectedValueId); else params.delete("value");
    if (selectedSide) params.set("side", selectedSide); else params.delete("side");
    window.history.replaceState(window.history.state, "", params.size ? `${pathname}?${params}` : pathname);
  }, [entered, pathname, query, selectedSide, selectedValueId, status]);

  const matches = (block: CanvasViewModel["blocks"][number]) => {
    const needle = query.trim().toLocaleLowerCase(locale);
    return (!needle || block.searchableText.includes(needle))
      && (status === "all" || block.status === status);
  };
  const matchingCount = blocks.filter(matches).length;
  const hasFilters = query.trim() !== "" || status !== "all" || selectedSide !== null;
  const otherLocale = locale === "fa" ? "en" : "fa";
  const selectValue = (value: CanvasValueViewModel | null) => {
    const params = new URLSearchParams(window.location.search);
    params.set("view", "ecosystem");
    params.delete("field");
    if (value) params.set("value", value.id); else params.delete("value");
    window.history.pushState({ ...window.history.state, value: value?.id ?? null }, "", `${pathname}?${params}`);
    setSelectedValueId(value?.id ?? null);
    if (value) setSelectedSide(null);
    if (window.matchMedia("(max-width: 760px), (max-width: 900px) and (max-height: 480px) and (orientation: landscape)").matches) setCompactFieldSlug(null);
  };
  const selectSide = (side: CanvasSide) => {
    setSelectedSide((current) => current === side ? null : side);
    setSelectedValueId(null);
    setCompactFieldSlug(null);
  };
  const enterIran = () => { setEntered(true); selectValue(null); };
  const leaveIran = () => { setEntered(false); setSelectedValueId(null); setSelectedSide(null); setCompactFieldSlug(null); setQuery(""); setStatus("all"); };
  const openBlock = (event: React.MouseEvent<HTMLButtonElement>, slug: string, blockTitle: string) => {
    if (transitionCard) return;
    if (window.matchMedia("(max-width: 760px), (max-width: 900px) and (max-height: 480px) and (orientation: landscape)").matches && compactFieldSlug !== slug) {
      setCompactFieldSlug(slug);
      return;
    }
    const destination = `/${locale}/model/${slug}`; router.prefetch(destination);
    const rect = event.currentTarget.getBoundingClientRect();
    setTransitionCard({ slug, title: blockTitle, rect: { top: rect.top, left: rect.left, width: rect.width, height: rect.height }, center: { top: window.innerHeight / 2 - rect.height / 2, left: window.innerWidth / 2 - rect.width / 2 } });
    window.setTimeout(() => router.push(destination), prefersReducedMotion ? 80 : 1080);
  };
  const reset = () => { setQuery(""); setSelectedSide(null); setStatus("all"); searchRef.current?.focus(); };
  const localeParams = new URLSearchParams(searchParams.toString());
  localeParams.delete("persona");
  if (entered) localeParams.set("view", "ecosystem");

  const filterControls = <div className="header-command__controls">
    <label className="header-search"><span className="sr-only">{text.search}</span><svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6.5" /><path d="m16 16 4 4" /></svg><input ref={searchRef} type="search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={text.searchPlaceholder} /></label>
    <div className="header-side-filter" role="group" aria-label={text.sideFilter}>
      {(["value", "efficiency"] as const).map((side) => <button key={side} type="button" data-side={side} aria-pressed={selectedSide === side} onClick={() => selectSide(side)}><i />{text.sides[side]}</button>)}
    </div>
    <label><span>{text.status}</span><select value={status} onChange={(event) => setStatus(event.target.value)}><option value="all">{text.all}</option>{statusOptions.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
    <button className={hasFilters ? "is-filtered" : ""} type="button" onClick={hasFilters ? reset : undefined} aria-label={hasFilters ? text.reset : undefined}><i />{matchingCount}/9 <span>{text.results}</span></button>
  </div>;

  return <main lang={locale === "fa" ? "fa-IR" : "en"} dir={locale === "fa" ? "rtl" : "ltr"} className={`canvas-page geo-journey ${entered ? "has-entered-iran" : "is-world-view"} ${selectedValue ? "has-value-selection" : ""} intro-${introPhase}`}>
    <header className="site-header geo-header">
      <Link className="brand-link" href={`/${locale}/canvas`} aria-label="ILIA"><Image src="/brand/ilia-logo-light.png" alt="ILIA" width={126} height={84} priority /></Link>
      <div className="header-command" data-open={filtersOpen}>{filterControls}</div>
      <button className="header-command-toggle" type="button" onClick={() => setFiltersOpen((open) => !open)} aria-expanded={filtersOpen}><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h16M7 12h10M10 17h4" /></svg><span>{text.filters}</span><b>{matchingCount}</b></button>
      <nav className="header-actions" aria-label={locale === "fa" ? "ناوبری اصلی" : "Primary navigation"}><Link className="locale-switch" href={`/${otherLocale}/canvas${localeParams.size ? `?${localeParams}` : ""}`} hrefLang={otherLocale}>{text.language}</Link></nav>
    </header>

    <motion.div className="geo-globe-stage" animate={entered ? { scale: 0.42, opacity: 0.34, y: "2vh", filter: "blur(0px)" } : introPhase === "boot" ? { scale: 0.82, opacity: 0, y: "2vh", filter: "blur(10px)" } : { scale: 1, opacity: 1, y: 0, filter: "blur(0px)" }} transition={{ duration: prefersReducedMotion ? 0.01 : introPhase === "reveal" ? 0.92 : 0.9, ease: [0.16, 1, 0.3, 1] }} aria-hidden={entered}><IranGlobe locale={locale} selected={entered} onSelect={enterIran} /></motion.div>

    <AnimatePresence mode="wait">{!entered ?
      <motion.section className="world-copy" key="world" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, y: -24 }} transition={{ duration: prefersReducedMotion ? 0.01 : 0.55 }}><h1>{title}</h1><p className="sr-only">{text.enter}. {text.enterHint}</p></motion.section>
      : <motion.section className="ecosystem-stage ecosystem-stage--clusters" key="ecosystem" initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: prefersReducedMotion ? 0.01 : 0.36 }}>
        <header className="ecosystem-intro ecosystem-intro--clusters">
          <button type="button" onClick={leaveIran}>{text.backToWorld}</button>
          <div><h1>{text.orbitTitle}</h1><p>{text.orbitHint}</p></div>
        </header>
        <motion.aside className={`selection-signal ${selectedValue ? "" : "is-idle"}`} initial={{ opacity: 0.82 }} animate={{ opacity: 1 }} transition={{ duration: prefersReducedMotion ? 0.01 : 0.18 }} aria-live="polite">
          {selectedValue ? <><span><i />{text.selected}</span><strong>{selectedValue.title}</strong><small>{selectedValue.parentTitle} · {linkedCount.toLocaleString(locale === "fa" ? "fa-IR" : "en")} {text.linked}</small><button type="button" onClick={() => selectValue(null)}>{text.clearSelection} ×</button></> : <><span><i />{text.values}</span><strong>{text.selectHint}</strong><small>{allValues.length.toLocaleString(locale === "fa" ? "fa-IR" : "en")} {text.values}</small></>}
        </motion.aside>
        <div dir="ltr" className={`opportunity-cluster-board ${compactFieldSlug ? "has-compact-focus" : ""} ${selectedSide ? `has-side-focus side-focus--${selectedSide}` : ""}`} aria-label={text.orbitTitle}>
          <svg className="canvas-relations" viewBox="0 0 1000 620" preserveAspectRatio="none" aria-hidden="true">
            <defs><marker id="canvas-arrow" viewBox="0 0 8 8" refX="7" refY="4" markerWidth="6" markerHeight="6" orient="auto"><path d="M0 0 8 4 0 8Z" /></marker></defs>
            {canvasFlowEdges.map((edge) => <path key={edge.id} d={edge.path} className={selectedValue && relatedSlugs.has(edge.from) && relatedSlugs.has(edge.to) ? "is-active" : ""} markerEnd="url(#canvas-arrow)" />)}
            <path className="canvas-relations__economics" d="M132 520 C340 468 660 468 868 520" />
          </svg>
          {blocks.map((block, index) => {
            const isMatch = matches(block);
            const isLaunching = transitionCard?.slug === block.slug;
            const relatedInBlock = selectedValue ? block.values.filter((value) => relatedIds.has(value.id)).length : 0;
            const sides = canvasSides[block.slug] ?? ["efficiency"];
            const primarySide = sides[0];
            const isCompactFocus = compactFieldSlug === block.slug;
            const isSideActive = selectedSide !== null && sides.includes(selectedSide);
            const isSideDimmed = selectedSide !== null && !isSideActive;
            return <motion.section dir={locale === "fa" ? "rtl" : "ltr"} key={block.id} data-side={primarySide} data-sides={sides.join(" ")} className={`opportunity-cluster opportunity-cluster--${block.slug} ${isCompactFocus ? "is-compact-focus" : ""} ${compactFieldSlug && !isCompactFocus ? "is-compact-background" : ""} ${hasFilters && !isMatch ? "is-filtered-out" : ""} ${isSideDimmed ? "is-side-dimmed" : ""} ${isSideActive ? "is-side-active" : ""} ${selectedValue && relatedInBlock === 0 ? "is-unlinked-cluster" : ""}`} initial={{ opacity: 0.72, scale: 0.985 }} animate={{ opacity: hasFilters && !isMatch ? 0.18 : 1, scale: 1 }} transition={{ delay: prefersReducedMotion ? 0 : index * 0.025, duration: prefersReducedMotion ? 0.01 : 0.24 }}>
              <header className="opportunity-cluster__header">
                <button type="button" className={`opportunity-field ${isLaunching ? "is-launching" : ""}`} onPointerEnter={() => router.prefetch(`/${locale}/model/${block.slug}`)} onFocus={() => router.prefetch(`/${locale}/model/${block.slug}`)} onClick={(event) => openBlock(event, block.slug, block.title)} aria-label={`${text.open}: ${block.title}`}>
                  <span className="opportunity-field__glyph"><ModelGlyph index={index} /></span><span><strong>{block.title}</strong><small>{block.values.length.toLocaleString(locale === "fa" ? "fa-IR" : "en")} {text.values}</small></span>
                </button>
                {selectedValue ? <span className="opportunity-cluster__relation-count">{relatedInBlock.toLocaleString(locale === "fa" ? "fa-IR" : "en")}</span> : <span className={`opportunity-cluster__status opportunity-cluster__status--${block.status}`} title={block.statusLabel} />}
                <button type="button" className="opportunity-cluster__compact-close" onClick={() => setCompactFieldSlug(null)} aria-label={text.clearSelection}>×</button>
              </header>
              <div className="opportunity-values">
                {block.values.map((value) => {
                  const isSelected = selectedValue?.id === value.id;
                  const isRelated = selectedValue ? relatedIds.has(value.id) : false;
                  return <button type="button" key={value.id} className={`opportunity-value ${isSelected ? "is-selected" : ""} ${selectedValue && !isRelated ? "is-unrelated" : isRelated ? "is-related" : ""}`} onClick={() => selectValue(isSelected ? null : value)} aria-pressed={isSelected}><i /><span>{value.title}</span></button>;
                })}
              </div>
            </motion.section>;
          })}
        </div>
        {matchingCount === 0 ? <p className="orbit-no-match">{text.noMatch}</p> : null}
      </motion.section>}
    </AnimatePresence>

    <AnimatePresence>{transitionCard ? <motion.div className="route-transition-card route-transition-card--orbital" initial={{ top: transitionCard.rect.top, left: transitionCard.rect.left, width: transitionCard.rect.width, height: transitionCard.rect.height, borderRadius: "50%", opacity: 1, scale: 1 }} animate={prefersReducedMotion ? { opacity: 0 } : { top: transitionCard.center.top - 7, left: transitionCard.center.left - 7, width: transitionCard.rect.width + 14, height: transitionCard.rect.height + 14, borderRadius: "50%", opacity: 1, scale: 1.08 }} exit={{ opacity: 0, scale: 1.8 }} transition={{ duration: prefersReducedMotion ? 0.06 : 0.46, ease: [0.22, 1, 0.36, 1] }} aria-hidden="true"><i className="route-portal__orbit" /><i className="route-portal__axis" /><i className="route-portal__burst" /><span className="route-portal__title">{transitionCard.title}</span><span className="route-portal__fragments">{portalFragments.map((fragment, index) => <i key={index} style={{ "--burst-x": `${fragment.x}px`, "--burst-y": `${fragment.y}px`, "--burst-delay": `${index * 12}ms` } as React.CSSProperties} />)}</span></motion.div> : null}</AnimatePresence>
    <AnimatePresence>{introPhase !== "done" ? <motion.div className={`signal-intro signal-intro--${introPhase}`} initial={{ opacity: 1 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: prefersReducedMotion ? 0.08 : 0.14 }} aria-hidden="true"><div className="signal-intro__glitch-field"><i /><i /><i /><i /></div><div className="signal-intro__logo"><div className="signal-intro__logo-frame"><Image className="signal-intro__ghost signal-intro__ghost--cyan" src="/brand/ilia-logo-light.png" alt="" width={330} height={220} priority /><Image className="signal-intro__ghost signal-intro__ghost--gold" src="/brand/ilia-logo-light.png" alt="" width={330} height={220} priority /><Image src="/brand/ilia-logo-light.png" alt="" width={330} height={220} priority /></div></div></motion.div> : null}</AnimatePresence>
  </main>;
}
