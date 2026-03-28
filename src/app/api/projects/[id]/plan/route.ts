import { requireEnv } from "@/lib/notion/client";
import { NextRequest, NextResponse } from "next/server";

function planTemplate(projectName: string): Array<{ title: string; status: string; priority?: string }> {
  // Deterministic, boring on purpose. You can always refine after.
  return [
    { title: `Define success criteria for: ${projectName}`, status: "Backlog", priority: "P1" },
    { title: `Collect requirements / constraints`, status: "Backlog", priority: "P1" },
    { title: `Draft milestones + delivery plan`, status: "Backlog", priority: "P2" },
    { title: `Set up repo / workspace / env`, status: "Backlog", priority: "P2" },
    { title: `Build v1 (core workflow)`, status: "Backlog", priority: "P1" },
    { title: `Integrations + edge cases`, status: "Backlog", priority: "P2" },
    { title: `Observability: logging + error handling`, status: "Backlog", priority: "P2" },
    { title: `QA pass + fix bugs`, status: "Backlog", priority: "P1" },
    { title: `Ship / deploy`, status: "Backlog", priority: "P1" },
    { title: `Write documentation / runbook`, status: "Backlog", priority: "P2" },
    { title: `Post-launch check + improvements`, status: "Backlog", priority: "P3" },
  ];
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  const { projectName } = await req.json().catch(() => ({}));
  const name = String(projectName ?? "").trim();

  const key = requireEnv("NOTION_API_KEY");
  const tasksDb = requireEnv("NOTION_TASKS_DB");

  const tasks = planTemplate(name || "(project)");

  const created: string[] = [];

  for (const t of tasks) {
    const properties: any = {
      Name: { title: [{ text: { content: t.title.slice(0, 180) } }] },
      Status: { status: { name: t.status } },
      Project: { relation: [{ id: projectId }] },
    };

    // Priority is optional; ignore if the property doesn't exist.
    if (t.priority) {
      properties.Priority = { select: { name: t.priority } };
    }

    const res = await fetch("https://api.notion.com/v1/pages", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ parent: { database_id: tasksDb }, properties }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: `Notion error creating task: ${text}`, created },
        { status: 500 },
      );
    }

    const body = await res.json().catch(() => ({}));
    if (body?.id) created.push(body.id);
  }

  return NextResponse.json({ ok: true, createdCount: created.length, created });
}
