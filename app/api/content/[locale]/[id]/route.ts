import { NextResponse } from "next/server";

import { getItemDetail, isLocale } from "@/lib/content";

export async function GET(
  _request: Request,
  context: { params: Promise<{ locale: string; id: string }> },
) {
  const { locale, id } = await context.params;
  if (!isLocale(locale) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(id)) {
    return NextResponse.json({ error: "Invalid content identifier" }, { status: 400 });
  }
  const detail = getItemDetail(locale, id);
  if (!detail) return NextResponse.json({ error: "Content not found" }, { status: 404 });
  return NextResponse.json(detail, {
    headers: { "Cache-Control": "public, max-age=0, s-maxage=3600, stale-while-revalidate=86400" },
  });
}
