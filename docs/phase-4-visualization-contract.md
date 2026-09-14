# قرارداد فنی فاز ۴ — Visualization و Drill-down

## مسئله و مسیر خواندن

کار تحلیلی اصلی «مقایسه و رتبه‌بندی کانال‌ها» و «قرار دادن آرکی‌تایپ‌های رابطه در یک ماتریس کیفی» است. مسیر خواندن در هر صفحه: عنوان insight، شاهد فوری، کنترل‌های فیلتر و سطح drill، جزئیات انتخاب‌شده، caveat و منبع، سپس table fallback.

هیچ hierarchy عددی مستقل در فایل منبع وجود ندارد. بنابراین drill فقط روی روابط واقعی زیر فعال است:

- کانال → بُعد امتیاز کیفی → شاهد اسلاید ۱۱۵
- ناحیه ماتریس رابطه → آرکی‌تایپ → تخصیص پرسونا → شاهد اسلایدهای ۱۳۶ تا ۱۴۲

## شکل سطح و instance count

- در هر صفحه مدل حداکثر یک visualization workspace فعال است.
- desktop: نمودار و خلاصه انتخاب در یک سطح پهن؛ table fallback در disclosure پایین آن.
- mobile portrait هدف ۳۹۰×۸۴۴: insight و نمودار پیش از کنترل‌های ثانویه؛ table view با یک tap؛ ارتفاع plot مستقل و labelهای کوتاه‌تر.
- mobile landscape برای ماتریس مفید است، ولی چرخاندن دستگاه اجباری نیست؛ table fallback همان claim را در portrait حفظ می‌کند.

## داده و interaction

- نمودار کانال: ۱۱ mark در سطح اول؛ ۶ بُعد کیفی در سطح دوم.
- ماتریس رابطه: ۵ ناحیه و ۷ آرکی‌تایپ؛ تخصیص‌های ۶ پرسونا به‌صورت on-demand.
- داده با ingest از table cell و metadata منبع نرمال می‌شود؛ update زنده یا remote ندارد.
- hover فقط اطلاعات تکمیلی است. tap، focus، جدول و کنترل قبلی/بعدی مسیرهای معادل هستند.
- motion فقط transition کوتاه drill است و در reduced-motion حذف می‌شود.

## state و history

- state معنادار URL: `viz`, `drill`, `priority`, `persona`, `vizView` و `detail`.
- شناسه‌ها stable هستند؛ label یا raw payload وارد URL نمی‌شود.
- filter و drill committed با `pushState`، تغییر view سبک با `replaceState` ثبت می‌شود.
- state نامعتبر حذف و به نمای root برگردانده می‌شود. URL بر هر preference محلی مقدم است؛ در MVP persistence محلی یا remote نیاز نیست.

## معماری رندر

- React/Next.js مالک data transform، URL state، فیلتر، جدول، export CSV و accessibility است.
- ECharts به‌صورت dynamic import و Canvas renderer فقط مالک chart surface، tooltip و hit-testing است.
- resize با `ResizeObserver` و lifecycle با dispose کنترل می‌شود.
- table HTML منبع حقیقت قابل خواندن، fallback بدون Canvas و پایه CSV است.
- PNG فقط از داده مجاز و از `getDataURL` ECharts ساخته می‌شود.

## کارایی و نگهداری

- یک instance، کمتر از ۱۲ mark در سطح root و کمتر از ۸ node در drill؛ virtualize لازم نیست.
- ECharts فقط در صفحه دارای config بارگذاری می‌شود و برای surface ارتفاع رزروشده است تا layout shift رخ ندهد.
- failure renderer نباید داده را پنهان کند؛ پیام خطا و table fallback باقی می‌مانند.
- schema visualization کنار schema محتوا validate می‌شود و UI به idها، نه متن اسلاید، متصل است.

## رنگ و دسترس‌پذیری

- context خنثی: سفید کم‌رنگ و divider؛ focal: طلایی `#FFC000`؛ comparison: tintهای محدود سرمه‌ای/سفید؛ selected: طلایی با outline؛ alert/caveat: متن و icon، نه رنگ تنها.
- مقدار و label ضروری بدون hover دیده می‌شوند.
- عنوان/توضیح برای chart، خلاصه متنی، keyboard controls، focus visible، table fallback و source/slide همیشه موجود است.

## QA

- drill down/up و breadcrumb
- cross-filter نمودار/جدول با priority و persona
- حفظ state در refresh، Back و deep link
- انتخاب mark و بازشدن modal منبع
- sort جدول، CSV و PNG export
- RTL/LTR، mobile portrait/landscape، keyboard و reduced-motion
- نبود console error، overflow و مسیر محلی Windows در client/API
