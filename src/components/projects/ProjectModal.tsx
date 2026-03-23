"use client";

import { useEffect, useMemo, useState } from "react";
import type { FlatProject } from "@/components/projects/ProjectExplorer";

type ProjectPatch = {
  pillar?: string | null;
  level?: string | null;
  parentId?: string | null;
};

type RelatedTask = {
  id: string;
  title: string;
  status: string;
  updatedAtLabel?: string;
  priority?: string;
};

export function ProjectModal({
  project,
  dbLabel,
  projects,
  pillarOptions,
  levelOptions,
  onClose,
  onProjectPatched,
}: {
  project: FlatProject;
  dbLabel: string;
  projects: FlatProject[];
  pillarOptions: string[];
  levelOptions: string[];
  onClose: () => void;
  onProjectPatched: (next: FlatProject) => void;
}) {
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState(false);

  const [pillar, setPillar] = useState(project.pillar ?? "");
  const [level, setLevel] = useState(project.level ?? "");
  const [parentId, setParentId] = useState(project.parentId ?? "");

  const [tasks, setTasks] = useState<RelatedTask[] | null>(null);
  const [tasksErr, setTasksErr] = useState<string | null>(null);

  const parentOptions = useMemo(() => {
    return projects
      .filter((p) => p.id !== project.id)
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [projects, project.id]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setTasks(null);
      setTasksErr(null);
      const res = await fetch(`/api/projects/${project.id}/tasks`, {
        method: "GET",
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        if (!cancelled) setTasksErr(body.error ?? "Failed to load tasks");
        return;
      }
      const body = await res.json();
      if (!cancelled) setTasks(body.tasks ?? []);
    }
    load();
    return () => {
      cancelled = true;
    };
  }, [project.id]);

  async function save() {
    setSaving(true);
    setError(null);
    setOk(false);

    const patch: ProjectPatch = {
      pillar: pillar || null,
      level: level || null,
      parentId: parentId || null,
    };

    const res = await fetch(`/api/projects/${project.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    setSaving(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to update project");
      return;
    }

    setOk(true);
    onProjectPatched({
      ...project,
      pillar: pillar || undefined,
      level: level || undefined,
      parentId: parentId || undefined,
    });
    setTimeout(() => setOk(false), 2000);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-3xl rounded-2xl border border-white/15 bg-neutral-950 shadow-2xl shadow-black/60 flex flex-col max-h-[85vh]">
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/8">
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">
              {dbLabel}
            </div>
            <h2 className="mt-1 text-base font-semibold text-white/95 leading-snug truncate">
              {project.name}
            </h2>
            <div className="mt-1 text-xs font-mono text-white/35 truncate">
              id: {project.id}
            </div>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white/70 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M3 3 L13 13 M13 3 L3 13"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          {/* Summary card */}
          {(project.quickSummary || project.appUrl || project.repoUrl || project.docsUrl) && (
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Summary</div>
                  {project.quickSummary ? (
                    <div className="mt-2 text-sm text-white/70 leading-relaxed whitespace-pre-wrap">
                      {project.quickSummary}
                    </div>
                  ) : (
                    <div className="mt-2 text-xs font-mono text-white/35">No summary yet (fill Quick Summary in Notion).</div>
                  )}
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                {project.appUrl && (
                  <a
                    href={project.appUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-blue-500/30 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-200 hover:bg-blue-500/15"
                  >
                    Open app ↗
                  </a>
                )}
                {project.repoUrl && (
                  <a
                    href={project.repoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-mono text-purple-200 hover:bg-purple-500/15"
                  >
                    Repo ↗
                  </a>
                )}
                {project.docsUrl && (
                  <a
                    href={project.docsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-mono text-amber-200 hover:bg-amber-500/15"
                  >
                    Docs ↗
                  </a>
                )}
              </div>
            </div>
          )}

          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Pillar</div>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white/80 outline-none"
              >
                <option value="" className="bg-neutral-900">(none)</option>
                {pillarOptions.map((p) => (
                  <option key={p} value={p} className="bg-neutral-900">
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Level</div>
              <select
                value={level}
                onChange={(e) => setLevel(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white/80 outline-none"
              >
                <option value="" className="bg-neutral-900">(none)</option>
                {levelOptions.map((l) => (
                  <option key={l} value={l} className="bg-neutral-900">
                    {l}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.03] p-3">
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Parent</div>
              <select
                value={parentId}
                onChange={(e) => setParentId(e.target.value)}
                className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white/80 outline-none"
              >
                <option value="" className="bg-neutral-900">(none)</option>
                {parentOptions.map((p) => (
                  <option key={p.id} value={p.id} className="bg-neutral-900">
                    {p.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={save}
              disabled={saving}
              className="rounded-lg bg-blue-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              {saving ? "Saving…" : "Save"}
            </button>
            {ok && <div className="text-xs font-mono text-green-400">✓ Updated</div>}
            {error && <div className="text-xs font-mono text-red-400">{error}</div>}
            <div className="flex-1" />
            <div className="flex items-center gap-2">
              <a
                href={project.url ?? `https://notion.so/${project.id.replace(/-/g, "")}`}
                target="_blank"
                rel="noreferrer"
                className="text-xs font-mono text-white/35 hover:text-white/60"
              >
                Notion ↗
              </a>
              {project.appUrl && (
                <a
                  href={project.appUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-blue-300/80 hover:text-blue-200"
                >
                  App ↗
                </a>
              )}
              {project.repoUrl && (
                <a
                  href={project.repoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-purple-300/80 hover:text-purple-200"
                >
                  Repo ↗
                </a>
              )}
              {project.docsUrl && (
                <a
                  href={project.docsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-mono text-amber-200/80 hover:text-amber-100"
                >
                  Docs ↗
                </a>
              )}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Related tasks</div>
                <div className="text-xs text-white/50 font-mono">Tasks linked via relation: Project</div>
              </div>
              <div className="text-xs text-white/50 font-mono">
                {tasks ? `${tasks.length} tasks` : "loading"}
              </div>
            </div>

            {/* KPI strip */}
            <div className="px-4 py-3 border-b border-white/8">
              {tasks ? (
                <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                  {(() => {
                    const total = tasks.length;
                    const done = tasks.filter((t) => (t.status ?? "").toLowerCase() === "done").length;
                    const doing = tasks.filter((t) => (t.status ?? "").toLowerCase() === "doing").length;
                    const todo = tasks.filter((t) => (t.status ?? "").toLowerCase() === "todo").length;
                    const backlog = tasks.filter((t) => (t.status ?? "").toLowerCase() === "backlog").length;
                    const p0p1 = tasks.filter((t) => ["p0", "p1"].includes((t.priority ?? "").toLowerCase())).length;
                    return [
                      { k: "Total", v: String(total), tone: "text-white/80" },
                      { k: "Doing", v: String(doing), tone: "text-blue-300" },
                      { k: "Done", v: String(done), tone: "text-green-300" },
                      { k: "P0/P1", v: String(p0p1), tone: "text-amber-300" },
                      { k: "Todo", v: String(todo), tone: "text-white/70" },
                      { k: "Backlog", v: String(backlog), tone: "text-white/55" },
                      { k: "Open", v: String(Math.max(0, total - done)), tone: "text-white/80" },
                      { k: "Progress", v: total ? `${Math.round((done / total) * 100)}%` : "—", tone: "text-white/70" },
                    ];
                  })().slice(0, 4).map((x) => (
                    <div key={x.k} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
                      <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest">{x.k}</div>
                      <div className={`mt-0.5 text-sm font-semibold ${x.tone}`}>{x.v}</div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-xs font-mono text-white/35">Loading KPIs…</div>
              )}
            </div>

            {tasksErr && (
              <div className="px-4 py-4 text-xs font-mono text-red-400">{tasksErr}</div>
            )}

            {tasks && !tasksErr && (
              <div className="divide-y divide-white/10">
                {tasks.map((t) => (
                  <div key={t.id} className="px-4 py-3 hover:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm text-white/85">{t.title}</div>
                        <div className="mt-1 text-[11px] font-mono text-white/45">
                          {t.status}{t.priority ? ` · ${t.priority}` : ""}
                        </div>
                      </div>
                      <div className="text-[11px] font-mono text-white/35 shrink-0">
                        {t.updatedAtLabel ?? ""}
                      </div>
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="px-4 py-6 text-xs font-mono text-white/35">
                    No related tasks.
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
