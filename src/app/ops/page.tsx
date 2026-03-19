import { getCronMonitorRows, summarizeCronRows } from "@/lib/notion/crons";
import { getOpenClawOpsSnapshot } from "@/lib/openclaw/ops";

export const dynamic = "force-dynamic";

function shortDate(iso?: string) {
  if (!iso) return "—";
  // Works for both date-only and date-time.
  return iso.replace("T", " ").slice(0, 16);
}

export default async function OpsPage() {
  const ops = await getOpenClawOpsSnapshot();

  const cronRows = await getCronMonitorRows().catch(() => []);
  const cronSummary = summarizeCronRows(cronRows);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-xl font-semibold">Ops</h1>
        <p className="text-sm text-white/60">
          Ops snapshot (Gateway) + Cron Monitor (Notion).
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card">
          <div className="cardTitle">Gateway</div>
          <div className="cardValue">{ops.gatewayStatus}</div>
          <div className="cardSub">{ops.gatewayUrl ?? "(not configured)"}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Cron jobs</div>
          <div className="cardValue">{cronSummary.total}</div>
          <div className="cardSub">
            ok: {cronSummary.ok} · error: {cronSummary.error}
          </div>
        </div>
        <div className="card">
          <div className="cardTitle">Cost (week)</div>
          <div className="cardValue">{ops.costWeek}</div>
          <div className="cardSub">placeholder</div>
        </div>
      </div>

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

      <pre className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-white/70 overflow-auto">
{JSON.stringify({ ops, cronSummary }, null, 2)}
      </pre>
    </div>
  );
}
