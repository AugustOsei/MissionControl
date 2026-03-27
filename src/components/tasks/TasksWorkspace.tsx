"use client";

import { useMemo, useState } from "react";
import type { Task } from "@/lib/notion/tasks";
import { TaskBoard } from "@/components/tasks/TaskBoard";

function isIdea(t: Task) {
  return (t.bucket ?? "").toLowerCase() === "idea";
}

function isDone(t: Task) {
  return (t.status ?? "").toLowerCase() === "done";
}

function dayKeyLocal(d: Date) {
  // YYYY-MM-DD in local time.
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dueDayKeyLocal(iso?: string) {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return undefined;
  return dayKeyLocal(d);
}

export function TasksWorkspace({ tasks }: { tasks: Task[] }) {
  const [showDone, setShowDone] = useState(false);

  const todayKey = useMemo(() => dayKeyLocal(new Date()), []);

  // Tasks workspace is for execution. Ideas live on /ideas.
  const workAll = useMemo(() => tasks.filter((t) => !isIdea(t)), [tasks]);
  const work = useMemo(
    () => (showDone ? workAll : workAll.filter((t) => !isDone(t))),
    [workAll, showDone],
  );

  const dueItems = useMemo(() => {
    // Only tasks with an explicit due date belong in the Today/Overdue lane.
    return workAll
      .filter((t) => !isIdea(t))
      .filter((t) => !isDone(t))
      .filter((t) => Boolean(t.due));
  }, [workAll]);

  const overdue = useMemo(() => {
    return dueItems
      .filter((t) => {
        const k = dueDayKeyLocal(t.due);
        return k ? k < todayKey : false;
      })
      .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""));
  }, [dueItems, todayKey]);

  const dueToday = useMemo(() => {
    return dueItems
      .filter((t) => dueDayKeyLocal(t.due) === todayKey)
      .sort((a, b) => (a.due ?? "").localeCompare(b.due ?? ""));
  }, [dueItems, todayKey]);

  return (
    <div className="space-y-4">
        <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <div className="text-sm font-semibold">Today</div>
              <div className="text-xs text-white/50">Only tasks with due dates</div>
            </div>
            <div className="flex items-center gap-2">
              <div className="text-[11px] font-mono text-white/40">overdue: {overdue.length} · today: {dueToday.length}</div>
            </div>
          </div>

          <div className="p-3 space-y-3">
            {overdue.length > 0 && (
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3">
                <div className="text-[11px] font-mono text-red-300 uppercase tracking-widest">Overdue</div>
                <div className="mt-2 space-y-2">
                  {overdue.slice(0, 8).map((t) => (
                    <div key={t.id} className="rounded-lg border border-white/10 bg-black/40 p-3">
                      <div className="text-sm text-white/85 truncate">{t.title}</div>
                      <div className="mt-1 text-[11px] font-mono text-red-200/70">due: {(t.due ?? "").slice(0, 10)}</div>
                    </div>
                  ))}
                  {overdue.length > 8 && (
                    <div className="text-[11px] font-mono text-white/35">+{overdue.length - 8} more…</div>
                  )}
                </div>
              </div>
            )}

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Due today</div>
              <div className="mt-2 space-y-2">
                {dueToday.slice(0, 8).map((t) => (
                  <div key={t.id} className="rounded-lg border border-white/10 bg-black/40 p-3">
                    <div className="text-sm text-white/85 truncate">{t.title}</div>
                    <div className="mt-1 text-[11px] font-mono text-white/35">status: {t.status}</div>
                  </div>
                ))}
                {dueToday.length === 0 && (
                  <div className="rounded-lg border border-dashed border-white/10 p-4 text-xs text-white/35 font-mono text-center">
                    Nothing due today.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm font-semibold">Board</div>
            <div className="text-xs text-white/50">Backlog + Doing. Done hidden by default.</div>
          </div>

          <button
            type="button"
            onClick={() => setShowDone((v) => !v)}
            className={`rounded-full border px-3 py-1.5 text-xs font-mono transition-colors ${
              showDone
                ? "border-green-500/30 bg-green-500/10 text-green-200"
                : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
            }`}
          >
            {showDone ? "Show Done: ON" : "Show Done: OFF"}
          </button>
        </div>

        <TaskBoard tasks={work} />
    </div>
  );
}
