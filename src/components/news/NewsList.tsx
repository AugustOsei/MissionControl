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

function primaryUrl(x: NewsItem) {
  return x.wordpressUrl || x.canonicalUrl || x.sourceUrl || x.notionUrl;
}

export function NewsList({ items }: { items: NewsItem[] }) {
  const router = useRouter();
  const [localItems, setLocalItems] = useState<NewsItem[]>(items);
  const [q, setQ] = useState("");
  const [windowDays, setWindowDays] = useState<7 | 30 | 3650>(7);
  const [tab, setTab] = useState<"new" | "approved" | "archived" | "all">("new");
  const [busyId, setBusyId] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [wpDraft, setWpDraft] = useState<Record<string, string>>({});

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
          if (body.wordpressUrl !== undefined) next.wordpressUrl = body.wordpressUrl || undefined;
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
        <div className="grid grid-cols-12 gap-3 px-4 py-2 text-[11px] font-mono text-white/40 border-b border-white/10">
          <div className="col-span-2">when</div>
          <div className="col-span-7">headline</div>
          <div className="col-span-3 text-right">actions</div>
        </div>

        <div className="divide-y divide-white/10">
          {filtered.map((x) => {
            const url = primaryUrl(x);
            const isOpen = openId === x.id;
            const wp = x.wordpressUrl;

            return (
              <div key={x.id} className="hover:bg-white/5">
                <button
                  type="button"
                  onClick={() => setOpenId((cur) => (cur === x.id ? null : x.id))}
                  className="w-full grid grid-cols-12 gap-3 px-4 py-3 text-left"
                >
                  <div className="col-span-2 text-[11px] font-mono text-white/35">
                    {shortDate(effectiveDate(x))}
                  </div>

                  <div className="col-span-7 min-w-0">
                    <div className="text-sm text-white/85 line-clamp-2">{x.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono text-white/45">
                      <span>{(x.source ?? "source?")}{x.pillar ? ` · ${x.pillar}` : ""}</span>
                      {x.status && (
                        <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-white/60">
                          {x.status}
                        </span>
                      )}
                      {Boolean(x.approved) && (
                        <span className="rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-green-200">
                          approved
                        </span>
                      )}
                      {x.wordpressUrl && (
                        <span className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-purple-200">
                          wp linked
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="col-span-3 flex items-start justify-end gap-2 text-[11px] font-mono">
                    {wp && (
                      <a
                        href={wp}
                        target="_blank"
                        rel="noreferrer"
                        onClick={(e) => e.stopPropagation()}
                        className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-purple-200 hover:bg-purple-500/15"
                      >
                        wp
                      </a>
                    )}
                    {!Boolean(x.approved) && (
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
                    )}

                    {Boolean(x.approved) && !x.wordpressUrl && (
                      <button
                        disabled={busyId === x.id}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          setOpenId(x.id);
                        }}
                        className="rounded-full border border-purple-500/25 bg-purple-500/10 px-2 py-0.5 text-purple-200 hover:bg-purple-500/15 disabled:opacity-40"
                      >
                        add wp
                      </button>
                    )}
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
                  </div>
                </button>

                {isOpen && (
                  <div className="px-4 pb-4">
                    <div className="rounded-xl border border-white/10 bg-black/30 p-4">
                      <div className="flex flex-wrap gap-2 items-center">
                        {x.businessValue && (
                          <span className="rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[11px] font-mono text-amber-200">
                            {x.businessValue}
                          </span>
                        )}
                        {x.status && (
                          <span className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-white/60">
                            {x.status}
                          </span>
                        )}
                        {Boolean(x.approved) && (
                          <span className="rounded-full border border-green-500/25 bg-green-500/10 px-2 py-0.5 text-[11px] font-mono text-green-200">
                            approved
                          </span>
                        )}
                      </div>

                      {x.notes ? (
                        <div className="mt-3 space-y-2">
                        {x.draftGeneratedAt && (
                          <div className="rounded-lg border border-green-500/25 bg-green-500/10 p-3">
                            <div className="text-xs font-mono text-green-200">Draft ready</div>
                            <div className="mt-1 text-[11px] font-mono text-green-200/70">{shortDate(x.draftGeneratedAt)}</div>
                            <div className="mt-2 text-xs text-green-100/80">
                              The final draft is stored in the Notion page body.
                            </div>
                          </div>
                        )}

                        {x.notes ? (
                          <div className="text-sm text-white/75 whitespace-pre-wrap leading-relaxed">
                            {x.notes}
                          </div>
                        ) : (
                          <div className="text-xs font-mono text-white/35">
                            No notes yet. (We can auto-summarize into Notes later.)
                          </div>
                        )}
                      </div>
                      ) : (
                        <div className="mt-3 text-xs font-mono text-white/35">
                          No notes yet. (We can auto-summarize into Notes later.)
                        </div>
                      )}

                      <div className="mt-3 flex flex-col gap-3">
                        {/* Completion loop */}
                        <div className="rounded-lg border border-white/10 bg-black/40 p-3">
                          <div className="text-xs font-mono text-white/50">Completion loop</div>
                          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] font-mono">
                            <span className={"rounded-full border px-2 py-0.5 " + (!x.approved ? "border-blue-500/30 bg-blue-500/10 text-blue-200" : "border-white/10 bg-white/5 text-white/50")}>1) candidate</span>
                            <span className={"rounded-full border px-2 py-0.5 " + (x.approved && !x.wordpressUrl ? "border-blue-500/30 bg-blue-500/10 text-blue-200" : "border-white/10 bg-white/5 text-white/50")}>2) approved</span>
                            <span className={"rounded-full border px-2 py-0.5 " + (x.wordpressUrl ? "border-green-500/30 bg-green-500/10 text-green-200" : "border-white/10 bg-white/5 text-white/50")}>3) published</span>
                          </div>
                          <div className="mt-2 text-xs text-white/45">
                            Next: {!x.approved ? "Approve" : x.wordpressUrl ? "Done" : "Link the WordPress URL when posted"}
                          </div>
                        </div>

                        <div className="flex flex-wrap gap-2">
                        {x.canonicalUrl && (
                          <a
                            href={x.canonicalUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-200 hover:bg-blue-500/15"
                          >
                            open canonical ↗
                          </a>
                        )}
                        {!x.canonicalUrl && url && (
                          <a
                            href={url}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-blue-500/25 bg-blue-500/10 px-3 py-1 text-xs font-mono text-blue-200 hover:bg-blue-500/15"
                          >
                            open ↗
                          </a>
                        )}
                        {x.wordpressUrl && (
                          <a
                            href={x.wordpressUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="rounded-full border border-purple-500/25 bg-purple-500/10 px-3 py-1 text-xs font-mono text-purple-200 hover:bg-purple-500/15"
                          >
                            WordPress ↗
                          </a>
                        )}
                      </div>

                      <div className="mt-2 text-[11px] font-mono text-white/35">
                        Tip: link-post generation may populate a draft/notes, but WordPress URL is the canonical “it’s live” signal.
                      </div>

                      {/* WordPress URL linker */}
                      {Boolean(x.approved) && !x.wordpressUrl && (
                        <div className="mt-3 rounded-lg border border-purple-500/25 bg-purple-500/10 p-3">
                          <div className="text-xs font-mono text-purple-200">Link WordPress URL</div>
                          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-center">
                            <input
                              value={wpDraft[x.id] ?? ""}
                              onChange={(e) => setWpDraft((cur) => ({ ...cur, [x.id]: e.target.value }))}
                              placeholder="https://your-site.com/..."
                              className="w-full md:flex-1 rounded-lg border border-white/10 bg-black/40 px-3 py-2 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-purple-500/40 focus:ring-1 focus:ring-purple-500/20 transition-colors font-mono"
                            />
                            <button
                              disabled={busyId === x.id}
                              onClick={(e) => {
                                e.preventDefault();
                                const v = (wpDraft[x.id] ?? "").trim();
                                patch(x.id, { wordpressUrl: v || null, status: v ? "Published" : x.status });
                              }}
                              className="rounded-lg border border-purple-500/25 bg-purple-500/10 px-3 py-2 text-xs font-mono text-purple-200 hover:bg-purple-500/15 disabled:opacity-40"
                            >
                              save
                            </button>
                          </div>
                          <div className="mt-2 text-[11px] font-mono text-purple-100/70">
                            This moves the item to “Published” and lights up the WP link.
                          </div>
                        </div>
                      )}
                    </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}

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
