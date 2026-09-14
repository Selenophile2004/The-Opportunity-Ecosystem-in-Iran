# گزارش فاز ۴ — نمودار و Drill-down

تاریخ تحویل: ۱۴۰۵/۰۶/۱۹ (2026-09-10)

## نتیجه

دو visualization تعاملی بر پایه hierarchy و دادهٔ واقعی منبع به صفحات مدل اضافه شد:

- کانال‌ها: dot plot ترتیبی ۱۱ کانال بر اساس اولویت ثبت‌شده در اسلاید ۱۱۵؛ drill به پنج بُعد کیفی هر کانال.
- روابط مشتری: ماتریس کیفی پنج‌ناحیه‌ای اسلاید ۱۳۶؛ drill از ناحیه به هفت آرکی‌تایپ و تخصیص‌های شش پرسونا در اسلایدهای ۱۳۷ تا ۱۴۲.

عدد اولویت به‌عنوان اندازهٔ اثر تفسیر نشده و ماتریس نیز صریحاً «کیفی و فاقد مقیاس کمی» برچسب خورده است.

## معماری و داده

- ECharts 6.1 با dynamic import و Canvas renderer
- یک chart instance در هر صفحه و lifecycle مبتنی بر ResizeObserver/dispose
- مالکیت state، transform، accessibility و export در React
- URL state پایدار برای `viz`، `drill`، `priority`، `persona` و `vizView`
- ۵۰ جدول PowerPoint با cellهای واقعی به visualization metadata ingestion اضافه شدند.
- schema تخصصی برای ۱۱ ردیف کانال، پنج dimension، پنج ناحیه ماتریس، هفت relationship و referenceهای allocation
- validation در Python ingestion و Zod build-time

## قابلیت‌ها

- drill-down و drill-up با breadcrumb و Back browser
- cross-filter مشترک persona و priority میان نمودار و جدول
- انتخاب mark با mouse/touch و مسیر معادل keyboard از select و table row
- tooltip محلی‌شده و labelهای ضروری بدون hover
- جدول HTML با header ثابت، sort و اسکرول محلی
- export دادهٔ فیلترشده به CSV و نمودار به PNG
- اتصال سطح drill به modal منبع و حفظ `detail` در URL
- labelهای compact روی موبایل و خاموش‌شدن animation در reduced-motion
- نمایش شفاف working translation در نسخه انگلیسی

## QA

Build تولیدی، TypeScript و content validation موفق بودند. QA مرورگری production با Chrome در ۱۰ سناریو عبور کرد:

1. رندر ECharts برای ۱۱ کانال منبع‌دار
2. drill کیبوردی و نگهداری state در URL
3. بازشدن modal منبع از context نمودار
4. cross-filter اولویت/پرسونا و sort جدول
5. export CSV
6. export PNG
7. drill ماتریس رابطه تا allocation پرسونا
8. کنترل‌ها و وضعیت ترجمه در انگلیسی LTR
9. containment و table fallback در موبایل
10. حفظ رفتار در reduced-motion

هیچ `console.error` یا `pageerror` در اجرای نهایی ثبت نشد. تصاویر در `artifacts/phase4/` و نتیجهٔ ماشینی در `artifacts/phase4/qa-results.json` قرار دارند.

## مرز و backlog

- ماتریس فرصت اسلاید ۶۰ هنوز دادهٔ کمی مستقیم ندارد و در این فاز به scatter عددی تبدیل نشد.
- visualizationهای diagram/relationship-map دیگر تا زمان نرمال‌سازی node/edge به تصویر ساختگی تبدیل نمی‌شوند.
- متن بدنهٔ ۱۵۵ گره انگلیسی همچنان نیازمند بازبینی انسانی است؛ ترجمهٔ labelهای نمودار با وضعیت working terminology نمایش داده می‌شود.
