# فهرست محتوای منبع

این فهرست خروجی ممیزی فاز صفر است. شماره‌ها شماره فیزیکی اسلاید در فایل منبع هستند و به شماره‌های درج‌شده داخل فهرست‌های خود پاورپوینت وابسته نیستند.

## خلاصه پوشش

- کل اسلایدها: **145**
- واردشده به استخراج خام: **127**
- اسلایدهای زمینه‌ای/راهنما: **17**
- اسلایدهای صرفاً بصری: **1**
- duplicate متنی دقیق: **0**؛ اسلایدهای دارای state بصری مشابه به‌جای حذف، به یک node مشترک نگاشت شده‌اند.
- excluded-with-reason: **0**
- متن استخراج‌شده از slide shapes: **186,367 کاراکتر**
- shape: **3,964**؛ text shape: **2,337**؛ جدول بومی: **54**؛ اتصال/خط: **362**
- نمودار بومی PowerPoint: **0**؛ embedding: **0**؛ media part: **28**

## راهنمای وضعیت

- `imported`: متن و ساختار shapeها در `artifacts/phase0/presentation.json` ثبت شده است.
- `contextual`: برای درک توالی، section، benchmark یا state بصری لازم است ولی معمولاً node محتوایی مستقل در runtime نمی‌شود.
- `visual-only`: متن در سطح slide shape موجود نیست و باید از PDF/تصویر و master بررسی شود.

## فهرست اسلایدبه‌اسلاید

| اسلاید | عنوان ممیزی‌شده | بخش | نوع استخراجی | کاراکتر | عناصر ساختاری | وضعیت | node پیشنهادی |
|---:|---|---|---|---:|---|---|---|
| 1 | طراحی مدل ارزش، عملیاتی و مالی کسب وکار | زمینه و تز فرصت | `structured-text-or-diagram` | 126 | — | `contextual` | `project.cover` |
| 2 | سودآوری ماشین سرمایه جهان، با اجرای استراتژی Always on War | زمینه و تز فرصت | `mixed` | 973 | 8 تصویر، 8 اتصال | `imported` | `context.capital-machine` |
| 3 | منبع سودآورتر برای ماشین سرمایه؛ مالکیت شبکه دیجیتال و هوش مصنوعی | زمینه و تز فرصت | `table-or-matrix` | 1253 | 1 جدول | `imported` | `context.digital-network-ownership` |
| 4 | ایران، حلقه مفقوده در زمین بازی جدید (مطلوبِ ماشین سرمایه) | زمینه و تز فرصت | `process-or-relationship` | 1492 | 1 تصویر | `imported` | `context.iran-opportunity-thesis` |
| 5 | مسیر اجرایی پروژه | مسیر پروژه، منطق شکل‌گیری و بنچمارک | `section-or-context` | 64 | 1 اتصال | `contextual` | `project.delivery-roadmap` |
| 6 | منطق شکل گیری کسب وکار | مسیر پروژه، منطق شکل‌گیری و بنچمارک | `process-or-relationship` | 858 | 9 اتصال | `imported` | `business-model.formation-logic` |
| 7 | مدل کسب وکار | مسیر پروژه، منطق شکل‌گیری و بنچمارک | `structured-text-or-diagram` | 1673 | 9 اتصال | `imported` | `business-model.canvas-overview` |
| 8 | بررسی پروژه های مشابه سیمرغ | مسیر پروژه، منطق شکل‌گیری و بنچمارک | `structured-text-or-diagram` | 108 | 1 اتصال | `contextual` | `benchmarks.index` |
| 9 | Enterprise Europe Network | مسیر پروژه، منطق شکل‌گیری و بنچمارک | `mixed` | 994 | 5 تصویر، 6 اتصال | `imported` | `benchmarks.enterprise-europe-network` |
| 10 | مدل درآمدی/۱ | مسیر پروژه، منطق شکل‌گیری و بنچمارک | `structured-text-or-diagram` | 1230 | 1 اتصال | `imported` | `revenue-models.part-01` |
| 11 | مدل درآمدی/۲ | مسیر پروژه، منطق شکل‌گیری و بنچمارک | `structured-text-or-diagram` | 1388 | 1 اتصال | `imported` | `revenue-models.part-02` |
| 12 | ارزش پیشنهادی/۱ | مسیر پروژه، منطق شکل‌گیری و بنچمارک | `process-or-relationship` | 1923 | — | `imported` | `benchmark-value-propositions.part-01` |
| 13 | ارزش پیشنهادی/۲ | مسیر پروژه، منطق شکل‌گیری و بنچمارک | `process-or-relationship` | 1838 | — | `imported` | `benchmark-value-propositions.part-02` |
| 14 | مدل کسب وکار سیمرغ | مدل مفهومی و فرضیات کلیدی | `section-or-context` | 79 | 1 اتصال | `contextual` | `business-model.section-index` |
| 15 | مدل مفهومی کسب‌وکار — نمای پایه | مدل مفهومی و فرضیات کلیدی | `structured-text-or-diagram` | 582 | 10 اتصال | `imported` | `business-model.conceptual-model` |
| 16 | مدل مفهومی کسب‌وکار — ستاد و فرهنگ مشترک | مدل مفهومی و فرضیات کلیدی | `structured-text-or-diagram` | 893 | 10 اتصال | `imported` | `business-model.conceptual-model` |
| 17 | فرضیات کلیدی کسب وکار (۳/۱) | مدل مفهومی و فرضیات کلیدی | `table-or-matrix` | 1779 | 1 جدول | `imported` | `business-model.assumptions.part-01` |
| 18 | فرضیات کلیدی کسب وکار (۳/۲) | مدل مفهومی و فرضیات کلیدی | `table-or-matrix` | 1784 | 1 جدول | `imported` | `business-model.assumptions.part-02` |
| 19 | فرضیات کلیدی کسب وکار (۳/۳) | مدل مفهومی و فرضیات کلیدی | `table-or-matrix` | 1579 | 1 جدول | `imported` | `business-model.assumptions.part-03` |
| 20 | بخش بندی مشتریان سیمرغ | بخش‌های مشتری و پرسوناها | `structured-text-or-diagram` | 230 | 1 اتصال | `contextual` | `customer-segments.section-index` |
| 21 | نمای بوم با تمرکز بر بخش‌های مشتری | بخش‌های مشتری و پرسوناها | `structured-text-or-diagram` | 1816 | 9 اتصال | `contextual` | `business-model.canvas-overview.customer-segments-focus` |
| 22 | سوال استراتژیک بخش بندی مشتریان | بخش‌های مشتری و پرسوناها | `structured-text-or-diagram` | 463 | — | `imported` | `customer-segments.strategic-question` |
| 23 | نقشه اولیه بازیگران در اکوسیستم سیمرغ | بخش‌های مشتری و پرسوناها | `structured-text-or-diagram` | 1698 | — | `imported` | `customer-segments.actor-map` |
| 24 | متدولوژی | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1525 | — | `imported` | `customer-segments.methodology` |
| 25 | ابعاد بخش‌بندی — نیاز | بخش‌های مشتری و پرسوناها | `table-or-matrix` | 1697 | 2 جدول | `imported` | `customer-segments.dimension.need` |
| 26 | ابعاد بخش‌بندی — رفتار | بخش‌های مشتری و پرسوناها | `table-or-matrix` | 1895 | 1 جدول | `imported` | `customer-segments.dimension.behavior` |
| 27 | ابعاد بخش‌بندی — مشخصات شرکت | بخش‌های مشتری و پرسوناها | `table-or-matrix` | 1965 | 1 جدول | `imported` | `customer-segments.dimension.company-profile` |
| 28 | بخش‌های مشتری شناسایی‌شده | بخش‌های مشتری و پرسوناها | `structured-text-or-diagram` | 793 | 8 اتصال | `imported` | `customer-segments.identified-segments` |
| 29 | پرسوناهای کلیدی مشتریان | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1640 | 33 اتصال | `imported` | `personas.overview` |
| 30 | پروفایل پرسونا ۱ — کسب‌وکار تراز ایرانی (۱/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1852 | — | `imported` | `personas.persona-01.profile.part-01` |
| 31 | پروفایل پرسونا ۱ — کسب‌وکار تراز ایرانی (۲/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1696 | — | `imported` | `personas.persona-01.profile.part-02` |
| 32 | پروفایل پرسونا ۲ — کسب‌وکار تراز خارجی (۱/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1764 | — | `imported` | `personas.persona-02.profile.part-01` |
| 33 | پروفایل پرسونا ۲ — کسب‌وکار تراز خارجی (۲/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1784 | — | `imported` | `personas.persona-02.profile.part-02` |
| 34 | پروفایل پرسونا ۳ — کسب‌وکار مشتاق (۱/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1849 | — | `imported` | `personas.persona-03.profile.part-01` |
| 35 | پروفایل پرسونا ۳ — کسب‌وکار مشتاق (۲/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1875 | — | `imported` | `personas.persona-03.profile.part-02` |
| 36 | پروفایل پرسونا ۴ — کسب‌وکار کنجکاو (۱/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 2043 | — | `imported` | `personas.persona-04.profile.part-01` |
| 37 | ادامه پروفایل پرسونا ۴ — برچسب منبع تکراری (۱/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 2098 | — | `imported` | `personas.persona-04.profile.part-02` |
| 38 | پروفایل پرسونا ۵ — خالق کسب‌وکار (۱/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 2152 | — | `imported` | `personas.persona-05.profile.part-01` |
| 39 | ادامه پروفایل پرسونا ۵ — برچسب منبع تکراری (۱/۲) | بخش‌های مشتری و پرسوناها | `structured-text-or-diagram` | 1899 | — | `imported` | `personas.persona-05.profile.part-02` |
| 40 | پروفایل پرسونا ۶ — سرمایه‌گذار (۱/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 2223 | — | `imported` | `personas.persona-06.profile.part-01` |
| 41 | ادامه پروفایل پرسونا ۶ — برچسب منبع تکراری (۱/۲) | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1997 | — | `imported` | `personas.persona-06.profile.part-02` |
| 42 | توضیحات تکمیلی در بخش بندی مشتریان | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 1567 | — | `imported` | `customer-segments.caveats` |
| 43 | اقدامات تکمیلی قابل انجام در بخش بندی مشتریان | بخش‌های مشتری و پرسوناها | `structured-text-or-diagram` | 1901 | — | `imported` | `customer-segments.additional-analysis` |
| 44 | روش پروفایل مشتری و نقشه ارزش پیشنهادی | بخش‌های مشتری و پرسوناها | `mixed` | 1208 | 8 تصویر، 9 اتصال | `imported` | `value-propositions.customer-profile-method` |
| 45 | ریسک هایی که در طراحی مدل کسب وکار ممکن است متوجه ما شود | بخش‌های مشتری و پرسوناها | `process-or-relationship` | 447 | 4 اتصال | `imported` | `business-model.design-risks` |
| 46 | ارزش های پیشنهادی سیمرغ | ارزش پیشنهادی، نقشه ارزش و MVE | `section-or-context` | 56 | 1 اتصال | `contextual` | `value-propositions.section-index` |
| 47 | نمای بوم با تمرکز بر ارزش‌های پیشنهادی | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 1925 | 9 اتصال | `contextual` | `business-model.canvas-overview.value-propositions-focus` |
| 48 | خلاصه مدیریتی | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 1309 | 4 اتصال | `imported` | `value-propositions.executive-summary` |
| 49 | فهرست نقشه کارها، دردسرها و منافع | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 174 | 1 اتصال | `contextual` | `value-propositions.jobs-map-index` |
| 50 | نمای کلی چشم انداز کارها پرسونا ← تعداد کار مستخرج ← دسته های غالب کار | ارزش پیشنهادی، نقشه ارزش و MVE | `process-or-relationship` | 654 | 6 اتصال | `imported` | `customer-jobs.overview` |
| 51 | نقشه پرسوناها/۱ برای هر پرسونا: تعریف کوتاه، سپس کارهای مشتری با دردسر و منفعت مربوطه | ارزش پیشنهادی، نقشه ارزش و MVE | `process-or-relationship` | 2773 | 6 اتصال | `imported` | `personas.persona-01.jobs-pains-gains` |
| 52 | نقشه پرسوناها/۲ برای هر پرسونا: تعریف کوتاه، سپس کارهای مشتری با دردسر و منفعت مربوطه | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 2530 | 6 اتصال | `imported` | `personas.persona-02.jobs-pains-gains` |
| 53 | نقشه پرسوناها/۳ برای هر پرسونا: تعریف کوتاه، سپس کارهای مشتری با دردسر و منفعت مربوطه | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 2191 | 6 اتصال | `imported` | `personas.persona-03.jobs-pains-gains` |
| 54 | نقشه پرسوناها/۴ برای هر پرسونا: تعریف کوتاه، سپس کارهای مشتری با دردسر و منفعت مربوطه | ارزش پیشنهادی، نقشه ارزش و MVE | `process-or-relationship` | 1742 | 6 اتصال | `imported` | `personas.persona-04.jobs-pains-gains` |
| 55 | نقشه پرسوناها/۵ برای هر پرسونا: تعریف کوتاه، سپس کارهای مشتری با دردسر و منفعت مربوطه | ارزش پیشنهادی، نقشه ارزش و MVE | `process-or-relationship` | 2190 | 6 اتصال | `imported` | `personas.persona-05.jobs-pains-gains` |
| 56 | نقشه پرسوناها/۶ برای هر پرسونا: تعریف کوتاه، سپس کارهای مشتری با دردسر و منفعت مربوطه | ارزش پیشنهادی، نقشه ارزش و MVE | `process-or-relationship` | 2135 | 6 اتصال | `imported` | `personas.persona-06.jobs-pains-gains` |
| 57 | کارهای مشترک میان پرسوناها پنج الگوی تکرارشونده که در بیش از یک پرسونا به طور مستقل ظاهر شده اند | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1252 | 1 جدول | `imported` | `customer-jobs.shared-patterns` |
| 58 | تحلیل دردسرها مهم ترین Pain Pointها بر اساس شدت و میزان تکرار در سراسر نقشه کارها | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 719 | — | `imported` | `customer-pains.analysis` |
| 59 | تحلیل منافع مهم ترین نتایج و ارزش های مورد انتظار مشتریان در صورت حل موفقیت آمیز کارها | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 494 | — | `imported` | `customer-gains.analysis` |
| 60 | ماتریس فرصت محور افقی: اهمیت کار برای مشتری · محور عمودی: شدت دردسر / میزان نیاز برآورده نشده — موقعیت یابی کیفی بر اساس تحلیل بخش های پیشین | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 968 | 1 جدول، 2 اتصال | `imported` | `opportunities.matrix` |
| 61 | جمع بندی استراتژیک تحلیل مدیریتی — نه توصیفی | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 1831 | — | `imported` | `value-propositions.strategic-synthesis` |
| 62 | منابع و شواهد فهرست منابع مورد استفاده در تجمیع این نقشه، از مخزن اولیه پروژه و پژوهش بازار تازه | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 2730 | 2 جدول، 2 اتصال | `imported` | `value-propositions.sources` |
| 63 | فهرست محرک‌ها و نقشه‌های ارزش | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 96 | 1 اتصال | `contextual` | `value-propositions.value-map-index` |
| 64 | چرخه تقویت شونده خلق ارزش | ارزش پیشنهادی، نقشه ارزش و MVE | `process-or-relationship` | 742 | 7 اتصال | `imported` | `value-creation.reinforcing-loop` |
| 65 | محرک های اصلی خلق ارزش | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 1265 | 5 اتصال | `imported` | `value-creation.drivers` |
| 66 | نقشه ارزش پرسونا ۱ — هوشمندی و اعتبارسنجی فرصت | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1511 | 1 جدول | `imported` | `personas.persona-01.value-map.driver-01` |
| 67 | نقشه ارزش پرسونا ۱ — ایجاد دسترسی مورداعتماد | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1409 | 1 جدول | `imported` | `personas.persona-01.value-map.driver-02` |
| 68 | نقشه ارزش پرسونا ۱ — تأمین و فعال‌سازی منابع و قابلیت‌ها | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1447 | 1 جدول | `imported` | `personas.persona-01.value-map.driver-03` |
| 69 | نقشه ارزش پرسونا ۱ — هماهنگ‌سازی و تبدیل فرصت به نتیجه | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1315 | 1 جدول | `imported` | `personas.persona-01.value-map.driver-04` |
| 70 | نقشه ارزش پرسونا ۲ — هوشمندی و اعتبارسنجی فرصت | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1338 | 1 جدول | `imported` | `personas.persona-02.value-map.driver-01` |
| 71 | نقشه ارزش پرسونا ۲ — ایجاد دسترسی مورداعتماد | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1013 | 1 جدول | `imported` | `personas.persona-02.value-map.driver-02` |
| 72 | نقشه ارزش پرسونا ۲ — تأمین و فعال‌سازی منابع و قابلیت‌ها | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1114 | 1 جدول | `imported` | `personas.persona-02.value-map.driver-03` |
| 73 | نقشه ارزش پرسونا ۲ — هماهنگ‌سازی و تبدیل فرصت به نتیجه | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1072 | 1 جدول | `imported` | `personas.persona-02.value-map.driver-04` |
| 74 | نقشه ارزش پرسونا ۳ — هوشمندی و اعتبارسنجی فرصت | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1179 | 1 جدول | `imported` | `personas.persona-03.value-map.driver-01` |
| 75 | نقشه ارزش پرسونا ۳ — ایجاد دسترسی مورداعتماد | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1096 | 1 جدول | `imported` | `personas.persona-03.value-map.driver-02` |
| 76 | نقشه ارزش پرسونا ۳ — تأمین و فعال‌سازی منابع و قابلیت‌ها | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1230 | 1 جدول | `imported` | `personas.persona-03.value-map.driver-03` |
| 77 | نقشه ارزش پرسونا ۳ — هماهنگ‌سازی و تبدیل فرصت به نتیجه | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1118 | 1 جدول | `imported` | `personas.persona-03.value-map.driver-04` |
| 78 | نقشه ارزش پرسونا ۴ — هوشمندی و اعتبارسنجی فرصت | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1123 | 1 جدول | `imported` | `personas.persona-04.value-map.driver-01` |
| 79 | نقشه ارزش پرسونا ۴ — ایجاد دسترسی مورداعتماد | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 960 | 1 جدول | `imported` | `personas.persona-04.value-map.driver-02` |
| 80 | نقشه ارزش پرسونا ۴ — تأمین و فعال‌سازی منابع و قابلیت‌ها | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 925 | 1 جدول | `imported` | `personas.persona-04.value-map.driver-03` |
| 81 | نقشه ارزش پرسونا ۴ — هماهنگ‌سازی و تبدیل فرصت به نتیجه | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 937 | 1 جدول | `imported` | `personas.persona-04.value-map.driver-04` |
| 82 | نقشه ارزش پرسونا ۵ — هوشمندی و اعتبارسنجی فرصت | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1017 | 1 جدول | `imported` | `personas.persona-05.value-map.driver-01` |
| 83 | نقشه ارزش پرسونا ۵ — ایجاد دسترسی مورداعتماد | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 951 | 1 جدول | `imported` | `personas.persona-05.value-map.driver-02` |
| 84 | نقشه ارزش پرسونا ۵ — تأمین و فعال‌سازی منابع و قابلیت‌ها | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1101 | 1 جدول | `imported` | `personas.persona-05.value-map.driver-03` |
| 85 | نقشه ارزش پرسونا ۵ — هماهنگ‌سازی و تبدیل فرصت به نتیجه | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1063 | 1 جدول | `imported` | `personas.persona-05.value-map.driver-04` |
| 86 | نقشه ارزش پرسونا ۶ — هوشمندی و اعتبارسنجی فرصت | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1122 | 1 جدول | `imported` | `personas.persona-06.value-map.driver-01` |
| 87 | نقشه ارزش پرسونا ۶ — ایجاد دسترسی مورداعتماد | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1023 | 1 جدول | `imported` | `personas.persona-06.value-map.driver-02` |
| 88 | نقشه ارزش پرسونا ۶ — تأمین و فعال‌سازی منابع و قابلیت‌ها | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1117 | 1 جدول | `imported` | `personas.persona-06.value-map.driver-03` |
| 89 | نقشه ارزش پرسونا ۶ — هماهنگ‌سازی و تبدیل فرصت به نتیجه | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1093 | 1 جدول | `imported` | `personas.persona-06.value-map.driver-04` |
| 90 | ارزش پیشنهادی به تفکیک پرسونا | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 2391 | 1 جدول | `imported` | `value-propositions.by-persona` |
| 91 | ارزش پیشنهادی | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 588 | — | `imported` | `value-propositions.core-statement` |
| 92 | اقدام آتی | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 155 | 1 اتصال | `imported` | `value-propositions.next-action` |
| 93 | کمینه اکوسیستم پذیرفتنی (MVE) | ارزش پیشنهادی، نقشه ارزش و MVE | `section-or-context` | 29 | 1 تصویر | `contextual` | `mve.section-index` |
| 94 | Meaningful Being: موجودیتی مستقل و ارزش آفرین که خود به تنهایی دارای هویت، اعتبار، قابلیت و جایگاه معنادار در اکوسیستم است | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 945 | 6 اتصال | `imported` | `mve.meaningful-being` |
| 95 | نقشه بلوغ و ورود یک بازیگر خارجی | ارزش پیشنهادی، نقشه ارزش و MVE | `structured-text-or-diagram` | 1633 | 3 اتصال | `imported` | `mve.foreign-actor-maturity-map` |
| 96 | تمرکز مبتنی بر Being در زنجیره ارزش | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1265 | 1 جدول | `imported` | `mve.being-led-value-chain` |
| 97 | Being در برابرDoing — تعریف عملیاتی | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 1221 | 1 جدول، 1 اتصال | `imported` | `mve.being-vs-doing` |
| 98 | سه سازوکار پول سازی از Being | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 2480 | 1 جدول، 1 اتصال | `imported` | `mve.being-monetization` |
| 99 | دوازده بُعد دارایی بنیان‌گذار در پنج خوشه | ارزش پیشنهادی، نقشه ارزش و MVE | `table-or-matrix` | 2424 | 1 جدول | `imported` | `mve.founder-asset-dimensions` |
| 100 | کانال های مشتری | کانال‌های مشتری | `structured-text-or-diagram` | 225 | 1 اتصال | `contextual` | `channels.section-index` |
| 101 | جمع بندی اقدامات قبلی | کانال‌های مشتری | `structured-text-or-diagram` | 1306 | — | `imported` | `channels.previous-work-summary` |
| 102 | نمای بوم با تمرکز بر کانال‌ها | کانال‌های مشتری | `structured-text-or-diagram` | 1858 | 8 اتصال | `contextual` | `business-model.canvas-overview.channels-focus` |
| 103 | نقل‌قول مرجع درباره مالکیت رابطه با مشتری | کانال‌های مشتری | `mixed` | 433 | 2 تصویر، 1 اتصال | `contextual` | `channels.reference-quote` |
| 104 | تعریف کانال مشتری و اهمیت آن | کانال‌های مشتری | `comparison` | 920 | 4 اتصال | `imported` | `channels.definition` |
| 105 | طبقه‌بندی کانال و مدل پنج‌فازی | کانال‌های مشتری | `table-or-matrix` | 868 | 1 جدول، 1 اتصال | `imported` | `channels.classification-and-phases` |
| 106 | گام‌های فرایند تحلیل کانال | کانال‌های مشتری | `process-or-relationship` | 1666 | 6 اتصال | `imported` | `channels.analysis-workflow` |
| 107 | تحلیل عمیق کانال — پرسونا 1 | کانال‌های مشتری | `table-or-matrix` | 1798 | 1 جدول، 1 اتصال | `imported` | `personas.persona-01.channels` |
| 108 | تحلیل عمیق کانال — پرسونا 2 | کانال‌های مشتری | `table-or-matrix` | 1883 | 1 جدول، 1 اتصال | `imported` | `personas.persona-02.channels` |
| 109 | تحلیل عمیق کانال — پرسونا 3 | کانال‌های مشتری | `table-or-matrix` | 1787 | 1 جدول، 1 اتصال | `imported` | `personas.persona-03.channels` |
| 110 | تحلیل عمیق کانال — پرسونا 4 | کانال‌های مشتری | `table-or-matrix` | 1757 | 1 جدول، 1 اتصال | `imported` | `personas.persona-04.channels` |
| 111 | تحلیل عمیق کانال — پرسونا 5 | کانال‌های مشتری | `table-or-matrix` | 1383 | 1 جدول، 1 اتصال | `imported` | `personas.persona-05.channels` |
| 112 | تحلیل عمیق کانال — پرسونا 6 | کانال‌های مشتری | `table-or-matrix` | 1598 | 1 جدول، 1 اتصال | `imported` | `personas.persona-06.channels` |
| 113 | کانال‌های معرف / Enabler غیرمشتری | کانال‌های مشتری | `table-or-matrix` | 1836 | 1 جدول، 1 اتصال | `imported` | `channels.enablers` |
| 114 | طبقه‌بندی کانال از منظر مالکیت و نحوه دسترسی | کانال‌های مشتری | `table-or-matrix` | 1455 | 1 جدول، 1 اتصال | `imported` | `channels.ownership-access-taxonomy` |
| 115 | اولویت‌بندی و امتیازدهی کانال‌ها | کانال‌های مشتری | `table-or-matrix` | 1062 | 1 جدول، 1 اتصال | `imported` | `channels.scoring-prioritization` |
| 116 | مفروضات، عدم‌قطعیت‌ها و ریسک‌های کانال | کانال‌های مشتری | `structured-text-or-diagram` | 1707 | — | `imported` | `channels.assumptions-and-risks` |
| 117 | سه کانال با بیشترین تأثیر بر کل اکوسیستم | کانال‌های مشتری | `structured-text-or-diagram` | 1645 | 2 اتصال | `imported` | `channels.ecosystem-top-three` |
| 118 | اقدامات کانال در شروع فاز عملیاتی | کانال‌های مشتری | `structured-text-or-diagram` | 1405 | — | `imported` | `channels.operational-actions` |
| 119 | منابع و بنچمارک‌های کانال | کانال‌های مشتری | `structured-text-or-diagram` | 1106 | — | `imported` | `channels.sources` |
| 120 | پیوست | کانال‌های مشتری | `section-or-context` | 64 | 1 اتصال | `contextual` | `channels.appendix-index` |
| 121 | الگوهای اکوسیستمی در ادبیات مدیریتی | کانال‌های مشتری | `process-or-relationship` | 2765 | 27 اتصال | `imported` | `ecosystem-patterns.management-literature` |
| 122 | نقش‌های اکوسیستمی در کسب‌وکار | کانال‌های مشتری | `structured-text-or-diagram` | 835 | 20 اتصال | `imported` | `ecosystem-patterns.roles` |
| 123 | ۴. ارتباط با مشتری معماری روابط و انتخاب برای هر پرسونا | ارتباط با مشتری | `structured-text-or-diagram` | 128 | 1 اتصال | `contextual` | `customer-relationships.section-index` |
| 124 | فهرست معماری روابط مشتری | ارتباط با مشتری | `process-or-relationship` | 601 | — | `contextual` | `customer-relationships.table-of-contents` |
| 125 | ۱. چارچوب کلی | ارتباط با مشتری | `process-or-relationship` | 837 | 3 اتصال | `imported` | `customer-relationships.framework` |
| 126 | ۲. مدل انتخاب شده | ارتباط با مشتری | `process-or-relationship` | 1322 | 1 اتصال | `imported` | `customer-relationships.selected-model` |
| 127 | ۳. آرکی تایپ رابطه ۱ از ۷ — تراکنشی (Transactional) | ارتباط با مشتری | `process-or-relationship` | 847 | 6 اتصال | `imported` | `customer-relationships.archetype-01` |
| 128 | ۳. آرکی تایپ رابطه ۲ از ۷ — همراه / خدماتی (Assisted / Service) | ارتباط با مشتری | `process-or-relationship` | 856 | 6 اتصال | `imported` | `customer-relationships.archetype-02` |
| 129 | ۳. آرکی تایپ رابطه ۳ از ۷ — مشاوره ای (Advisory) | ارتباط با مشتری | `process-or-relationship` | 855 | 6 اتصال | `imported` | `customer-relationships.archetype-03` |
| 130 | ۳. آرکی تایپ رابطه ۴ از ۷ — مدیریت شده Managed)) | ارتباط با مشتری | `process-or-relationship` | 821 | 6 اتصال | `imported` | `customer-relationships.archetype-04` |
| 131 | ۳. آرکی تایپ رابطه ۵ از ۷ — مشارکتی / هم آفرینی (Collaborative / Co-Creation) | ارتباط با مشتری | `process-or-relationship` | 885 | 6 اتصال | `imported` | `customer-relationships.archetype-05` |
| 132 | ۳. آرکی تایپ رابطه ۶ از ۷ — شراکت راهبردی Strategic Partnership)) | ارتباط با مشتری | `process-or-relationship` | 956 | 6 اتصال | `imported` | `customer-relationships.archetype-06` |
| 133 | ۳. آرکی تایپ رابطه ۷ از ۷ — اکوسیستمی / پلتفرمی Ecosystem / Platform)) | ارتباط با مشتری | `process-or-relationship` | 1124 | 6 اتصال | `imported` | `customer-relationships.archetype-07` |
| 134 | ۴. خلاصه | ارتباط با مشتری | `table-or-matrix` | 888 | 1 جدول | `imported` | `customer-relationships.archetype-summary` |
| 135 | ۵. دو معیار تصمیم | ارتباط با مشتری | `structured-text-or-diagram` | 1127 | — | `imported` | `customer-relationships.decision-criteria` |
| 136 | ۶. ماتریس نهایی | ارتباط با مشتری | `process-or-relationship` | 1183 | — | `imported` | `customer-relationships.decision-matrix` |
| 137 | ۷. تخصیص رابطه — پرسونا ۱ از ۶ — کسب وکار تراز ایرانی | ارتباط با مشتری | `structured-text-or-diagram` | 1536 | 4 اتصال | `imported` | `personas.persona-01.relationship-allocation` |
| 138 | ۷. تخصیص رابطه — پرسونا 2 از ۶ — کسب وکار تراز خارجی | ارتباط با مشتری | `process-or-relationship` | 1480 | 4 اتصال | `imported` | `personas.persona-02.relationship-allocation` |
| 139 | ۷. تخصیص رابطه — پرسونا ۳ از ۶ — کسب وکار مشتاق | ارتباط با مشتری | `process-or-relationship` | 1368 | 4 اتصال | `imported` | `personas.persona-03.relationship-allocation` |
| 140 | ۷. تخصیص رابطه — پرسونا 4 از ۶ — کسب وکار کنجکاو | ارتباط با مشتری | `structured-text-or-diagram` | 1274 | 4 اتصال | `imported` | `personas.persona-04.relationship-allocation` |
| 141 | ۷. تخصیص رابطه — پرسونا 5 از ۶ — خالق کسب وکار | ارتباط با مشتری | `process-or-relationship` | 1491 | 4 اتصال | `imported` | `personas.persona-05.relationship-allocation` |
| 142 | ۷. تخصیص رابطه — پرسونا ۶ از ۶ — سرمایه گذار | ارتباط با مشتری | `structured-text-or-diagram` | 1504 | 4 اتصال | `imported` | `personas.persona-06.relationship-allocation` |
| 143 | ۸. جمع بندی | ارتباط با مشتری | `process-or-relationship` | 1192 | 2 اتصال | `imported` | `customer-relationships.conclusions` |
| 144 | ۹. منابع | ارتباط با مشتری | `table-or-matrix` | 1856 | 2 جدول، 2 اتصال | `imported` | `customer-relationships.sources` |
| 145 | پایان‌بندی برند و اطلاعات تماس | پایان‌بندی و اطلاعات تماس | `empty-or-background-only` | 0 | — | `visual-only` | `project.closing` |
