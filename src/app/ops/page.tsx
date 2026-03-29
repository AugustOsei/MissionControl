import { getCronMonitorRows, summarizeCronRows } from "@/lib/notion/crons";
import { getOpsEvents } from "@/lib/notion/opsEvents";
import { getSystemSummary } from "@/lib/system/summary";
import { getOpenClawOpsSnapshot } from "@/lib/openclaw/ops";

export const dynamic = "force-dynamic";

function shortDate(iso?: string) {
  if (!iso) return "—";
  // Works for both date-only and date-time.
  return iso.replace("T", " ").slice(0, 16);
}

export default async function OpsPage() {
  const ops = await getOpenClawOpsSnapshot();
  const sys = await getSystemSummary();

  const cronRows = await getCronMonitorRows().catch(() => []);
  const cronSummary = summarizeCronRows(cronRows);

  const opsEvents = await getOpsEvents(25).catch(() => []);

  const now = Date.now();
  const errorRows = cronRows.filter((r) => (r.lastStatus ?? "").toLowerCase() === "error");
  const missedRows = cronRows.filter((r) => {
    if (!r.nextRun) return false;
    const t = new Date(r.nextRun).getTime();
    return Number.isFinite(t) && t < now - 60_000; // >1 min in the past
  });
  const recentErrors = errorRows
    .slice()
    .sort((a, b) => (b.lastRun ?? "").localeCompare(a.lastRun ?? ""))
    .slice(0, 5);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Ops</h1>
        <p className="text-sm text-white/60">
          Raw truth: cron status + ops events. Updates as jobs run and when you refresh.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="card">
          <div className="cardTitle">Gateway</div>
          <div className="cardValue">{sys.gateway.ok ? "Online" : ops.gatewayStatus}</div>
          <div className="cardSub">{sys.gateway.url ?? ops.gatewayUrl ?? "(not configured)"}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Cron jobs</div>
          <div className="cardValue">{cronSummary.total}</div>
          <div className="cardSub">ok: {cronSummary.ok} · error: {cronSummary.error}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Alerts</div>
          <div className="cardValue">
            {errorRows.length > 0 ? `${errorRows.length} error` : "0"}
          </div>
          <div className="cardSub">missed: {missedRows.length}</div>
        </div>
        <div className="card">
          <div className="cardTitle">System</div>
          <div className="cardValue">{sys.skills.count} skills</div>
          <div className="cardSub">Notion: {sys.notion.ok ? "connected" : "missing key"}</div>
        </div>
      </div>

      {/* Executive system strip */}
      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
          <div>
            <div className="text-sm font-semibold">System</div>
            <div className="text-xs text-white/50">High-level health + inventory</div>
          </div>
          <div className="text-xs text-white/50">
            {sys.vercelCommit ? `deploy: ${sys.vercelCommit.slice(0, 7)}` : "deploy: —"}
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 px-4 py-4 md:grid-cols-3">
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Gateway</div>
            <div className="mt-1 text-sm font-semibold text-white/85">{sys.gateway.ok ? "Online" : "Offline"}</div>
            <div className="mt-1 text-[11px] font-mono text-white/35 truncate">{sys.gateway.url ?? "—"}</div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Notion</div>
            <div className="mt-1 text-sm font-semibold text-white/85">{sys.notion.ok ? "Connected" : "Missing key"}</div>
            <div className="mt-1 text-[11px] font-mono text-white/35">
              tasks:{sys.notion.configured.tasks ? "✓" : "—"} · projects:{sys.notion.configured.projects ? "✓" : "—"} · content:{sys.notion.configured.content ? "✓" : "—"} · cron:{sys.notion.configured.cron ? "✓" : "—"}
            </div>
          </div>

          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Ready skills</div>
            <div className="mt-1 text-sm font-semibold text-white/85">{sys.skills.count} ready</div>

            {sys.skills.sample.length ? (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {sys.skills.sample.map((s) => (
                  <span
                    key={s}
                    className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-white/70"
                  >
                    {s}
                  </span>
                ))}
              </div>
            ) : (
              <div className="mt-2 text-[11px] font-mono text-white/35">—</div>
            )}

            <div className="mt-2 text-[11px] font-mono text-white/35">
              Updates daily via “Skills snapshot” cron.
            </div>
          </div>
        </div>
      </div>

      {(errorRows.length > 0 || missedRows.length > 0) && (
        <div className="rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Alerts</div>
              <div className="text-xs text-white/50">Cron jobs needing attention</div>
            </div>
            <div className="text-xs text-white/50">errors: {errorRows.length} · missed: {missedRows.length}</div>
          </div>

          <div className="divide-y divide-white/10">
            {recentErrors.map((r) => (
              <div key={r.id} className="px-4 py-3">
                <div className="flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-white/85 truncate">{r.name}</div>
                    <div className="text-[11px] font-mono text-red-300">status: error</div>
                  </div>
                  <div className="text-[11px] font-mono text-white/40">last run: {shortDate(r.lastRun)}</div>
                </div>
              </div>
            ))}

            {recentErrors.length === 0 && (
              <div className="px-4 py-4 text-xs font-mono text-white/40">No recent error rows.</div>
            )}

            {missedRows.length > 0 && (
              <div className="px-4 py-3">
                <div className="text-xs font-mono text-amber-200">Missed next-run (nextRun is in the past):</div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {missedRows.slice(0, 8).map((r) => (
                    <span
                      key={r.id}
                      className="rounded-full border border-amber-500/30 bg-amber-500/10 px-2 py-1 text-[11px] font-mono text-amber-200"
                      title={`next: ${r.nextRun}`}
                    >
                      {r.name}
                    </span>
                  ))}
                  {missedRows.length > 8 && (
                    <span className="text-[11px] font-mono text-white/35">+{missedRows.length - 8} more</span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Cron Monitor</div>
              <div className="text-xs text-white/50">Notion-backed</div>
            </div>
            <div className="text-xs text-white/50">rows: {cronRows.length}</div>
          </div>

        <div className="overflow-auto">
          <table className="min-w-full text-sm">
            <thead className="text-left text-xs text-white/50">
              <tr>
                <th className="px-4 py-3 font-medium">Name</th>
                <th className="px-4 py-3 font-medium">Last Run</th>
                <th className="px-4 py-3 font-medium">Next Run</th>
                <th className="px-4 py-3 font-medium">Last Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {cronRows.map((r) => (
                <tr key={r.id} className="hover:bg-white/5">
                  <td className="px-4 py-3 text-white/85">{r.name}</td>
                  <td className="px-4 py-3 text-white/60">{shortDate(r.lastRun)}</td>
                  <td className="px-4 py-3 text-white/60">{shortDate(r.nextRun)}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        "rounded-full border px-2 py-1 text-xs " +
                        ((r.lastStatus ?? "").toLowerCase() === "ok"
                          ? "border-green-500/30 bg-green-500/10 text-green-200"
                          : (r.lastStatus ?? "").toLowerCase() === "error"
                            ? "border-red-500/30 bg-red-500/10 text-red-200"
                            : "border-white/10 bg-white/5 text-white/60")
                      }
                    >
                      {r.lastStatus ?? "—"}
                    </span>
                  </td>
                </tr>
              ))}

              {cronRows.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-xs text-white/40" colSpan={4}>
                    No rows found. (Check NOTION_CRON_DB + NOTION_API_KEY)
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-white/5">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <div className="text-sm font-semibold">Ops Events</div>
              <div className="text-xs text-white/50">Cron + Telegram excerpts (Notion-backed)</div>
            </div>
            <div className="text-xs text-white/50">rows: {opsEvents.length}</div>
          </div>

          <div className="divide-y divide-white/10">
            {opsEvents.slice(0, 20).map((e) => {
              const lvl = (e.level ?? "").toLowerCase();
              const badge =
                lvl === "error"
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : lvl === "ok"
                    ? "border-green-500/30 bg-green-500/10 text-green-200"
                    : lvl === "warn"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-white/10 bg-white/5 text-white/60";

              return (
                <div key={e.id} className="px-4 py-3 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm text-white/85 truncate">
                        {(e.source ?? "ops").toUpperCase()}: {e.jobName || e.name}
                      </div>
                      {e.message && (
                        <div className="mt-1 text-xs text-white/55 line-clamp-2">{e.message}</div>
                      )}
                      {e.link && (
                        <a
                          className="mt-1 inline-block text-xs font-mono text-blue-300/80 hover:text-blue-200"
                          href={e.link}
                          target="_blank"
                          rel="noreferrer"
                        >
                          link ↗
                        </a>
                      )}
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={"rounded-full border px-2 py-1 text-[11px] font-mono " + badge}>
                        {e.level ?? "—"}
                      </div>
                      <div className="mt-1 text-[11px] font-mono text-white/35">{shortDate(e.time)}</div>
                    </div>
                  </div>
                </div>
              );
            })}

            {opsEvents.length === 0 && (
              <div className="px-4 py-6 text-xs text-white/40">
                No ops events yet. (Set NOTION_OPS_EVENTS_DB in Vercel env vars, then start logging.)
              </div>
            )}
          </div>
        </div>
      </div>

      <pre className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/70 overflow-auto">
{JSON.stringify({ ops, cronSummary, opsEventsCount: opsEvents.length }, null, 2)}
      </pre>
    </div>
  );
}
