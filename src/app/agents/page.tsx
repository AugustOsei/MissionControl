import { getOpsEvents } from "@/lib/notion/opsEvents";
import { getGatewayHealth } from "@/lib/openclaw/health";

export const dynamic = "force-dynamic";

function shortDate(iso?: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

export default async function AgentsPage() {
  const gw = await getGatewayHealth();

  // We treat Ops Events (Source=agent) as the durable, secure way to show agent activity.
  // Live session listing from the Gateway can be added later once a stable JSON endpoint is exposed.
  const events = await getOpsEvents(80).catch(() => []);
  const agentEvents = events.filter((e) => (e.source ?? "").toLowerCase() === "agent");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="text-sm text-white/60">
          Read-only visibility into what the assistant/subagents are doing.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card">
          <div className="cardTitle">Gateway</div>
          <div className="cardValue">{gw.ok ? "Online" : "Offline"}</div>
          <div className="cardSub">{gw.url ?? "(not configured)"}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Agent events</div>
          <div className="cardValue">{agentEvents.length}</div>
          <div className="cardSub">from Ops Events (Notion)</div>
        </div>
        <div className="card">
          <div className="cardTitle">Mode</div>
          <div className="cardValue">Read-only</div>
          <div className="cardSub">Controls later (spawn/stop)</div>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <div className="text-sm font-semibold">Recent agent activity</div>
            <div className="text-xs text-white/50">Source=agent in Ops Events</div>
          </div>
          <div className="text-xs text-white/50">rows: {agentEvents.length}</div>
        </div>

        <div className="divide-y divide-white/10">
          {agentEvents.slice(0, 30).map((e) => {
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
                    <div className="text-sm text-white/85 truncate">{e.jobName || e.name}</div>
                    {e.message && (
                      <div className="mt-1 text-xs text-white/55 line-clamp-2">{e.message}</div>
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

          {agentEvents.length === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="text-sm text-white/35 font-mono">No agent events logged yet.</div>
              <div className="mt-2 text-xs text-white/40">
                Next step: when we spawn subagents / run long workflows, we’ll write Source=agent events
                into Ops Events so this page becomes a live activity console.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
