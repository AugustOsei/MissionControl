"use client";

import { useEffect, useMemo, useState } from "react";
import type { FlatProject } from "@/components/projects/ProjectExplorer";

type ProjectPatch = {
  pillar?: string | null;
  level?: string | null;
  parentId?: string | null;
  quickSummary?: string | null;
  nextAction?: string | null;
  appUrl?: string | null;
  repoUrl?: string | null;
  docsUrl?: string | null;
};

type RelatedTask = {
  id: string;
  title: string;
  status: string;
  updatedAtLabel?: string;
  priority?: string;
};

export function ProjectDrawer({
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

  const [quickSummary, setQuickSummary] = useState(project.quickSummary ?? "");
  const [nextAction, setNextAction] = useState(project.nextAction ?? "");
  const [appUrl, setAppUrl] = useState(project.appUrl ?? "");
  const [repoUrl, setRepoUrl] = useState(project.repoUrl ?? "");
  const [docsUrl, setDocsUrl] = useState(project.docsUrl ?? "");

  const [tasks, setTasks] = useState<RelatedTask[] | null>(null);
  const [tasksErr, setTasksErr] = useState<string | null>(null);

  const [planning, setPlanning] = useState(false);
  const [planOk, setPlanOk] = useState<string | null>(null);

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

  async function loadTasks() {
    setTasks(null);
    setTasksErr(null);
    const res = await fetch(`/api/projects/${project.id}/tasks`);
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setTasksErr(body.error ?? "Failed to load tasks");
      return;
    }
    const body = await res.json().catch(() => ({}));
    setTasks(body.tasks ?? []);
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await loadTasks();
      if (cancelled) return;
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project.id]);

  async function save() {
    setSaving(true);
    setError(null);
    setOk(false);

    const patch: ProjectPatch = {
      pillar: pillar || null,
      level: level || null,
      parentId: parentId || null,
      quickSummary: quickSummary || null,
      nextAction: nextAction || null,
      appUrl: appUrl || null,
      repoUrl: repoUrl || null,
      docsUrl: docsUrl || null,
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
      quickSummary: quickSummary || undefined,
      nextAction: nextAction || undefined,
      appUrl: appUrl || undefined,
      repoUrl: repoUrl || undefined,
      docsUrl: docsUrl || undefined,
    });
    setTimeout(() => setOk(false), 2000);
  }

  async function generatePlan() {
    setPlanning(true);
    setPlanOk(null);
    setError(null);

    try {
      const res = await fetch(`/api/projects/${project.id}/plan`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectName: project.name }),
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `HTTP ${res.status}`);
      }

      const body = await res.json().catch(() => ({}));
      setPlanOk(`Created ${body.createdCount ?? "some"} tasks`);
      await loadTasks();
    } catch (e: any) {
      setError(String(e?.message ?? e));
    } finally {
      setPlanning(false);
      setTimeout(() => setPlanOk(null), 2500);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="absolute right-0 top-0 h-full w-full max-w-[620px] border-l border-white/12 bg-neutral-950 shadow-2xl shadow-black/60 flex flex-col">
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/8">
          <div className="min-w-0">
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">{dbLabel}</div>
            <h2 className="mt-1 text-base font-semibold text-white/95 leading-snug truncate">{project.name}</h2>
            <div className="mt-1 text-xs text-white/50">
              {project.status ? `status: ${project.status}` : "status: —"}
              {project.due ? ` · due: ${project.due}` : ""}
              {project.stats ? ` · ${project.stats.pct}%` : ""}
            </div>
          </div>

          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white/70 transition-colors"
            aria-label="Close"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4 space-y-3">
            <div>
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Quick summary</div>
              <textarea
                value={quickSummary}
                onChange={(e) => setQuickSummary(e.target.value)}
                placeholder="What is this project? Why does it matter?"
                className="mt-2 w-full min-h-[90px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none"
              />
            </div>
            <div>
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Next action</div>
              <textarea
                value={nextAction}
                onChange={(e) => setNextAction(e.target.value)}
                placeholder="What’s the next concrete step?"
                className="mt-2 w-full min-h-[70px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
              <div>
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">App URL</div>
                <input
                  value={appUrl}
                  onChange={(e) => setAppUrl(e.target.value)}
                  placeholder="https://…"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none font-mono"
                />
              </div>
              <div>
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Repo URL</div>
                <input
                  value={repoUrl}
                  onChange={(e) => setRepoUrl(e.target.value)}
                  placeholder="https://github.com/…"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none font-mono"
                />
              </div>
              <div>
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Docs URL</div>
                <input
                  value={docsUrl}
                  onChange={(e) => setDocsUrl(e.target.value)}
                  placeholder="https://…"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none font-mono"
                />
              </div>
            </div>
          </div>

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
                  <option key={p} value={p} className="bg-neutral-900">{p}</option>
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
                  <option key={l} value={l} className="bg-neutral-900">{l}</option>
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
                  <option key={p.id} value={p.id} className="bg-neutral-900">{p.name}</option>
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
            <button
              onClick={generatePlan}
              disabled={planning}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/80 hover:border-white/20 hover:text-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
              title="Creates a starter task skeleton linked to this project"
            >
              {planning ? "Generating…" : "Generate plan"}
            </button>
            {ok && <div className="text-xs font-mono text-green-400">✓ Updated</div>}
            {planOk && <div className="text-xs font-mono text-green-300">✓ {planOk}</div>}
            {error && <div className="text-xs font-mono text-red-400">{error}</div>}
          </div>

          <div className="rounded-xl border border-white/10 bg-white/[0.03]">
            <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
              <div>
                <div className="text-sm font-semibold">Related tasks</div>
                <div className="text-xs text-white/50 font-mono">Notion relation: Project</div>
              </div>
              <div className="text-xs text-white/50 font-mono">{tasks ? `${tasks.length} tasks` : "loading"}</div>
            </div>

            {tasksErr && <div className="px-4 py-4 text-xs font-mono text-red-400">{tasksErr}</div>}

            {tasks && !tasksErr && (
              <div className="divide-y divide-white/10">
                {tasks.map((t) => (
                  <div key={t.id} className="px-4 py-3 hover:bg-white/5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm text-white/85">{t.title}</div>
                        <div className="mt-1 text-[11px] font-mono text-white/45">{t.status}{t.priority ? ` · ${t.priority}` : ""}</div>
                      </div>
                      <div className="text-[11px] font-mono text-white/35 shrink-0">{t.updatedAtLabel ?? ""}</div>
                    </div>
                  </div>
                ))}

                {tasks.length === 0 && (
                  <div className="px-4 py-6 text-xs font-mono text-white/35">No related tasks yet. Hit “Generate plan”.</div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
