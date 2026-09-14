import type { CSSProperties } from "react";

import type { Locale, ModelItemViewModel } from "@/lib/content";

type Persona = { id: string; title: string; count: number };

const overviewCopy = {
  fa: {
    eyebrow: "خلاصه دیداری",
    title: "ترکیب شواهد این میدان",
    description: "یک نگاه کوتاه به نوع داده‌ها، وضعیت اعتبار و گروه‌های درگیر.",
    types: "رکوردها بر پایه نوع",
    statuses: "وضعیت داده",
    personas: "پرسوناهای پرتکرار",
    sources: "پوشش منبع",
    records: "رکورد",
    slides: "اسلاید یکتا",
    noPersona: "برای این میدان پرسونای مستقیمی ثبت نشده است.",
    accessibleSummary: "خلاصه آماری شواهد میدان",
  },
  en: {
    eyebrow: "Visual brief",
    title: "Evidence composition",
    description: "A compact view of record types, confidence status, and involved audiences.",
    types: "Records by type",
    statuses: "Data status",
    personas: "Frequent personas",
    sources: "Source coverage",
    records: "records",
    slides: "unique slides",
    noPersona: "No directly linked persona is recorded for this model.",
    accessibleSummary: "Statistical summary of model evidence",
  },
} as const;

const statusColors: Record<ModelItemViewModel["status"], string> = {
  available: "#43cbb7",
  partial: "#ffd400",
  planned: "#7190ad",
  not_provided: "#39495b",
};

function localNumber(value: number, locale: Locale) {
  return value.toLocaleString(locale === "fa" ? "fa-IR" : "en");
}

export function ModelOverview({
  locale,
  items,
  personas,
}: {
  locale: Locale;
  items: ModelItemViewModel[];
  personas: Persona[];
}) {
  const text = overviewCopy[locale];
  const total = items.length;
  const typeCounts = Array.from(
    items.reduce((map, item) => map.set(item.typeLabel, (map.get(item.typeLabel) ?? 0) + 1), new Map<string, number>()),
  )
    .map(([label, count]) => ({ label, count }))
    .sort((left, right) => right.count - left.count || left.label.localeCompare(right.label, locale))
    .slice(0, 6);
  const largestType = Math.max(1, ...typeCounts.map((item) => item.count));

  const statusCounts = Array.from(
    items.reduce(
      (map, item) => {
        const current = map.get(item.status);
        map.set(item.status, { label: item.statusLabel, count: (current?.count ?? 0) + 1 });
        return map;
      },
      new Map<ModelItemViewModel["status"], { label: string; count: number }>(),
    ),
  )
    .map(([status, value]) => ({ status, ...value }))
    .sort((left, right) => right.count - left.count);

  let statusOffset = 0;
  const statusSegments = statusCounts.map((item) => {
    const percentage = total ? (item.count / total) * 100 : 0;
    const segment = { ...item, percentage, offset: statusOffset };
    statusOffset += percentage;
    return segment;
  });

  const topPersonas = [...personas].sort((left, right) => right.count - left.count).slice(0, 4);
  const largestPersona = Math.max(1, ...topPersonas.map((item) => item.count));
  const uniqueSlides = new Set(items.flatMap((item) => item.slideNumbers)).size;

  return (
    <section className="model-overview" aria-labelledby="model-overview-title">
      <header className="overview-heading">
        <div>
          <p>{text.eyebrow}</p>
          <h2 id="model-overview-title">{text.title}</h2>
        </div>
        <span>{text.description}</span>
      </header>

      <div className="overview-layout">
        <figure className="overview-ranking" aria-labelledby="overview-types-title">
          <figcaption id="overview-types-title">{text.types}</figcaption>
          <ol>
            {typeCounts.map((item, index) => (
              <li key={item.label}>
                <span className="overview-rank" aria-hidden="true">{localNumber(index + 1, locale)}</span>
                <span className="overview-type-label">{item.label}</span>
                <span className="overview-bar-track" aria-hidden="true">
                  <span style={{ "--overview-width": `${Math.max(8, (item.count / largestType) * 100)}%` } as CSSProperties} />
                </span>
                <strong>{localNumber(item.count, locale)}</strong>
              </li>
            ))}
          </ol>
        </figure>

        <div className="overview-secondary">
          <figure className="overview-status" aria-labelledby="overview-status-title">
            <figcaption id="overview-status-title">{text.statuses}</figcaption>
            <div className="overview-status__content">
              <div className="overview-ring" aria-hidden="true">
                <svg viewBox="0 0 42 42">
                  <circle className="overview-ring__base" cx="21" cy="21" r="15.9155" pathLength="100" />
                  {statusSegments.map((item) => (
                    <circle
                      key={item.status}
                      cx="21"
                      cy="21"
                      r="15.9155"
                      pathLength="100"
                      stroke={statusColors[item.status]}
                      strokeDasharray={`${item.percentage} ${100 - item.percentage}`}
                      strokeDashoffset={-item.offset}
                    />
                  ))}
                </svg>
                <span><strong>{localNumber(total, locale)}</strong><small>{text.records}</small></span>
              </div>
              <ul>
                {statusSegments.map((item) => (
                  <li key={item.status}>
                    <i style={{ backgroundColor: statusColors[item.status] }} aria-hidden="true" />
                    <span>{item.label}</span>
                    <strong>{localNumber(item.count, locale)}</strong>
                  </li>
                ))}
              </ul>
            </div>
          </figure>

          <section className="overview-personas" aria-labelledby="overview-personas-title">
            <h3 id="overview-personas-title">{text.personas}</h3>
            {topPersonas.length ? (
              <ol>
                {topPersonas.map((item) => (
                  <li key={item.id}>
                    <span>{item.title}</span>
                    <i aria-hidden="true"><b style={{ "--persona-width": `${Math.max(9, (item.count / largestPersona) * 100)}%` } as CSSProperties} /></i>
                    <strong>{localNumber(item.count, locale)}</strong>
                  </li>
                ))}
              </ol>
            ) : <p>{text.noPersona}</p>}
          </section>
        </div>
      </div>

      <footer className="overview-source-strip">
        <span>{text.sources}</span>
        <strong>{localNumber(uniqueSlides, locale)}</strong>
        <small>{text.slides}</small>
        <i aria-hidden="true"><b style={{ "--source-strength": `${Math.min(100, Math.max(12, uniqueSlides * 4))}%` } as CSSProperties} /></i>
      </footer>

      <table className="sr-only">
        <caption>{text.accessibleSummary}</caption>
        <thead><tr><th>{text.types}</th><th>{text.records}</th></tr></thead>
        <tbody>{typeCounts.map((item) => <tr key={item.label}><th scope="row">{item.label}</th><td>{item.count}</td></tr>)}</tbody>
      </table>
    </section>
  );
}
