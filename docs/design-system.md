# سیستم طراحی — مبنای ممیزی‌شده

این سند تصمیم‌های پایه پیش از prototype را ثبت می‌کند. مسیر منتخب «Quiet Signal» است: سطح مات و بسیار تیره، بوم هندسی روشن، طلایی فقط برای focus/selection و Sign کم‌رنگ ILIA در فضای منفی.

## tokenهای رنگ

```css
:root {
  --brand-navy: #09132A;
  --brand-gold: #FFC000;
  --brand-white: #FFFFFF;
  --surface-1: #0D1B3D;
  --surface-2: #111F45;
  --bg-sampled-start: #170427;
  --bg-sampled-center: #0E0A12;
  --bg-sampled-end: #1B1510;
  --text-primary: rgba(255, 255, 255, 0.94);
  --text-secondary: rgba(255, 255, 255, 0.65);
  --divider: rgba(255, 255, 255, 0.12);
  --focus-ring: #FFC000;
}
```

پس‌زمینه پایه همیشه `#09132A` است. gradient نمونه‌برداری‌شده به‌صورت overlay کم‌کنتراست روی آن می‌آید. رنگ‌های Brand Book (`#7800DC`, `#F0BE0F`, `#41AFC8`) برای ارجاع برند ثبت‌اند، اما بنفش در UI محصول استفاده نمی‌شود چون brief صراحتاً آن را منع کرده است.

## تایپوگرافی

- فارسی: Yekan Bakh 3 Pro؛ وزن‌های Regular، SemiBold، Bold/Black. تا تأیید مجوز self-hosting، fallback: `Tahoma, Arial, sans-serif`.
- انگلیسی: Acumin Variable طبق Brand Book؛ چون فایل فونت ارائه نشده، fallback موقت: `Inter, Arial, sans-serif` و وضعیت gap ثبت می‌شود.
- بدنه فارسی راست‌چین؛ بدنه انگلیسی چپ‌چین. full justification و کشیده فارسی ممنوع.
- leading فارسی حداقل ۱۴۰٪ اندازه فونت.
- ستون متن فارسی ترجیحاً ۵ تا ۱۵ واژه در هر خط؛ از orphan/widow جلوگیری شود.
- اعداد فارسی با رقم‌های فارسی و جداکننده هزارگان `U+066C`؛ زمان ۲۴ساعته؛ واحد در header ستون.

## لوگو

- header: لوگوی کامل سفید/تک‌رنگ با ارتفاع حداقل ۳۲px.
- watermark: Sign رسمی سفید، opacity بین ۴–۹٪، بدون crop/stretch/effect.
- clear space: حداقل یک واحد `&` اطراف لوگوی کامل.
- زیر ۳۲px لوگوی کامل استفاده نشود؛ Sign تا حداقل ۱۶px مجاز است.
- جای پیش‌فرض Brand Book بالا-چپ است؛ در محصول، header logo نیز بالا-چپ باقی می‌ماند و RTL فقط جریان محتوا را تغییر می‌دهد.

## Canvas geometry

در دسکتاپ topology استاندارد ۵ ستون بالا + ۲ بلوک پایین حفظ می‌شود. Customer Segments ستون راست، Value Propositions مرکز، Key Partners ستون چپ، و Cost/Revenue ردیف پایین‌اند. کارت‌های هم‌اندازه یا grid ۳×۳ جایگزین مجاز نیست.

## stateها

| state | border | opacity | motion |
|---|---|---:|---|
| default | divider ۱۲٪ | ۱۰۰٪ | ambient بسیار ظریف |
| hover | طلایی ۴۰–۶۰٪ | ۱۰۰٪ | translate/scale حداکثر ۱–۲٪ |
| focus-visible | ring طلایی ۲px + offset | ۱۰۰٪ | بدون وابستگی به hover |
| selected/match | طلایی کامل + glow محدود | ۱۰۰٪ | ۲۰۰–۲۵۰ms |
| non-match | border خنثی | ۳۰–۴۰٪ | همچنان clickable |
| unavailable | dashed divider + badge وضعیت | ۶۰–۷۰٪ | بدون pulse |

## motion

- transition بلوک به صفحه: ۴۵۰–۷۰۰ms؛ scale نقطه آغاز تا حدود ۱٫۱۵.
- modal/drill: ۲۰۰–۲۵۰ms؛ connector با SVG و مختصات زنده.
- stagger: ۵۰–۸۰ms.
- type-on فقط متن کوتاه، ۱۵–۲۵ms/char و قابل skip.
- `prefers-reduced-motion`: همه حرکت‌ها به fade کوتاه تبدیل شوند.

## نمودار و جدول

- chart palette از navy/gold/white و tintهای کنترل‌شده ساخته می‌شود؛ extended palette Brand Book فقط وقتی چند سری واقعاً نیاز است.
- فارسی: Yekan Bakh برای label و عدد؛ انگلیسی: Acumin، و برای رقم ثابت DIN طبق Brand Book در صورت فراهم‌شدن font/license.
- legend تعاملی، tooltip دوزبانه، source/slide number، table fallback و export فقط برای داده مجاز.
- واحد همیشه در header؛ precision مالی دو رقم و علمی حداکثر چهار رقم.

## دسترس‌پذیری

- WCAG 2.2 AA، target حداقل ۴۴px، focus واضح، focus trap در dialog، بازگرداندن focus به origin.
- ترتیب DOM مستقل از موقعیت visual و در هر دو RTL/LTR منطقی باشد.
- جهت‌ها با logical properties پیاده شوند؛ left/right hardcoded فقط برای هندسه ثابت Canvas و با abstraction مجاز است.
