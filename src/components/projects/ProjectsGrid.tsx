"use client";

import { useMemo, useState } from "react";
import type { FlatProject } from "@/components/projects/ProjectExplorer";

function uniqSorted(xs: Array<string | undefined>) {
  return Array.from(new Set(xs.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
}

function hasText(s?: string) {
  return Boolean(s && s.trim().length > 0);
}

function shortDate(iso?: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 10);
}

function daysUntil(iso?: string) {
  if (!iso) return null;
  const d = new Date(iso);
  if (!Number.isFinite(d.getTime())) return null;
  const now = new Date();
  // compare by local midnight
  const a = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const b = new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
  return Math.round((b - a) / 86400000);
}

function statusTone(status?: string) {
  const s = (status ?? "").toLowerCase();
  if (s === "active") return "border-green-500/30 bg-green-500/10 text-green-200";
  if (s === "paused") return "border-amber-500/30 bg-amber-500/10 text-amber-200";
  if (s === "backlog") return "border-white/10 bg-white/5 text-white/60";
  if (s === "archive") return "border-white/8 bg-black/20 text-white/35";
  return "border-white/10 bg-white/5 text-white/60";
}

function statusRank(status?: string) {
  const s = (status ?? "").toLowerCase();
  if (s === "active") return 0;
  if (s === "paused") return 1;
  if (s === "backlog") return 2;
  if (s === "archive") return 3;
  return 9;
}

export function ProjectsGrid({ projects, onOpen }: { projects: FlatProject[]; onOpen: (id: string) => void }) {
  const [q, setQ] = useState("");
  const [pillar, setPillar] = useState<string>("");
  const [level, setLevel] = useState<string>("");
  const [onlyLinked, setOnlyLinked] = useState(false);

  const pillarOptions = useMemo(() => uniqSorted(projects.map((p) => p.pillar)), [projects]);
  const levelOptions = useMemo(() => uniqSorted(projects.map((p) => p.level)), [projects]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    const out = projects.filter((p) => {
      if (needle && !p.name.toLowerCase().includes(needle)) return false;
      if (pillar && (p.pillar ?? "") !== pillar) return false;
      if (level && (p.level ?? "") !== level) return false;
      if (onlyLinked) {
        const linked = Boolean(p.appUrl || p.repoUrl || p.docsUrl);
        if (!linked) return false;
      }
      return true;
    });

    // Default sort: status (Active first), then due soonest.
    out.sort((a, b) => {
      const r = statusRank(a.status) - statusRank(b.status);
      if (r !== 0) return r;
      const ad = daysUntil(a.due);
      const bd = daysUntil(b.due);
      if (ad === null && bd === null) return a.name.localeCompare(b.name);
      if (ad === null) return 1;
      if (bd === null) return -1;
      if (ad !== bd) return ad - bd;
      return a.name.localeCompare(b.name);
    });

    return out;
  }, [projects, q, pillar, level, onlyLinked]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex-1">
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Project index</div>
            <div className="mt-1 text-sm text-white/70">
              {filtered.length} of {projects.length}
            </div>
          </div>

          <div className="flex flex-1 flex-col gap-2 md:flex-row md:justify-end">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search projects…"
              className="w-full md:w-[260px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-colors font-mono"
            />

            <select
              value={pillar}
              onChange={(e) => setPillar(e.target.value)}
              className="w-full md:w-[170px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 outline-none font-mono"
            >
              <option value="" className="bg-neutral-900">
                Pillar (all)
              </option>
              {pillarOptions.map((x) => (
                <option key={x} value={x} className="bg-neutral-900">
                  {x}
                </option>
              ))}
            </select>

            <select
              value={level}
              onChange={(e) => setLevel(e.target.value)}
              className="w-full md:w-[170px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 outline-none font-mono"
            >
              <option value="" className="bg-neutral-900">
                Level (all)
              </option>
              {levelOptions.map((x) => (
                <option key={x} value={x} className="bg-neutral-900">
                  {x}
                </option>
              ))}
            </select>

            <label className="flex items-center gap-2 text-xs font-mono text-white/55 select-none">
              <input
                type="checkbox"
                checked={onlyLinked}
                onChange={(e) => setOnlyLinked(e.target.checked)}
              />
              linked only
            </label>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const summary = p.quickSummary?.trim() ?? "";
          const s = p.stats;
          const dueIn = daysUntil(p.due);

          const total = (s?.notStarted ?? 0) + (s?.doing ?? 0) + (s?.done ?? 0);
          const pct = s?.pct ?? 0;

          return (
            <button
              key={p.id}
              onClick={() => onOpen(p.id)}
              className="group rounded-2xl border border-white/10 bg-black/30 p-4 text-left hover:border-white/20 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="text-base font-semibold text-white/90 truncate group-hover:text-white">
                      {p.name}
                    </div>
                    {p.status && (
                      <span className={"rounded-full border px-2 py-0.5 text-[10px] font-mono " + statusTone(p.status)}>
                        {p.status}
                      </span>
                    )}
                    {p.priorityBand && (
                      <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/55">
                        {p.priorityBand}
                      </span>
                    )}
                  </div>

                  <div className="mt-1 text-[11px] font-mono text-white/45 truncate">
                    {[p.pillar, p.level].filter(Boolean).join(" · ") || "—"}
                  </div>

                  {p.nextAction && (
                    <div className="mt-2 text-xs text-white/65 line-clamp-2">
                      <span className="text-white/35 font-mono">next:</span> {p.nextAction}
                    </div>
                  )}
                </div>

                <div className="shrink-0 flex flex-col items-end gap-2">
                  <div className="flex flex-wrap justify-end gap-1">
                    {p.appUrl && <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-200">app</span>}
                    {p.repoUrl && <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono text-purple-200">repo</span>}
                    {p.docsUrl && <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-200">docs</span>}
                  </div>

                  <div className="text-right">
                    <div className="text-[11px] font-mono text-white/35">due: {shortDate(p.due)}</div>
                    {dueIn !== null && (
                      <div className={"text-[11px] font-mono " + (dueIn < 0 ? "text-red-300" : dueIn <= 7 ? "text-amber-200" : "text-white/35")}>
                        {dueIn < 0 ? `D+${Math.abs(dueIn)}` : `D-${dueIn}`}
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3">
                <div className="flex items-center justify-between">
                  <div className="text-[11px] font-mono text-white/35">progress</div>
                  <div className="text-[11px] font-mono text-white/45">{pct}%</div>
                </div>
                <div className="mt-1 h-2 w-full overflow-hidden rounded-full border border-white/10 bg-black/30">
                  <div className="flex h-full w-full">
                    <div
                      className="h-full bg-slate-400/50"
                      style={{ width: total ? `${((s?.notStarted ?? 0) / total) * 100}%` : "0%" }}
                      title={`not started: ${s?.notStarted ?? 0}`}
                    />
                    <div
                      className="h-full bg-amber-400/70"
                      style={{ width: total ? `${((s?.doing ?? 0) / total) * 100}%` : "0%" }}
                      title={`doing: ${s?.doing ?? 0}`}
                    />
                    <div
                      className="h-full bg-green-400/70"
                      style={{ width: total ? `${((s?.done ?? 0) / total) * 100}%` : "0%" }}
                      title={`done: ${s?.done ?? 0}`}
                    />
                  </div>
                </div>
                <div className="mt-1 text-[10px] font-mono text-white/30">
                  {total} tasks · ns {s?.notStarted ?? 0} · doing {s?.doing ?? 0} · done {s?.done ?? 0}
                </div>
              </div>

              <div className="mt-3 text-sm text-white/65 leading-relaxed">
                {hasText(summary) ? (
                  <span className="line-clamp-2">{summary}</span>
                ) : (
                  <span className="text-white/30 font-mono text-xs">No summary yet</span>
                )}
              </div>
            </button>
          );
        })}

        {filtered.length === 0 && (
          <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35 font-mono md:col-span-2 xl:col-span-3">
            No projects match your filters.
          </div>
        )}
      </div>
    </div>
  );
}
