import { requireEnv } from "@/lib/notion/client";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { title, status = "Backlog", bucket = "Task", projectId = null } = await req.json();

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const key = requireEnv("NOTION_API_KEY");
  const db = requireEnv("NOTION_TASKS_DB");

  const res = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      parent: { database_id: db },
      properties: {
        Name: { title: [{ text: { content: title.trim() } }] },
        Status: { select: { name: status } },
        Bucket: { select: { name: bucket } },
        ...(projectId ? { Project: { relation: [{ id: projectId }] } } : {}),
      },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    return NextResponse.json({ error: `Notion error: ${text}` }, { status: 500 });
  }

  const page = await res.json();
  return NextResponse.json({ id: page.id }, { status: 201 });
}
