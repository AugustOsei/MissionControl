import { TaskCard } from "@/components/tasks/TaskCard";
import type { Task } from "@/lib/notion/tasks";

const COLS = [
  { key: "Backlog", title: "Backlog" },
  { key: "Todo", title: "Todo" },
  { key: "Doing", title: "Doing" },
  { key: "Done", title: "Done" },
  { key: "Archived", title: "Archived" },
] as const;

export function TaskBoard({ tasks }: { tasks: Task[] }) {
  const byStatus = new Map<string, Task[]>();
  for (const c of COLS) byStatus.set(c.key, []);
  for (const t of tasks) {
    const key = byStatus.has(t.status) ? t.status : "Backlog";
    byStatus.get(key)!.push(t);
  }

  const total = tasks.length;
  const done = (byStatus.get("Done") ?? []).length;
  const inProgress = (byStatus.get("Doing") ?? []).length;
  const completion = total ? Math.round((done / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card">
          <div className="cardTitle">This week</div>
          <div className="cardValue">{tasks.filter((t) => t.isThisWeek).length}</div>
          <div className="cardSub">created/updated</div>
        </div>
        <div className="card">
          <div className="cardTitle">In progress</div>
          <div className="cardValue">{inProgress}</div>
          <div className="cardSub">Doing</div>
        </div>
        <div className="card">
          <div className="cardTitle">Total</div>
          <div className="cardValue">{total}</div>
          <div className="cardSub">tasks</div>
        </div>
        <div className="card">
          <div className="cardTitle">Completion</div>
          <div className="cardValue">{completion}%</div>
          <div className="cardSub">Done / Total</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 lg:grid-cols-5">
        {COLS.map((c) => (
          <div key={c.key} className="rounded-xl border border-white/10 bg-white/5">
            <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
              <div className="text-sm font-medium text-white/80">{c.title}</div>
              <div className="text-xs text-white/40">{byStatus.get(c.key)!.length}</div>
            </div>

            <div className="space-y-2 p-2">
              {byStatus.get(c.key)!.map((t) => (
                <TaskCard key={t.id} task={t} />
              ))}
              {byStatus.get(c.key)!.length === 0 && (
                <div className="rounded-lg border border-dashed border-white/10 p-3 text-xs text-white/30">
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
