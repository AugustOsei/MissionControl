import { requireEnv } from "@/lib/notion/client";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const { approved, status, wordpressUrl } = await req.json();

  if (approved === undefined && status === undefined && wordpressUrl === undefined) {
    return NextResponse.json({ error: "at least one field is required" }, { status: 400 });
  }

  const key = requireEnv("NOTION_API_KEY");

  const properties: any = {};
  if (approved !== undefined) properties.Approved = { checkbox: Boolean(approved) };
  if (status !== undefined) properties.Status = { select: status ? { name: String(status) } : null };
  if (wordpressUrl !== undefined) {
    properties["WordPress URL"] = wordpressUrl ? { url: String(wordpressUrl) } : { url: null };
  }

  const res = await fetch(`https://api.notion.com/v1/pages/${id}`,
    {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${key}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ properties }),
    },
  );

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Notion error: ${text}` }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
