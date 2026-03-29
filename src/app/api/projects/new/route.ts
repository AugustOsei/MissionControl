import { requireEnv } from "@/lib/notion/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const key = requireEnv("NOTION_API_KEY");
  const projectsDb = requireEnv("NOTION_PROJECTS_DB");

  const body = await req.json().catch(() => ({}));
  const name = String(body?.name ?? "").trim();
  if (!name) return NextResponse.json({ error: "name is required" }, { status: 400 });

  const due = body?.due ? String(body.due) : undefined; // YYYY-MM-DD
  const start = body?.start ? String(body.start) : undefined; // YYYY-MM-DD

  const quickSummary = body?.quickSummary ? String(body.quickSummary).slice(0, 1800) : "";
  const nextAction = body?.nextAction ? String(body.nextAction).slice(0, 1800) : "";

  const properties: any = {
    Name: { title: [{ text: { content: name.slice(0, 120) } }] },
    Status: { select: { name: "Backlog" } },
    Level: { select: { name: "L1" } },
    "Progress Mode": { select: { name: "auto" } },
  };

  if (start) properties.Start = { date: { start } };
  if (due) properties.Due = { date: { start: due } };

  if (quickSummary) properties["Quick Summary"] = { rich_text: [{ text: { content: quickSummary } }] };
  if (nextAction) properties["Next Action"] = { rich_text: [{ text: { content: nextAction } }] };

  if (body?.pillar) properties.Pillar = { select: { name: String(body.pillar) } };
  if (body?.parentId) properties["Parent Project"] = { relation: [{ id: String(body.parentId) }] };

  if (body?.appUrl !== undefined) properties["App URL"] = body.appUrl ? { url: String(body.appUrl) } : { url: null };
  if (body?.repoUrl !== undefined) properties["Repo URL"] = body.repoUrl ? { url: String(body.repoUrl) } : { url: null };
  if (body?.docsUrl !== undefined) properties["Docs URL"] = body.docsUrl ? { url: String(body.docsUrl) } : { url: null };

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ parent: { database_id: projectsDb }, properties }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Notion error: ${text}` }, { status: 500 });
  }

  const page = await res.json().catch(() => ({}));
  return NextResponse.json({ ok: true, id: page?.id, url: page?.url });
}
