"use client";

import { useEffect, useState } from "react";
import type { Task } from "@/lib/notion/tasks";

const STATUSES = ["Backlog", "Todo", "Doing", "Done", "Archived"];

const STATUS_COLOR: Record<string, string> = {
  Backlog:  "text-slate-400 border-slate-500/40 bg-slate-500/10",
  Todo:     "text-blue-400  border-blue-500/40  bg-blue-500/10",
  Doing:    "text-amber-400 border-amber-500/40 bg-amber-500/10",
  Done:     "text-green-400 border-green-500/40 bg-green-500/10",
  Archived: "text-white/30  border-white/15     bg-white/5",
};

const PRIORITY_COLOR: Record<string, string> = {
  P0: "text-red-400 bg-red-500/15 border-red-500/30",
  P1: "text-orange-400 bg-orange-500/15 border-orange-500/30",
  P2: "text-yellow-400 bg-yellow-500/15 border-yellow-500/30",
  P3: "text-slate-400 bg-slate-500/15 border-slate-500/30",
};

type Props = {
  task: Task;
  projects: Array<{ id: string; name: string }>;
  onClose: () => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  onTaskPatched: (patch: Partial<Task>) => void;
};

export function TaskDetailModal({ task, projects, onClose, onStatusChange, onTaskPatched }: Props) {
  const [status, setStatus] = useState(task.status);
  const [projectId, setProjectId] = useState<string>(task.projectId ?? "");
  const [due, setDue] = useState<string>(task.due ? task.due.slice(0, 10) : "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  // Prevent body scroll while open
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  async function patchTask(patch: any) {
    setSaving(true);
    setError(null);

    const res = await fetch(`/api/tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });

    setSaving(false);

    if (!res.ok) {
      setError("Failed to update — check Notion connection");
      return false;
    }

    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    return true;
  }

  async function saveStatus(newStatus: string) {
    if (newStatus === task.status) return;
    const ok = await patchTask({ status: newStatus });
    if (!ok) {
      setStatus(task.status);
      return;
    }

    onStatusChange(task.id, newStatus);
    onTaskPatched({ status: newStatus });
  }

  const priorityClass = task.priority ? (PRIORITY_COLOR[task.priority] ?? PRIORITY_COLOR.Low) : null;
  const statusClass = STATUS_COLOR[status] ?? STATUS_COLOR.Backlog;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Modal */}
      <div className="relative w-full max-w-lg rounded-2xl border border-white/15 bg-neutral-950 shadow-2xl shadow-black/60 flex flex-col max-h-[85vh]">

        {/* Header */}
        <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/8">
          <h2 className="text-base font-semibold text-white/95 leading-snug flex-1">
            {task.title}
          </h2>
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white/70 transition-colors"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">

          {/* Status */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Status</div>
            <div className="flex flex-wrap gap-2">
              {STATUSES.map((s) => (
                <button
                  key={s}
                  disabled={saving}
                  onClick={() => { setStatus(s); saveStatus(s); }}
                  className={`rounded-full border px-3 py-1 text-xs font-mono transition-all ${
                    status === s
                      ? (STATUS_COLOR[s] ?? "text-white border-white/30 bg-white/10") + " ring-1 ring-current/30"
                      : "text-white/40 border-white/10 bg-transparent hover:border-white/25 hover:text-white/60"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
            {saving && <div className="text-[11px] text-white/35 font-mono">Saving to Notion…</div>}
            {saved  && <div className="text-[11px] text-green-400 font-mono">✓ Synced to Notion</div>}
            {error  && <div className="text-[11px] text-red-400 font-mono">{error}</div>}
          </div>

          {/* Project */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Project</div>
            <select
              value={projectId}
              disabled={saving}
              onChange={async (e) => {
                const next = e.target.value;
                setProjectId(next);
                const ok = await patchTask({ projectId: next || null });
                if (!ok) {
                  setProjectId(task.projectId ?? "");
                  return;
                }
                onTaskPatched({ projectId: next || undefined, projectName: next ? projects.find((p) => p.id === next)?.name : undefined });
              }}
              className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white/80 outline-none"
            >
              <option value="" className="bg-neutral-900">(none)</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id} className="bg-neutral-900">
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          {/* Due */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Due</div>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={due}
                disabled={saving}
                onChange={async (e) => {
                  const next = e.target.value;
                  setDue(next);
                  const ok = await patchTask({ due: next || null });
                  if (!ok) {
                    setDue(task.due ? task.due.slice(0, 10) : "");
                    return;
                  }
                  onTaskPatched({ due: next ? next : undefined });
                }}
                className="w-full rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white/80 outline-none"
              />
              <button
                type="button"
                disabled={saving || !due}
                onClick={async () => {
                  setDue("");
                  const ok = await patchTask({ due: null });
                  if (!ok) {
                    setDue(task.due ? task.due.slice(0, 10) : "");
                    return;
                  }
                  onTaskPatched({ due: undefined });
                }}
                className="shrink-0 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs font-mono text-white/60 hover:border-white/20 hover:text-white/80 disabled:opacity-40 disabled:hover:border-white/10"
              >
                clear
              </button>
            </div>
          </div>

          {/* Meta row */}
          <div className="flex flex-wrap gap-2">
            {priorityClass && (
              <span className={`rounded-full border px-2.5 py-1 text-[11px] font-mono ${priorityClass}`}>
                {task.priority}
              </span>
            )}
            {task.assignee && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-white/50">
                {task.assignee}
              </span>
            )}
            {task.projectName && (
              <span className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-mono text-white/50">
                {task.projectName}
              </span>
            )}
          </div>

          {/* Summary */}
          {task.summary ? (
            <div className="space-y-1.5">
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Notes</div>
              <div className="rounded-lg border border-white/8 bg-white/[0.03] p-3 text-sm text-white/75 leading-relaxed whitespace-pre-wrap">
                {task.summary}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-dashed border-white/8 p-3 text-xs text-white/25 font-mono text-center">
              No notes
            </div>
          )}

          {/* Footer meta */}
          <div className="flex items-center justify-between pt-1">
            <div className="text-[11px] font-mono text-white/25">
              Updated {task.updatedAtLabel}
            </div>
            <a
              href={`https://notion.so/${task.id.replace(/-/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-mono text-white/30 hover:text-white/55 transition-colors"
            >
              Open in Notion ↗
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
