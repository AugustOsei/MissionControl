import { getGatewayHealth } from "@/lib/openclaw/health";
import { getLiveSessions } from "@/lib/openclaw/sessions";

export const dynamic = "force-dynamic";

export default async function AgentsPage() {
  const [gw, sessions] = await Promise.all([
    getGatewayHealth().catch(() => ({ ok: false, status: "offline", url: undefined })),
    getLiveSessions({ activeMinutes: 24 * 60, limit: 80 }).catch(() => []),
  ]);

  const activeNow = sessions.filter((s) => (s.ageLabel ?? "").includes("min") || (s.ageLabel ?? "").includes("just"));

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="text-sm text-white/60">Purely live view from the OpenClaw gateway (no Notion).</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="card">
          <div className="cardTitle">Gateway</div>
          <div className="cardValue">{gw.ok ? "Online" : "Offline"}</div>
          <div className="cardSub">{gw.url ?? "(not configured)"}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Sessions (24h)</div>
          <div className="cardValue">{sessions.length}</div>
          <div className="cardSub">recent session keys</div>
        </div>
        <div className="card">
          <div className="cardTitle">Active now</div>
          <div className="cardValue">{activeNow.length}</div>
          <div className="cardSub">rough heuristic</div>
        </div>
        <div className="card">
          <div className="cardTitle">Mode</div>
          <div className="cardValue">Live</div>
          <div className="cardSub">read-only</div>
        </div>
      </div>

      {!process.env.OPENCLAW_GATEWAY_URL && !process.env.OPENCLAW_GATEWAY_WS_URL && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
          <div className="text-sm font-semibold">Gateway URL not configured</div>
          <div className="mt-1 text-xs text-amber-100/80">
            Set <span className="font-mono">OPENCLAW_GATEWAY_URL</span> (or <span className="font-mono">OPENCLAW_GATEWAY_WS_URL</span>)
            in the Mission Control environment.
          </div>
        </div>
      )}

      {!process.env.OPENCLAW_GATEWAY_TOKEN && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-amber-100">
          <div className="text-sm font-semibold">Heads up: gateway token missing</div>
          <div className="mt-1 text-xs text-amber-100/80">
            If your gateway requires auth (it should), set <span className="font-mono">OPENCLAW_GATEWAY_TOKEN</span> in the Mission Control env.
          </div>
        </div>
      )}

      <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
          <div>
            <div className="text-sm font-semibold">Live sessions</div>
            <div className="text-xs text-white/50">sessions.list (gateway websocket)</div>
          </div>
          <div className="text-xs text-white/50">rows: {sessions.length}</div>
        </div>

        <div className="divide-y divide-white/10">
          {sessions.slice(0, 50).map((s) => (
            <div key={s.key} className="px-4 py-3 hover:bg-white/5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm text-white/85 truncate">{s.label || s.key}</div>
                  <div className="mt-1 text-[11px] font-mono text-white/40">
                    {s.kind ? `${s.kind} · ` : ""}{s.agentId ? `agent:${s.agentId} · ` : ""}{s.model ? s.model : ""}
                  </div>
                </div>
                <div className="shrink-0 text-right">
                  {s.ageLabel && <div className="text-[11px] font-mono text-white/35">{s.ageLabel}</div>}
                  {s.tokensLabel && <div className="text-[11px] font-mono text-white/35">{s.tokensLabel}</div>}
                </div>
              </div>
            </div>
          ))}

          {sessions.length === 0 && (
            <div className="px-4 py-8 text-center">
              <div className="text-sm text-white/35 font-mono">No sessions returned.</div>
              <div className="mt-2 text-xs text-white/40">
                If the gateway is online but this stays empty, it’s usually an origin allowlist issue. The gateway must allow Mission Control’s
                origin via <span className="font-mono">gateway.controlUi.allowedOrigins</span>.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
