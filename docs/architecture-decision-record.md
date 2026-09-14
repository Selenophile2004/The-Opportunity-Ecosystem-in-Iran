# ADR-0001: پشته و معماری نسخهٔ نهایی

- وضعیت: پذیرفته و منطبق با پیاده‌سازی
- تاریخ تصمیم اولیه: 2026-09-10
- بازبینی نهایی: 2026-09-11

## زمینه

محصول باید ۱۴۵ اسلاید مرجع را به یک تجربهٔ فارسی‌محور، دو‌زبانه و قابل‌ردیابی تبدیل کند: لندینگ جغرافیایی، ۹ مسیر مدل، فیلترهای shareable، جزئیات deep-linkable، نمودارهای drillable و ingestion بازتولیدپذیر.

## تصمیم اجراشده

- Next.js 16 با App Router، React 19 و TypeScript strict برای route و rendering؛
- CSS اختصاصی و responsive به‌جای framework utility؛
- routeهای `/fa` و `/en` و فرهنگ‌نامهٔ داخلی به‌جای وابستگی i18n؛
- JSON نرمال‌شده پشت `lib/content.ts` و validatorهای Zod در `src/content/`؛
- Python برای استخراج PPTX، manifest، overrides، versioning، diff و validation؛
- Framer Motion برای transitionها و پشتیبانی صریح از `prefers-reduced-motion`؛
- Canvas + `d3-geo`/`topojson-client`/`world-atlas` برای کرهٔ چرخان و ایران انتخاب‌پذیر؛
- ECharts با بارگذاری lazy برای نمودارهای کانال و روابط مشتری؛
- query string مرورگر برای `view`، `q`، `persona`، `status`، `detail`، `viz` و `drill`؛
- Playwright پایتون برای E2E و `unittest` استاندارد پایتون برای یکپارچگی محتوا.

Zustand، next-intl، Tailwind و Vitest به محصول اضافه نشدند؛ state فعلی با URL و component state قابل‌کنترل است و افزودن آن‌ها ارزش متناسبی ایجاد نمی‌کرد.

## مرزهای سیستم

```text
PPTX + source manifest + overrides
          ↓  scripts/content_pipeline.py
Data/content.{fa,en}.json + content/{fa,en}/**/*.json
          ↓  schema/repository/view-model
Next.js pages → globe/canvas → model → detail API/modal → nested insight
                          ↘ ECharts drill/table/export
```

فایل PPTX مرجع معنایی است؛ PDF فقط برای کنترل بصری به‌کار می‌رود. runtime هیچ مسیر مطلق محلی دریافت نمی‌کند و API فقط نام فایل و شمارهٔ اسلاید را بازمی‌گرداند.

## پیامدها

- canvas و صفحات locale به‌صورت static/SSG و صفحات مدل و API به‌صورت dynamic ساخته می‌شوند.
- ingestion در CLI/CI اجرا می‌شود و به runtime server وابسته نیست.
- repository abstraction مهاجرت آینده به database را بدون بازطراحی componentها ممکن می‌کند.
- کل تجربه بدون JavaScript کامل قابل استفاده نیست؛ این یک محصول تعاملی است، اما جدول fallback برای داده‌نماها و empty state برای دادهٔ ارائه‌نشده وجود دارد.
- وضعیت ترجمهٔ بازبینی‌نشده در UI آشکار می‌ماند و به‌عنوان ترجمهٔ رسمی عرضه نمی‌شود.

## تصمیم‌های امنیت و دسترس‌پذیری

- پارامترهای locale/id در API allow-list می‌شوند؛ source path مطلق عمومی نمی‌شود.
- modal اصلی focus trap، بازگرداندن focus، Escape و backdrop close دارد؛ پاپ‌آپ نکته قبل از modal والد بسته می‌شود.
- همهٔ کنترل‌های اصلی نام دسترس‌پذیر، focus visible و مسیر reduced-motion دارند.
- نمودارها کنترل select و جدول sortable جایگزین دارند.

## گزینهٔ ردشده

HTML/CSS/JavaScript تک‌فایلی به‌علت نبود routing، schema validation، ingestion و تست قابل نگهداری رد شد. ذخیرهٔ محتوای ساختاری داخل component نیز به‌علت قطع provenance و دشواری re-ingest رد شد.
