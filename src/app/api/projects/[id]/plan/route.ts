import { requireEnv } from "@/lib/notion/client";
import { NextRequest, NextResponse } from "next/server";

type PlanTask = {
  title: string;
  status: "Backlog" | "Todo";
  priority?: "P0" | "P1" | "P2" | "P3";
  phase: "Discovery" | "Build" | "QA" | "Launch" | "Follow-up";
  // due offset in days from project due (negative = before due date)
  dueOffsetDays?: number;
};

function planTemplate(projectName: string): PlanTask[] {
  // Deterministic + boring on purpose. You can always refine after.
  return [
    { title: `Define success criteria for: ${projectName}`, status: "Backlog", priority: "P1", phase: "Discovery", dueOffsetDays: -18 },
    { title: `Collect requirements / constraints`, status: "Backlog", priority: "P1", phase: "Discovery", dueOffsetDays: -16 },
    { title: `Draft milestones + delivery plan`, status: "Backlog", priority: "P2", phase: "Discovery", dueOffsetDays: -14 },
    { title: `Set up repo / workspace / env`, status: "Backlog", priority: "P2", phase: "Build", dueOffsetDays: -13 },
    { title: `Build v1 (core workflow)`, status: "Backlog", priority: "P1", phase: "Build", dueOffsetDays: -10 },
    { title: `Integrations + edge cases`, status: "Backlog", priority: "P2", phase: "Build", dueOffsetDays: -8 },
    { title: `Observability: logging + error handling`, status: "Backlog", priority: "P2", phase: "Build", dueOffsetDays: -7 },
    { title: `QA pass + fix bugs`, status: "Backlog", priority: "P1", phase: "QA", dueOffsetDays: -4 },
    { title: `Ship / deploy`, status: "Backlog", priority: "P1", phase: "Launch", dueOffsetDays: -1 },
    { title: `Write documentation / runbook`, status: "Backlog", priority: "P2", phase: "Launch", dueOffsetDays: 0 },
    { title: `Post-launch check + improvements`, status: "Backlog", priority: "P3", phase: "Follow-up", dueOffsetDays: 2 },
  ];
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setUTCDate(d.getUTCDate() + days);
  return d;
}

function yyyyMmDd(date: Date): string {
  return date.toISOString().slice(0, 10);
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

  // Pull project due date (used to schedule tasks backwards).
  let projectDue: string | undefined;
  try {
    const pres = await fetch(`https://api.notion.com/v1/pages/${projectId}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${key}`,
        "Notion-Version": "2022-06-28",
      },
    });
    if (pres.ok) {
      const page = (await pres.json()) as any;
      const props = page?.properties ?? {};
      projectDue = props?.Due?.date?.start ?? undefined;
    }
  } catch {
    // best effort
  }

  const tasks = planTemplate(name || "(project)");

  const created: string[] = [];

  for (const t of tasks) {
    const properties: any = {
      Name: { title: [{ text: { content: t.title.slice(0, 180) } }] },
      // Tasks DB uses a Select for Status (not a Notion Status type).
      Status: { select: { name: t.status } },
      Project: { relation: [{ id: projectId }] },
      Phase: { select: { name: t.phase } },
    };

    if (projectDue && t.dueOffsetDays != null) {
      const due = yyyyMmDd(addDays(new Date(projectDue), t.dueOffsetDays));
      properties.Due = { date: { start: due } };
    }

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
