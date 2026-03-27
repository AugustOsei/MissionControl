import { getTasksForBoard } from "@/lib/notion/tasks";
import { getProjectsTreeForDb } from "@/lib/notion/projects";

export const dynamic = "force-dynamic";

type EventRow = {
  kind: "calendar" | "task" | "project";
  title: string;
  date: string; // YYYY-MM-DD
  detail?: string;
  href?: string;
};

function dayKey(iso?: string): string | null {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function flattenProjects(parents: any[]): Array<{ id: string; name: string; due?: string; status?: string; nextAction?: string }> {
  const out: any[] = [];
  const stack = [...parents];
  while (stack.length) {
    const n = stack.shift();
    out.push({ id: n.id, name: n.name, due: n.due, status: n.status, nextAction: n.nextAction });
    for (const c of n.children ?? []) stack.push(c);
  }
  return out;
}

export default async function EventsPage() {
  const [tasks, projectsTree] = await Promise.all([
    getTasksForBoard().catch(() => []),
    process.env.NOTION_PROJECTS_DB
      ? getProjectsTreeForDb(process.env.NOTION_PROJECTS_DB).catch(() => null)
      : Promise.resolve(null),
  ]);

  const today = dayKey(new Date().toISOString())!;

  const taskEvents: EventRow[] = tasks
    .filter((t) => (t.bucket ?? "").toLowerCase() !== "idea")
    .filter((t) => {
      const st = (t.status ?? "").toLowerCase();
      return st !== "done" && st !== "archived";
    })
    .filter((t) => Boolean(t.due))
    .map((t) => ({
      kind: "task",
      title: t.title,
      date: dayKey(t.due)!,
      detail: t.projectName ? `project: ${t.projectName}` : undefined,
      href: `https://notion.so/${t.id.replace(/-/g, "")}`,
    }));

  const projects = projectsTree ? flattenProjects(projectsTree.parents) : [];
  const projectEvents: EventRow[] = projects
    .filter((p) => Boolean(p.due))
    .filter((p) => (p.status ?? "").toLowerCase() !== "archive")
    .map((p) => ({
      kind: "project",
      title: p.name,
      date: dayKey(p.due)!,
      detail: p.nextAction ? `next: ${p.nextAction}` : "project due",
      href: `https://notion.so/${p.id.replace(/-/g, "")}`,
    }));

  const rows = [...taskEvents, ...projectEvents].sort((a, b) => {
    const d = a.date.localeCompare(b.date);
    if (d !== 0) return d;
    return a.kind.localeCompare(b.kind);
  });

  const upcoming = rows.filter((r) => r.date >= today).slice(0, 40);
  const overdue = rows.filter((r) => r.date < today).slice(0, 20);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold">Events</h1>
        <p className="text-sm text-white/60">Unified timeline: Calendar + due dates.</p>
      </div>

      <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
        <div className="text-sm font-semibold">Google Calendar (coming next)</div>
        <div className="mt-1 text-xs text-amber-100/80">
          Notion due dates are live now. Google Calendar requires a server-side integration for Vercel (we can wire it via a secure proxy or OAuth env vars).
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-sm font-semibold text-white/85">Overdue</div>
            <div className="text-xs text-white/50">(done hidden)</div>
          </div>
          <div className="divide-y divide-white/10">
            {overdue.length === 0 && (
              <div className="px-4 py-6 text-xs font-mono text-white/35 text-center">No overdue items.</div>
            )}
            {overdue.map((r, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-white/85 truncate">{r.title}</div>
                    {r.detail && <div className="mt-1 text-xs text-white/50 line-clamp-2">{r.detail}</div>}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[11px] font-mono text-red-200">{r.date}</div>
                    {r.href && (
                      <a href={r.href} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-white/35 hover:text-white/60">
                        open ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-sm font-semibold text-white/85">Upcoming</div>
            <div className="text-xs text-white/50">Next 40 items</div>
          </div>
          <div className="divide-y divide-white/10">
            {upcoming.length === 0 && (
              <div className="px-4 py-6 text-xs font-mono text-white/35 text-center">No upcoming items with due dates.</div>
            )}
            {upcoming.map((r, i) => (
              <div key={i} className="px-4 py-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-white/85 truncate">{r.title}</div>
                    {r.detail && <div className="mt-1 text-xs text-white/50 line-clamp-2">{r.detail}</div>}
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="text-[11px] font-mono text-white/35">{r.date}</div>
                    {r.href && (
                      <a href={r.href} target="_blank" rel="noreferrer" className="text-[11px] font-mono text-white/35 hover:text-white/60">
                        open ↗
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
