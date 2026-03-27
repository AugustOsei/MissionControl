"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { NewsItem } from "@/lib/notion/news";

function shortDate(iso?: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

function inWindow(iso: string | undefined, days: number) {
  if (!iso) return false;
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  return t >= Date.now() - days * 86400 * 1000;
}

function effectiveDate(x: NewsItem) {
  return x.submittedAt || x.createdAt;
}

export function NewsList({ items }: { items: NewsItem[] }) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState<NewsItem[]>(items);
  const [q, setQ] = useState("");
  const [windowDays, setWindowDays] = useState<7 | 30 | 3650>(7);
  const [tab, setTab] = useState<"new" | "approved" | "archived" | "all">("new");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();

    return localItems
      .filter((x) => {
        if (windowDays !== 3650 && !inWindow(effectiveDate(x), windowDays)) return false;
        if (needle && !x.title.toLowerCase().includes(needle)) return false;

        const st = (x.status ?? "").toLowerCase();
        const isArchived = st === "archive" || st === "abandoned";
        const isApproved = Boolean(x.approved) || st === "ready" || st === "scheduled" || st === "published";

        if (tab === "new" && (isArchived || isApproved)) return false;
        if (tab === "approved" && !isApproved) return false;
        if (tab === "archived" && !isArchived) return false;
        return true;
      })
      .slice(0, 200);
  }, [localItems, q, windowDays, tab]);

  async function patch(id: string, body: any) {
    setBusyId(id);
    setErr(null);
    try {
      const res = await fetch(`/api/news/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const b = await res.json().catch(() => ({}));
        throw new Error(b.error ?? `HTTP ${res.status}`);
      }

      // Optimistic local update so it feels instant.
      setLocalItems((prev) =>
        prev.map((x) => {
          if (x.id !== id) return x;
          const next = { ...x } as any;
          if (body.approved !== undefined) next.approved = Boolean(body.approved);
          if (body.status !== undefined) next.status = body.status;
          return next;
        }),
      );

      // Also refresh server data in the background.
      router.refresh();
    } catch (e: any) {
      setErr(String(e?.message ?? e));
    } finally {
      setBusyId(null);
    }
  }

  const counts = useMemo(() => {
    let newC = 0,
      appr = 0,
      arch = 0;
    for (const x of localItems) {
      const st = (x.status ?? "").toLowerCase();
      const isArchived = st === "archive" || st === "abandoned";
      const isApproved = Boolean(x.approved) || st === "ready" || st === "scheduled" || st === "published";
      if (isArchived) arch++;
      else if (isApproved) appr++;
      else newC++;
    }
    return { newC, appr, arch };
  }, [localItems]);

  return (
    <div className="space-y-3">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="text-sm text-white/70">
              Showing <span className="font-semibold text-white/80">{filtered.length}</span> items
              {err && <span className="ml-3 text-xs font-mono text-red-300">{err}</span>}
            </div>

            <div className="flex flex-wrap gap-2">
              {([
                ["new", `New (${counts.newC})`],
                ["approved", `Approved (${counts.appr})`],
                ["archived", `Archived (${counts.arch})`],
                ["all", "All"],
              ] as const).map(([k, label]) => (
                <button
                  key={k}
                  onClick={() => setTab(k)}
                  className={`rounded-full border px-3 py-1.5 text-xs font-mono transition-colors ${
                    tab === k
                      ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
                      : "border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white/80"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-end">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search headlines…"
              className="w-full md:w-[280px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-colors font-mono"
            />

            <select
              value={String(windowDays)}
              onChange={(e) => setWindowDays(Number(e.target.value) as any)}
              className="w-full md:w-[170px] rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 outline-none font-mono"
            >
              <option value="7" className="bg-neutral-900">
                last 7 days
              </option>
              <option value="30" className="bg-neutral-900">
                last 30 days
              </option>
              <option value="3650" className="bg-neutral-900">
                all (max)
              </option>
            </select>
          </div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
        <div className="grid grid-cols-12 gap-2 px-4 py-2 text-[11px] font-mono text-white/40 border-b border-white/10">
          <div className="col-span-3 md:col-span-2">when</div>
          <div className="col-span-9 md:col-span-7">headline</div>
          <div className="hidden md:block md:col-span-3">meta</div>
        </div>

        <div className="divide-y divide-white/10">
          {filtered.map((x) => (
            <div key={x.id} className="grid grid-cols-12 gap-2 px-4 py-3 hover:bg-white/5">
              <div className="col-span-3 md:col-span-2 text-[11px] font-mono text-white/35">
                {shortDate(effectiveDate(x))}
              </div>

              <div className="col-span-9 md:col-span-7 min-w-0">
                {x.url ? (
                  <a
                    href={x.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-white/85 hover:text-white underline decoration-white/10 hover:decoration-white/25 transition-colors line-clamp-2"
                  >
                    {x.title}
                  </a>
                ) : (
                  <div className="text-sm text-white/85 line-clamp-2">{x.title}</div>
                )}
                <div className="mt-1 text-[11px] font-mono text-white/45">
                  {(x.source ?? "source?")}{x.pillar ? ` · ${x.pillar}` : ""}
                </div>
              </div>

              <div className="hidden md:flex md:col-span-3 items-start justify-end gap-2 text-[11px] font-mono">
                <button
                  disabled={busyId === x.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    patch(x.id, { approved: true, status: "Ready" });
                  }}
                  className="rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-green-200 hover:bg-green-500/15 disabled:opacity-40"
                >
                  approve
                </button>
                <button
                  disabled={busyId === x.id}
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    patch(x.id, { status: "Archive" });
                  }}
                  className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/60 hover:border-white/20 hover:text-white/80 disabled:opacity-40"
                >
                  archive
                </button>

                {x.businessValue && (
                  <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-amber-200">
                    {x.businessValue}
                  </span>
                )}
                {x.status && (
                  <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/60">
                    {x.status}
                  </span>
                )}
              </div>
            </div>
          ))}

          {filtered.length === 0 && (
            <div className="px-4 py-10 text-center text-sm text-white/35 font-mono">
              No news items match.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
