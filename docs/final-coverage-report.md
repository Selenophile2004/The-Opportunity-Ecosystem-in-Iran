# گزارش نهایی پوشش منبع

- تاریخ کنترل: 2026-09-11
- منبع canonical: `20260906-Simorgh-SA-V07.pptx`
- SHA-256: `35977625510758e4fa3b8fcf348d8904dfb5aa99ebe33f7fda4c3d5bd0f58561`
- دامنه: ۱۴۵ اسلاید فیزیکی، نسخه‌های فارسی و انگلیسی runtime

## نتیجهٔ تصمیم

پوشش ساختاری برای انتشار نسخهٔ فعلی قابل قبول است: هر ۱۴۵ اسلاید دقیقاً یک رکورد inventory دارد و هر شمارهٔ ۱ تا ۱۴۵ دست‌کم از یک node فارسی runtime قابل دسترسی است. مجموعهٔ ۱۸۰ شناسه در فارسی و انگلیسی یکسان است و source reference آن‌ها زوج است.

این نتیجه به معنی کامل‌بودن محتوای منبع یا تأیید ترجمهٔ انگلیسی نیست. شکاف‌های منبع و ترجمه به‌صورت state صریح نگه داشته شده‌اند و هیچ عدد، ادعا یا ترجمهٔ غایب برای پرکردن آن‌ها ساخته نشده است.

## جمع پوشش

| وضعیت inventory | تعداد | تصمیم runtime |
|---|---:|---|
| `imported` | 127 | متن/ساختار استخراجی به node یا evidence متصل است |
| `contextual` | 17 | برای توالی و زمینه حفظ شده و در provenance قابل دسترسی است |
| `visual-only` | 1 | اسلاید ۱۴۵ با همین وضعیت حفظ شده؛ محتوای حدسی تولید نشده |
| `duplicate` | 0 | حذف متنی رخ نداده است |
| `excluded-with-reason` | 0 | اسلایدی از حسابرسی حذف نشده است |
| کل | **145** | **145/145 accounted** |

## کنترل‌های انجام‌شده

- تطابق هش فایل PPTX با manifest و `sourceRevision` هر دو locale؛
- یکتایی شماره‌های ۱ تا ۱۴۵ در manifest؛
- پوشش ۱ تا ۱۴۵ در source referenceهای runtime؛
- برابری ۱۸۰ شناسه، slug و source در فارسی/انگلیسی؛
- معتبر بودن parent، related و persona referenceها؛
- pairing همهٔ فایل‌های JSON runtime بین `content/fa` و `content/en`؛
- نبود مسیر مطلق Windows/workspace در payloadهای JSON؛
- dry-run و diff تکراری با خروجی بدون `added`/`removed`/`changed`.

جزئیات ردیف‌به‌ردیف هر اسلاید در `docs/content-inventory.md` و نگاشت بلوک‌ها در `docs/data-mapping.md` ثبت است.

## کیفیت و محدودیت‌های داده

| مورد | وضعیت نهایی |
|---|---|
| Cost Structure | `not_provided`؛ empty state شفاف، بدون دادهٔ ساخته‌شده |
| Key Partners / Activities / Resources / Revenue | `partial`؛ UI این وضعیت را نمایش می‌دهد |
| ترجمهٔ انگلیسی | ۱۵۵ رکورد در صف review؛ provenance حفظ و هشدار UI نمایش داده می‌شود |
| اسلاید ۱۴۵ | `visual-only`؛ نیازمند تصمیم مالک محتوا دربارهٔ انتشار اطلاعات تماس |
| PDF فارسی | فقط visual cross-check؛ برای semantic text استفاده نمی‌شود |
| ۱۳ SVG داخلی | metadata کامل نیست؛ render PDF مرجع بصری است |
| فونت‌های برند | Yekan Bakh بستهٔ مجوز همراه ندارد؛ self-hosting آن متوقف است |

## معیار بازگشایی ingestion

با دریافت PPTX جدید، ابتدا ممیزی/manifest باید با hash جدید تولید شود. انتشار فقط زمانی مجاز است که validation پایتون و Zod پاس شوند، پوشش ۱۴۵ یا تعداد جدید اسلایدها کامل باشد، diff بررسی شود و موارد ترجمهٔ جدید تعیین تکلیف شوند.
