# گزارش تفاوت منبع PPTX و PDF

## نتیجه

نسخه PDF جایگزین منبع اصلی نیست. هر دو فایل ۱۴۵ واحد صفحه/اسلاید دارند و نام پایه آن‌ها یکسان است. PDF در `2026-09-06T11:53:58Z` و PPTX چهار ثانیه بعد در `2026-09-06T11:54:02Z` ثبت شده‌اند؛ این الگو با export هم‌زمان سازگار است و نشانه‌ای از نسخه محتوایی جدیدتر دیده نشد.

| ویژگی | PPTX | PDF |
|---|---:|---:|
| اسلاید/صفحه | 145 | 145 |
| اندازه فایل | 4,613,710 bytes | 2,953,820 bytes |
| SHA-256 | `35977625510758e4fa3b8fcf348d8904dfb5aa99ebe33f7fda4c3d5bd0f58561` | `e1f4b3dbddee947a03fedb824238c72ca350471b66229f55f3f511318baee95a` |
| ساختار قابل استخراج | shape، table، connector، media relation | صفحه تخت + text layer |
| کاربرد canonical | محتوا و provenance | کنترل بصری |

## تفاوت‌های ساختاری

- PPTX دارای 3,964 shape، 54 جدول و 362 connector است؛ PDF این ساختارها را flatten می‌کند.
- ۱۳ SVG داخلی در PPTX از relationshipهای داخلی بارگیری می‌شوند. `python-pptx` metadata raster آن‌ها را decode نمی‌کند، ولی PDF آن‌ها را رندر کرده است.
- text layer فارسی PDF حروف هر واژه را در ترتیب معکوس برمی‌گرداند؛ بنابراین similarity متنی خام معیار version diff قابل اعتماد نیست. متن PPTX canonical باقی می‌ماند.
- اسلاید ۱۴۵ در slide shape متن ندارد، اما PDF پایان‌بندی برند و اطلاعات تماس را نشان می‌دهد؛ این محتوا از master/render می‌آید.

## کنترل بصری

هر ۱۴۵ صفحه در ۱۳ contact sheet مرور شد. صفحه حذف‌شده یا PDF اضافه مشاهده نشد. PDF برای QA هندسه، رنگ، جدول، SVG و پایان‌بندی نگهداری می‌شود؛ ادعای pixel-perfect equivalence تا زمان رندر مستقل PPTX در pipeline نهایی مطرح نمی‌شود.

داده ماشین‌خوان مقایسه در `artifacts/phase0/source-comparison.json` است. فیلد `tokenJaccard` به دلیل محدودیت bidi فارسی فقط diagnostic است و نباید به‌تنهایی تصمیم versioning بسازد.
