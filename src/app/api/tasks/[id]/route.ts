import { requireEnv } from "@/lib/notion/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const { status } = await req.json();

  if (!status) {
    return NextResponse.json({ error: "status is required" }, { status: 400 });
  }

  const key = requireEnv("NOTION_API_KEY");

  const res = await fetch(`https://api.notion.com/v1/pages/${id}`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      properties: {
        Status: { select: { name: status } },
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Notion error: ${text}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
