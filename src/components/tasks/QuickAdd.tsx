"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["Backlog", "Todo", "Doing"]; // work statuses

export function QuickAdd({ defaultMode }: { defaultMode?: "Task" | "Idea" } = {}) {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [mode, setMode] = useState<"Task" | "Idea">(defaultMode ?? "Task");
  const [status, setStatus] = useState("Todo");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [flash, setFlash] = useState(false);

  async function submit() {
    if (!title.trim()) return;
    setLoading(true);
    setError(null);

    const res = await fetch("/api/tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: title.trim(),
        status: mode === "Idea" ? "Backlog" : status,
        bucket: mode,
      }),
    });

    setLoading(false);

    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      setError(body.error ?? "Failed to create task");
      return;
    }

    setTitle("");
    setFlash(true);
    setTimeout(() => setFlash(false), 1500);
    router.refresh();
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") submit();
    if (e.key === "Escape") setTitle("");
  }

  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-3">
      <div className="mb-2 text-xs font-medium text-white/50 tracking-wide uppercase">
        Quick add
      </div>
      <div className="flex flex-col gap-2 md:flex-row md:items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder={mode === "Idea" ? "Drop an idea… (Enter to save)" : "New task… (Enter to save)"}
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
        />
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setMode("Task")}
            className={`rounded-lg border px-3 py-2 text-xs font-mono transition-colors ${
              mode === "Task"
                ? "border-blue-500/40 bg-blue-500/10 text-blue-200"
                : "border-white/10 bg-black/40 text-white/50 hover:border-white/20 hover:text-white/70"
            }`}
          >
            Task
          </button>
          <button
            type="button"
            onClick={() => setMode("Idea")}
            className={`rounded-lg border px-3 py-2 text-xs font-mono transition-colors ${
              mode === "Idea"
                ? "border-slate-400/40 bg-white/5 text-white/80"
                : "border-white/10 bg-black/40 text-white/50 hover:border-white/20 hover:text-white/70"
            }`}
          >
            Idea
          </button>
        </div>

        {mode === "Task" && (
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-2 text-sm text-white/70 focus:outline-none"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s} className="bg-neutral-900">
                {s}
              </option>
            ))}
          </select>
        )}
        <button
          onClick={submit}
          disabled={loading || !title.trim()}
          className="rounded-lg bg-blue-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
        >
          {loading ? "…" : flash ? "✓" : "Add"}
        </button>
      </div>
      {error && (
        <div className="mt-2 text-xs text-red-400">{error}</div>
      )}
    </div>
  );
}
