"use client";

import { useMemo, useState } from "react";
import type { FlatProject } from "@/components/projects/ProjectExplorer";

function uniqSorted(xs: Array<string | undefined>) {
  return Array.from(new Set(xs.filter(Boolean) as string[])).sort((a, b) => a.localeCompare(b));
}

function hasText(s?: string) {
  return Boolean(s && s.trim().length > 0);
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
    return projects.filter((p) => {
      if (needle && !p.name.toLowerCase().includes(needle)) return false;
      if (pillar && (p.pillar ?? "") !== pillar) return false;
      if (level && (p.level ?? "") !== level) return false;
      if (onlyLinked) {
        const linked = Boolean(p.appUrl || p.repoUrl || p.docsUrl);
        if (!linked) return false;
      }
      return true;
    });
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
          return (
            <button
              key={p.id}
              onClick={() => onOpen(p.id)}
              className="group rounded-2xl border border-white/10 bg-black/30 p-4 text-left hover:border-white/20 hover:bg-white/[0.04] transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold text-white/90 truncate group-hover:text-white">
                    {p.name}
                  </div>
                  <div className="mt-1 text-[11px] font-mono text-white/45 truncate">
                    {[p.pillar, p.level].filter(Boolean).join(" · ") || "—"}
                  </div>
                </div>

                <div className="shrink-0 flex flex-wrap gap-1">
                  {p.appUrl && <span className="rounded-full border border-blue-500/25 bg-blue-500/10 px-2 py-0.5 text-[10px] font-mono text-blue-200">app</span>}
                  {p.repoUrl && <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-[10px] font-mono text-purple-200">repo</span>}
                  {p.docsUrl && <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-mono text-amber-200">docs</span>}
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
