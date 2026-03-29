import { requireEnv } from "@/lib/notion/client";
import { NextRequest, NextResponse } from "next/server";

const PHASE_ORDER = ["Discovery", "Build", "QA", "Launch", "Follow-up"];
const PRI_ORDER = ["P0", "P1", "P2", "P3"];

function idx(list: string[], v?: string) {
  const i = list.indexOf(v ?? "");
  return i === -1 ? 999 : i;
}

export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id: projectId } = await params;

  const key = requireEnv("NOTION_API_KEY");
  const tasksDb = requireEnv("NOTION_TASKS_DB");

  // Fetch tasks for this project.
  const q = await fetch(`https://api.notion.com/v1/databases/${tasksDb}/query`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      page_size: 100,
      filter: {
        property: "Project",
        relation: { contains: projectId },
      },
      sorts: [{ timestamp: "created_time", direction: "ascending" }],
    }),
  });

  if (!q.ok) {
    const text = await q.text();
    return NextResponse.json({ error: `Notion query error: ${text}` }, { status: 500 });
  }

  const data = (await q.json()) as any;
  const results = Array.isArray(data?.results) ? data.results : [];

  const candidates = results
    .map((page: any) => {
      const props = page?.properties ?? {};
      const status = props?.Status?.select?.name ?? "";
      const phase = props?.Phase?.select?.name ?? "";
      const priority = props?.Priority?.select?.name ?? "";
      const due = props?.Due?.date?.start ?? "";
      return {
        id: page.id,
        status,
        phase,
        priority,
        due,
      };
    })
    .filter((t: any) => String(t.status).toLowerCase() === "backlog");

  candidates.sort((a: any, b: any) => {
    const pa = idx(PHASE_ORDER, a.phase);
    const pb = idx(PHASE_ORDER, b.phase);
    if (pa !== pb) return pa - pb;
    const ra = idx(PRI_ORDER, a.priority);
    const rb = idx(PRI_ORDER, b.priority);
    if (ra !== rb) return ra - rb;
    return String(a.due).localeCompare(String(b.due));
  });

  const pick = candidates.slice(0, 3);
  const promoted: string[] = [];

  for (const t of pick) {
    const res = await fetch(`https://api.notion.com/v1/pages/${t.id}`, {
      method: "PATCH",
      headers: {
        Authorization: `Bearer ${key}`,
        "Notion-Version": "2022-06-28",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        properties: {
          Status: { select: { name: "Todo" } },
        },
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Notion patch error: ${text}`, promoted }, { status: 500 });
    }

    promoted.push(t.id);
  }

  return NextResponse.json({ ok: true, promotedCount: promoted.length, promoted });
}
