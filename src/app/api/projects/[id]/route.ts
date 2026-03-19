import { requireEnv } from "@/lib/notion/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { pillar, level, parentId } = await req.json();

  const key = requireEnv("NOTION_API_KEY");

  const properties: any = {};

  // Selects
  if (pillar !== undefined) {
    properties.Pillar = pillar ? { select: { name: pillar } } : { select: null };
  }
  if (level !== undefined) {
    properties.Level = level ? { select: { name: level } } : { select: null };
  }

  // Relation
  if (parentId !== undefined) {
    properties["Parent Project"] = parentId
      ? { relation: [{ id: parentId }] }
      : { relation: [] };
  }

  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ properties }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Notion error: ${text}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
