import { notFound, redirect } from "next/navigation";

import { isLocale } from "@/lib/content";

export default async function LocalePage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  redirect(`/${locale}/canvas`);
}
