# The Opportunity Ecosystem in Iran

نسخهٔ وب تعاملی و دو‌زبانهٔ گزارش «اکوسیستم فرصت در ایران». تجربه از یک کرهٔ چرخان آغاز می‌شود؛ ایران به‌عنوان نقطهٔ ورود، ۹ میدان مدل کسب‌وکار را آشکار می‌کند. هر مدل به evidence واقعی، اسلاید منبع، modal مرکزی، پاپ‌آپ نکته و—در دو مدل داده‌دار—نمودار drillable متصل است.

## وضعیت تحویل

- فازهای ۰ تا ۵ تکمیل شده‌اند؛
- ۱۴۵/۱۴۵ اسلاید accounted و در runtime قابل ردیابی‌اند؛
- ۱۸۰ node فارسی و ۱۸۰ node انگلیسی با شناسه/source متناظر؛
- build production، TypeScript، validation، unit و QA مرورگر پاس؛
- ۱۵۵ متن انگلیسی همچنان صریحاً `needs_review` هستند و ترجمهٔ رسمی تلقی نمی‌شوند؛
- Cost Structure در منبع ارائه نشده و چهار بلوک دیگر `partial` هستند.

## پیش‌نیازها

- Node.js 22+
- pnpm 10+
- Python 3.11+
- برای QA مرورگر: Playwright Python و Chrome (مسیر قابل تنظیم با `CHROME_PATH`)

## نصب و اجرا

در Windows می‌توانید مستقیماً روی `run-project.bat` دوبار کلیک کنید. این فایل dependencyهای مفقود را نصب می‌کند، سرور را روی پورت ۳۰۰۰ اجرا می‌کند و پس از آماده‌شدن، صفحهٔ فارسی را در مرورگر باز می‌کند. پنجرهٔ آن را برای روشن‌ماندن سرور نبندید؛ با `Ctrl+C` سرور متوقف می‌شود.

اگر مرورگر نسخه‌ای بدون استایل نشان داد، tab قدیمی `localhost:3000` را ببندید و launcher را دوباره اجرا کنید. launcher برای جلوگیری از cache قدیمی، هر بار URL تازه‌ای تولید می‌کند. اگر پورت ۳۰۰۰ از قبل در اختیار برنامه‌ای باشد، پنجره باز می‌ماند و پیام خطای روشن نمایش می‌دهد.

```powershell
pnpm install --frozen-lockfile
Copy-Item .env.example .env.local
pnpm dev
```

سپس:

- فارسی: `http://localhost:3000/fa/canvas`
- انگلیسی: `http://localhost:3000/en/canvas`

ساخت و اجرای production:

```powershell
pnpm build
pnpm start
```

تنها متغیر محیطی فعلی `NEXT_PUBLIC_SITE_URL` است. نسخهٔ file-backed هیچ secret لازم ندارد.

## محتوا و ingestion

فایل PPTX داخل `Data/` منبع معنایی canonical است؛ PDF فقط برای کنترل بصری استفاده می‌شود. فایل‌های `Data/content.{fa,en}.json` و `content/{fa,en}/` تولیدی‌اند. ویرایش انسانی را در `content/overrides.json` ثبت کنید تا ingestion بعدی آن را حفظ کند.

```powershell
pnpm ingest:dry-run
pnpm ingest
pnpm content:validate
pnpm content:validate:ts
pnpm content:diff
```

`content:validate:strict` موارد ترجمهٔ تأییدنشده را به خطای release gate تبدیل می‌کند. با منبع فعلی انتظار می‌رود این فرمان تا پایان review انگلیسی fail شود؛ این رفتار عمدی است.

## تست و QA

تست‌های محتوایی به dependency اضافه نیاز ندارند:

```powershell
pnpm test:content
```

برای QA رابط:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install playwright
pnpm build
pnpm start
```

در ترمینال دوم:

```powershell
pnpm qa:phase2
pnpm qa:phase3
pnpm qa:phase4
pnpm qa:phase5
```

یا همه را با `pnpm qa:all` اجرا کنید. `PHASE2_BASE_URL` تا `PHASE5_BASE_URL` آدرس هر suite را override می‌کنند. خروجی JSON و screenshotها زیر `artifacts/phase*/` نوشته می‌شوند.

## معماری کوتاه

- Next.js App Router + React + TypeScript strict؛
- JSON repository + Zod validation؛
- Canvas/d3-geo برای کره و TopoJSON جهان؛
- Framer Motion برای transition و reduced-motion؛
- ECharts lazy برای نمودار، table fallback و export؛
- Python pipeline برای extraction، hash، version، override، diff و validation؛
- query-string برای state اشتراک‌پذیر و detail deep link.

## مستندات اصلی

- `docs/phase-0-audit.md` و `docs/content-inventory.md`: ممیزی و inventory اسلایدبه‌اسلاید؛
- `docs/content-model.md` و `docs/data-mapping.md`: schema و نگاشت محتوا؛
- `docs/ingestion-pipeline.md`: بازتولید، override، version و failure gates؛
- `docs/information-architecture.md` و `docs/design-system.md`: IA و قواعد طراحی؛
- `docs/architecture-decision-record.md`: معماری واقعی نسخهٔ نهایی؛
- `docs/phase-2-report.md` تا `docs/phase-4-report.md`: گزارش‌های پیاده‌سازی مرحله‌ای؛
- `docs/final-coverage-report.md`: نتیجهٔ کنترل ۱۴۵ اسلاید و کیفیت داده؛
- `docs/phase-5-report.md`: ماتریس پذیرش، QA، performance و اقدامات بعدی؛
- `docs/assumptions-and-gaps.md`: محدودیت‌های منبع، برند و ترجمه.

## استقرار

هر میزبان سازگار با Next.js/Node می‌تواند پروژه را اجرا کند:

1. dependencyها را با lockfile نصب کنید؛
2. `NEXT_PUBLIC_SITE_URL` را روی origin نهایی قرار دهید؛
3. `pnpm content:validate`، `pnpm test:content` و `pnpm build` را در CI اجرا کنید؛
4. خروجی را با `pnpm start` سرو کنید؛
5. پس از تأیید ترجمه‌ها، `pnpm content:validate:strict` را هم به release gate اضافه کنید.

در استقرار production، HTTPS، headerهای امنیتی میزبان، cache/CDN و telemetry باید بر اساس سیاست سازمان تنظیم شوند؛ این repository credential یا تنظیمات vendor-specific نگه نمی‌دارد.
