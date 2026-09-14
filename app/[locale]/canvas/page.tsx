import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Suspense } from "react";

import { CanvasExperience } from "@/components/canvas-experience";
import { getCanvasView, isLocale } from "@/lib/content";

export const metadata: Metadata = {
  title: "Business Model Canvas",
};

export default async function CanvasPage({
  params,
}: Readonly<{ params: Promise<{ locale: string }> }>) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const view = getCanvasView(locale);

  return (
    <Suspense fallback={<div className="loading-shell" aria-label="Loading" />}>
      <CanvasExperience {...view} />
    </Suspense>
  );
}
