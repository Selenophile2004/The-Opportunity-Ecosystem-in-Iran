# فرضیات، شکاف‌ها و موارد نیازمند تأیید

## شکاف‌های محتوایی

| شدت | مورد | شاهد | اثر | اقدام پیشنهادی |
|---|---|---|---|---|
| بالا | ساختار هزینه ارائه نشده | فقط prompt عمومی بوم در اسلایدهای ۷/۲۱/۴۷/۱۰۲ | بلوک بدون صفحه داده واقعی | `not_provided` و empty state شفاف |
| بالا | چهار بلوک Key Partners/Activities/Resources/Revenue کامل نیستند | داده پراکنده در ۱۰–۱۹، ۹۸–۹۹ و ۱۲۲ | امکان برداشت بیش از حد از context | `partial` و جلوگیری از ادعای completeness |
| بالا | ترجمه رسمی انگلیسی همه محتوا موجود نیست | فقط بخش‌هایی از اسلایدها دو‌زبانه‌اند | `content.en.json` نیازمند ترجمه و review | glossary و review انسانی در فاز ۱ |
| متوسط | اسلایدهای ۳۷، ۳۹ و ۴۱ برچسب (۱/۲) را تکرار می‌کنند | متن source shape | deep link و عنوان ممکن است مبهم شود | source label حفظ و خطا در metadata ثبت شود؛ اصلاح فقط با تأیید مالک محتوا |
| متوسط | فهرست‌های اسلایدهای ۲۰، ۴۹ و ۶۳ در بخش‌هایی یک شماره جلوتر از موقعیت فیزیکی‌اند | مقایسه TOC با slide order | provenance مبهم | شماره فیزیکی canonical؛ شماره نمایشی منبع به‌عنوان metadata جدا |
| متوسط | slide 145 متن slide-shape ندارد | متن در render/master دیده می‌شود | extractor ساده آن را empty می‌بیند | fallback PDF/master parser و وضعیت `visual-only` |
| متوسط | PDF text layer برای فارسی ترتیب حروف معکوس دارد | استخراج pdfplumber | diff متنی PDF↔PPTX قابل اتکا نیست | PDF برای visual diff؛ PPTX برای semantic text |
| متوسط | ۱۳ SVG داخلی با `python-pptx` decode نمی‌شوند | اسلایدهای ۹ و ۴۴ | image metadata ناقص | parse relationship/OOXML و renderer PDF |
| پایین | هیچ chart بومی وجود ندارد | package audit | hierarchy از chart metadata قابل استخراج نیست | schema از table/shape و روابط محتوا ساخته شود |

## شکاف‌های برند و دارایی

| شدت | مورد | نتیجه |
|---|---|---|
| بالا | بسته Yekan Bakh فاقد LICENSE/EULA همراه است | self-hosting تا تأیید مجوز متوقف بماند |
| متوسط | فایل Acumin Variable و DIN ارائه نشده | fallback موقت و درخواست asset/license در فاز اجرا |
| پایین | نام SVGهای `Black/White/Gray` با fillهای داخلی به‌سادگی قابل استنباط نیست | انتخاب نهایی با render روی light/dark و تطبیق Brand Book انجام شود |
| پایین | چهار PNG workspace حاشیه شفاف بسیار بزرگ دارند | برای UI بهتر است SVG رسمی با viewBox صحیح استفاده شود |

## فرضیات ثبت‌شده

1. PPTX منبع معنایی canonical و PDF هم‌نام فقط مرجع رندر است.
2. شماره اسلاید canonical همان ترتیب فیزیکی ۱ تا ۱۴۵ است.
3. اسلایدهای ۶۶–۸۹ با ترتیب ۶ پرسونا × ۴ محرک مدل می‌شوند؛ ترتیب driver از جابه‌جایی highlight و توالی اسلایدها استنباط شده و در review queue می‌ماند.
4. نام فنی پرسوناها فعلاً `persona-01..06` است تا ترجمه یا slug حدسی وارد سیستم نشود.
5. هیچ داده‌ای برای Cost Structure تولید نمی‌شود.
6. palette محصول از brief پیروی می‌کند؛ Brand Book برای قواعد هویت، logo، type و data viz مرجع است.

## review queue فاز ۱

1. تأیید مجوز Yekan Bakh و تهیه Acumin/DIN یا تصویب fallback.
2. تأیید اصلاح برچسب اسلایدهای ۳۷/۳۹/۴۱.
3. تأیید نام انگلیسی رسمی شش پرسونا و چهار محرک ارزش.
4. تعیین اینکه داده‌های پراکنده revenue/partners/resources باید به بلوک‌های partial نمایش داده شوند یا فقط cross-link باشند.
5. تأیید نمایش یا عدم نمایش اطلاعات تماس slide 145 در محصول عمومی.
