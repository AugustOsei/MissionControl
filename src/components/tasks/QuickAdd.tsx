"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const STATUSES = ["Backlog", "Todo", "Doing"];

export function QuickAdd() {
  const router = useRouter();
  const [title, setTitle] = useState("");
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
      body: JSON.stringify({ title: title.trim(), status }),
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
      <div className="flex gap-2">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={onKeyDown}
          placeholder="New task or idea… (Enter to save)"
          className="min-w-0 flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white placeholder:text-white/30 focus:border-blue-500/50 focus:outline-none focus:ring-1 focus:ring-blue-500/30"
        />
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
