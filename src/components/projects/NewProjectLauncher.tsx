"use client";

import { useMemo, useState } from "react";

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

export function NewProjectLauncher() {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<{ id: string; url?: string } | null>(null);

  const [name, setName] = useState("");
  const [due, setDue] = useState("");
  const [quickSummary, setQuickSummary] = useState("");
  const [nextAction, setNextAction] = useState("");

  const canSubmit = useMemo(() => name.trim().length > 0 && !busy, [name, busy]);

  async function create() {
    setBusy(true);
    setErr(null);
    setOk(null);

    try {
      const res = await fetch("/api/projects/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          start: todayIso(),
          due: due || undefined,
          quickSummary: quickSummary.trim() || undefined,
          nextAction: nextAction.trim() || undefined,
        }),
      });

      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.error ?? `HTTP ${res.status}`);

      const id = String(body.id ?? "");
      setOk({ id, url: body.url });

      // Open the project drawer by URL param.
      if (id) window.location.href = `/projects?open=${encodeURIComponent(id)}`;
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/70 hover:bg-white/10"
      >
        New project
      </button>

      {open && (
        <div
          className="fixed inset-0 z-50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          <div className="absolute right-0 top-0 h-full w-full max-w-[620px] border-l border-white/12 bg-neutral-950 shadow-2xl shadow-black/60 flex flex-col">
            <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-4 border-b border-white/8">
              <div className="min-w-0">
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Projects</div>
                <h2 className="mt-1 text-base font-semibold text-white/95 leading-snug">New project</h2>
                <div className="mt-1 text-xs text-white/50">Creates a Notion project, then you can generate a plan.</div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="shrink-0 rounded-lg p-1.5 text-white/40 hover:bg-white/8 hover:text-white/70 transition-colors"
                aria-label="Close"
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M3 3 L13 13 M13 3 L3 13" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
              <div>
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Project name"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none"
                />
              </div>

              <div>
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Due (optional)</div>
                <input
                  value={due}
                  onChange={(e) => setDue(e.target.value)}
                  placeholder="YYYY-MM-DD"
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none font-mono"
                />
              </div>

              <div>
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Quick summary (optional)</div>
                <textarea
                  value={quickSummary}
                  onChange={(e) => setQuickSummary(e.target.value)}
                  placeholder="2–5 sentences: what is this project and what does done mean?"
                  className="mt-2 w-full min-h-[110px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none"
                />
              </div>

              <div>
                <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Next action (optional)</div>
                <textarea
                  value={nextAction}
                  onChange={(e) => setNextAction(e.target.value)}
                  placeholder="One concrete next step (<60 min)"
                  className="mt-2 w-full min-h-[80px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none"
                />
              </div>

              {err && <div className="text-xs font-mono text-red-300">{err}</div>}
              {ok && <div className="text-xs font-mono text-green-300">Created. Opening…</div>}

              <div className="flex items-center gap-2">
                <button
                  disabled={!canSubmit}
                  onClick={create}
                  className="rounded-lg bg-blue-600/80 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500/80 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  {busy ? "Creating…" : "Create project"}
                </button>
                <div className="flex-1" />
                <button
                  onClick={() => setOpen(false)}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white/70 hover:bg-white/10"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
