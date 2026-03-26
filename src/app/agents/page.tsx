import { getOpsEvents } from "@/lib/notion/opsEvents";
import { getGatewayHealth } from "@/lib/openclaw/health";

export const dynamic = "force-dynamic";

function shortDate(iso?: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

export default async function AgentsPage() {
  const gw = await getGatewayHealth();
  const opsDbConfigured = Boolean(process.env.NOTION_OPS_EVENTS_DB);

  // We treat Ops Events (Source=agent) as the durable, secure way to show agent activity.
  // Live session listing from the Gateway can be added later once a stable JSON endpoint is exposed.
  const events = await getOpsEvents(120).catch(() => []);

  // For Mission Control "Agents" (v1), we treat Ops Events as the activity log.
  // This includes:
  // - Source=agent  → explicit agent/subagent milestones (start/finish/error)
  // - Source=cron   → scheduled job runs (useful "what happened recently")
  // Keeping both gives you the "other mission controls" feel without needing live session streaming.
  const agentEvents = events.filter((e) => (e.source ?? "").toLowerCase() === "agent");
  const cronEvents = events.filter((e) => (e.source ?? "").toLowerCase() === "cron");
  const recent = events.slice(0, 60);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="text-sm text-white/60">
          Read-only visibility into what the assistant/subagents are doing.
        </p>
      </div>

      {!opsDbConfigured && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
          <div className="text-sm font-semibold">Ops Events DB not configured</div>
          <div className="mt-1 text-xs text-amber-100/80">
            Set <span className="font-mono">NOTION_OPS_EVENTS_DB</span> in the Mission Control environment to enable the
            Agents activity feed.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="card">
          <div className="cardTitle">Gateway</div>
          <div className="cardValue">{gw.ok ? "Online" : "Offline"}</div>
          <div className="cardSub">{gw.url ?? "(not configured)"}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Ops Events</div>
          <div className="cardValue">{events.length}</div>
          <div className="cardSub">agent: {agentEvents.length} · cron: {cronEvents.length}</div>
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
            <div className="text-sm font-semibold">Recent activity</div>
            <div className="text-xs text-white/50">Ops Events (Notion) · source=agent + source=cron</div>
          </div>
          <div className="text-xs text-white/50">rows: {recent.length}</div>
        </div>

        <div className="divide-y divide-white/10">
          {recent.map((e) => {
            const lvl = (e.level ?? "").toLowerCase();
            const src = (e.source ?? "ops").toLowerCase();

            const badge =
              lvl === "error"
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : lvl === "ok"
                  ? "border-green-500/30 bg-green-500/10 text-green-200"
                  : lvl === "warn"
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                    : "border-white/10 bg-white/5 text-white/60";

            const srcBadge =
              src === "agent"
                ? "border-blue-500/30 bg-blue-500/10 text-blue-200"
                : src === "cron"
                  ? "border-purple-500/30 bg-purple-500/10 text-purple-200"
                  : "border-white/10 bg-white/5 text-white/60";

            return (
              <div key={e.id} className="px-4 py-3 hover:bg-white/5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={"rounded-full border px-2 py-0.5 text-[10px] font-mono uppercase " + srcBadge}>
                        {src}
                      </span>
                      <div className="text-sm text-white/85 truncate">{e.jobName || e.name}</div>
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

          {recent.length === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="text-sm text-white/35 font-mono">No Ops Events logged yet.</div>
              <div className="mt-2 text-xs text-white/40">
                Check Mission Control env vars: <span className="font-mono">NOTION_API_KEY</span> + <span className="font-mono">NOTION_OPS_EVENTS_DB</span>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
