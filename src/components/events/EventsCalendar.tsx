"use client";

import { useMemo, useState } from "react";

export type EventRow = {
  kind: "task" | "project";
  title: string;
  date: string; // YYYY-MM-DD
  detail?: string;
  href?: string;
};

function pad(n: number) {
  return String(n).padStart(2, "0");
}

function ym(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

function dayKey(d: Date) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

function monthGridDays(d: Date) {
  // Monday-first grid.
  const start = startOfMonth(d);
  const end = endOfMonth(d);

  const startDay = (start.getDay() + 6) % 7; // Mon=0
  const gridStart = addDays(start, -startDay);

  const endDay = (end.getDay() + 6) % 7;
  const gridEnd = addDays(end, 6 - endDay);

  const days: Date[] = [];
  for (let cur = gridStart; cur <= gridEnd; cur = addDays(cur, 1)) days.push(cur);
  return { start, end, days };
}

const KIND_BADGE: Record<string, string> = {
  task: "border-blue-500/25 bg-blue-500/10 text-blue-200",
  project: "border-purple-500/25 bg-purple-500/10 text-purple-200",
};

export function EventsCalendar({ rows }: { rows: EventRow[] }) {
  const [cursor, setCursor] = useState(() => {
    const d = new Date();
    return new Date(d.getFullYear(), d.getMonth(), 1);
  });

  const byDate = useMemo(() => {
    const m = new Map<string, EventRow[]>();
    for (const r of rows) {
      const k = r.date;
      if (!m.has(k)) m.set(k, []);
      m.get(k)!.push(r);
    }
    for (const [k, v] of m.entries()) {
      v.sort((a, b) => a.kind.localeCompare(b.kind) || a.title.localeCompare(b.title));
      m.set(k, v);
    }
    return m;
  }, [rows]);

  const today = dayKey(new Date());
  const { start, days } = monthGridDays(cursor);
  const cursorLabel = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-mono text-white/40 uppercase tracking-widest">Calendar</div>
          <div className="text-lg font-semibold text-white/90">{cursorLabel}</div>
        </div>

        <div className="flex items-center gap-2">
          <button
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/60 hover:border-white/20 hover:text-white/80"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1))}
          >
            ← prev
          </button>
          <button
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/60 hover:border-white/20 hover:text-white/80"
            onClick={() => setCursor(new Date(new Date().getFullYear(), new Date().getMonth(), 1))}
          >
            today
          </button>
          <button
            className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/60 hover:border-white/20 hover:text-white/80"
            onClick={() => setCursor((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1))}
          >
            next →
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
        <div className="grid grid-cols-7 border-b border-white/10">
          {[
            "Mon",
            "Tue",
            "Wed",
            "Thu",
            "Fri",
            "Sat",
            "Sun",
          ].map((d) => (
            <div key={d} className="px-3 py-2 text-[11px] font-mono text-white/40 uppercase tracking-widest">
              {d}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7">
          {days.map((d) => {
            const k = dayKey(d);
            const items = byDate.get(k) ?? [];
            const inMonth = d.getMonth() === start.getMonth();
            const isToday = k === today;

            return (
              <div
                key={k}
                className={
                  "min-h-[96px] border-t border-white/8 px-2 py-2 " +
                  (inMonth ? "bg-transparent" : "bg-black/20")
                }
              >
                <div className="flex items-center justify-between">
                  <div
                    className={
                      "text-[11px] font-mono " +
                      (isToday
                        ? "text-amber-200"
                        : inMonth
                          ? "text-white/50"
                          : "text-white/25")
                    }
                  >
                    {d.getDate()}
                  </div>
                  {isToday && (
                    <span className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-200">
                      today
                    </span>
                  )}
                </div>

                <div className="mt-2 space-y-1">
                  {items.slice(0, 3).map((it, idx) => (
                    <a
                      key={idx}
                      href={it.href}
                      target="_blank"
                      rel="noreferrer"
                      className="block rounded-md border border-white/10 bg-black/40 px-2 py-1 hover:border-white/20"
                      title={it.detail ?? it.title}
                    >
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span className={"rounded-full border px-1.5 py-0.5 text-[9px] font-mono uppercase " + (KIND_BADGE[it.kind] ?? KIND_BADGE.task)}>
                          {it.kind}
                        </span>
                        <span className="truncate text-[11px] text-white/75">{it.title}</span>
                      </div>
                    </a>
                  ))}

                  {items.length > 3 && (
                    <div className="text-[10px] font-mono text-white/35">+{items.length - 3} more…</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
