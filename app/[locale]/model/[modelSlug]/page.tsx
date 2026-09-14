import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ModelExperience } from "@/components/model-experience";
import { getModelView, isLocale } from "@/lib/content";

type PageProps = Readonly<{
  params: Promise<{ locale: string; modelSlug: string }>;
}>;

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, modelSlug } = await params;
  if (!isLocale(locale)) return {};
  const view = getModelView(locale, modelSlug);
  return view ? { title: view.title, description: view.description } : {};
}

export default async function ModelPage({ params }: PageProps) {
  const { locale, modelSlug } = await params;
  if (!isLocale(locale)) notFound();
  const view = getModelView(locale, modelSlug);
  if (!view) notFound();
  return <ModelExperience {...view} />;
}
