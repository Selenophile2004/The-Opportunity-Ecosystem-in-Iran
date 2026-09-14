import { notFound } from "next/navigation";

import { isLocale, type Locale } from "@/lib/content";

export function generateStaticParams(): Array<{ locale: Locale }> {
  return [{ locale: "fa" }, { locale: "en" }];
}

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  return (
    <div lang={locale === "fa" ? "fa-IR" : "en"} dir={locale === "fa" ? "rtl" : "ltr"}>
      {children}
    </div>
  );
}
