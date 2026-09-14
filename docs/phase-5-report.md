# گزارش فاز ۵: تثبیت، QA و تحویل

- تاریخ: 2026-09-11
- وضعیت: تکمیل‌شده با محدودیت‌های محتوایی ثبت‌شده

## خروجی

نسخهٔ production با سفر تعاملی «جهان → ایران → ۹ مدل»، فیلترهای واقعی، routeهای مستقل، نمودارهای منبع‌دار، modal مرکزی و پاپ‌آپ نکتهٔ تو‌در‌تو تکمیل شد. مستندات، تست‌های یکپارچگی و QA مرورگر با طراحی نهایی همگام شدند.

## ماتریس پذیرش

| معیار | نتیجه | شاهد |
|---|---|---|
| ۱۴۵ اسلاید accounted | پاس | `final-coverage-report.md` و ۸ تست integrity |
| لندینگ شماتیک/تعاملی | پاس | کرهٔ Canvas، ایران زرد و ۹ مدار |
| filter highlight/dim | پاس | persona، status و search با URL state |
| data block route واقعی | پاس | هر ۹ route تست شد |
| data node modal deep-linkable | پاس | `?detail=slide-104` و API واقعی |
| hierarchy drill up/down | پاس | channel و relationship visualization |
| فارسی پیش‌فرض، انگلیسی دوم | پاس | redirect ریشه، RTL/LTR و locale switch |
| رنگ‌های برند | پاس | navy/gold/mint و دارایی‌های ILIA |
| re-ingest بدون دستکاری UI | پاس | dry-run + diff خالی + overrides محافظت‌شده |
| محتوای ساختگی | پاس مشروط | هیچ gap پر نشده؛ ۱۵۵ مورد ترجمه در review می‌ماند |

## نتایج تست

- `next build`: پاس؛ ۸ صفحه static/SSG و routeهای dynamic مدل/API؛
- TypeScript strict: پاس؛
- Zod/TypeScript content validation: پاس؛
- Python content validation: پاس با `errors: []`؛
- unit integrity: ۸/۸ پاس؛
- phase 2 regression: ۶ سناریو، خطای مرورگر ۰؛
- phase 3 regression: ۸ سناریو، خطای مرورگر ۰؛
- phase 4 regression: ۱۰ سناریو، خطای مرورگر ۰؛
- phase 5 acceptance: ۱۲ سناریو، خطای مرورگر ۰؛
- اجرای اندازه‌گیری‌شدهٔ local production: DOMContentLoaded حدود ۶۱ms، load حدود ۷۴ms، ۲۹ resource و حدود ۳۰۱KB انتقال. این اعداد benchmark محلی‌اند و SLA شبکهٔ واقعی نیستند.

## دسترس‌پذیری و ریسپانسیو

- smoke test نام کنترل‌ها، alt تصاویر، تک `h1` و focus با کیبورد پاس شد؛
- modal والد focus trap و بازگشت focus دارد؛ Escape ابتدا پاپ‌آپ فرزند را می‌بندد؛
- `prefers-reduced-motion` مسیر کامل را بدون وابستگی به animation حفظ می‌کند؛
- viewportهای 1440×1000، 1024×768 و 390×844 بدون overflow صفحه تست شدند؛
- نمودارها select کیبوردی و جدول جایگزین دارند.

این smoke test جای audit دستی کامل WCAG یا تست screen-reader واقعی را نمی‌گیرد؛ آن دو برای انتشار عمومی پرریسک پیشنهاد می‌شوند.

## شواهد تصویری

- `artifacts/phase5/desktop-globe-fa.png`
- `artifacts/phase5/desktop-ecosystem-fa.png`
- `artifacts/phase5/desktop-nested-popup-fa.png`
- `artifacts/phase5/tablet-ecosystem-en.png`
- `artifacts/phase5/mobile-ecosystem-fa.png`
- `artifacts/phase5/mobile-nested-popup-fa.png`

## اقدامات بعدی غیرمسدودکننده

1. بازبینی انسانی ۱۵۵ ترجمهٔ انگلیسی و اجرای `content:validate:strict` برای gate انتشار انگلیسی.
2. دریافت مجوز فونت و در صورت تأیید، self-hosting رسمی Yekan Bakh/Acumin/DIN.
3. تعیین تکلیف محتوای Cost Structure و چهار بلوک `partial` توسط مالک محتوا.
4. audit مستقل WCAG با screen reader و Lighthouse روی hosting واقعی.
5. افزودن telemetry فقط پس از تصویب privacy/analytics policy.
