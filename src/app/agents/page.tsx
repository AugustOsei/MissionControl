import Link from "next/link";

import { getOpsEvents } from "@/lib/notion/opsEvents";
import { getGatewayHealth } from "@/lib/openclaw/health";

export const dynamic = "force-dynamic";

function shortDate(iso?: string) {
  if (!iso) return "—";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso.slice(0, 16);
  return d.toISOString().replace("T", " ").slice(0, 16);
}

function withinHours(iso: string | undefined, hours: number): boolean {
  if (!iso) return false;
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return false;
  return ts >= Date.now() - hours * 60 * 60 * 1000;
}

export default async function AgentsPage() {
  const [gw, events] = await Promise.all([
    getGatewayHealth().catch(() => ({ ok: false, status: "offline", url: undefined })),
    getOpsEvents(250).catch(() => []),
  ]);

  const windowHours = 72;
  const recent = events.filter((e) => withinHours(e.time, windowHours));

  // Collapse noisy raw feed into "systems" by jobName.
  const groups = new Map<
    string,
    {
      jobName: string;
      lastTime?: string;
      lastLevel?: string;
      lastMessage?: string;
      count: number;
      errorCount: number;
      warnCount: number;
      lastLink?: string;
    }
  >();

  for (const e of recent) {
    const job = (e.jobName || e.name || "(unknown)").trim();
    if (!job) continue;

    // Skip obvious noise.
    const noise = job.toLowerCase().includes("heartbeat");
    if (noise) continue;

    const g = groups.get(job) ?? {
      jobName: job,
      count: 0,
      errorCount: 0,
      warnCount: 0,
    };

    g.count += 1;
    const lvl = (e.level ?? "").toLowerCase();
    if (lvl === "error") g.errorCount += 1;
    if (lvl === "warn") g.warnCount += 1;

    if (!g.lastTime || (e.time && Date.parse(e.time) > Date.parse(g.lastTime))) {
      g.lastTime = e.time;
      g.lastLevel = e.level;
      g.lastMessage = e.message;
      g.lastLink = e.link;
    }

    groups.set(job, g);
  }

  const systems = Array.from(groups.values())
    .sort((a, b) => Date.parse(b.lastTime ?? "0") - Date.parse(a.lastTime ?? "0"))
    .slice(0, 20);

  const latestError = recent.find((e) => (e.level ?? "").toLowerCase() === "error") ?? null;
  const latestDigest = recent.find((e) => (e.name ?? "").toLowerCase().includes("openclawd digest")) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="text-sm text-white/60">Curated runtime summary (last {windowHours}h) + recommendations.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="card">
          <div className="cardTitle">Gateway</div>
          <div className="cardValue">{gw.ok ? "Online" : "Offline"}</div>
          <div className="cardSub">{gw.url ?? "(not configured)"}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Ops events</div>
          <div className="cardValue">{recent.length}</div>
          <div className="cardSub">last {windowHours}h</div>
        </div>
        <div className="card">
          <div className="cardTitle">Systems</div>
          <div className="cardValue">{systems.length}</div>
          <div className="cardSub">grouped by job</div>
        </div>
        <div className="card">
          <div className="cardTitle">Latest error</div>
          <div className="cardValue">{latestError ? "Yes" : "None"}</div>
          <div className="cardSub">{latestError ? shortDate(latestError.time) : "—"}</div>
        </div>
      </div>

      {latestError && (
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-red-100">
          <div className="text-sm font-semibold">Latest error</div>
          <div className="mt-1 text-xs font-mono text-red-100/80">{latestError.jobName || latestError.name}</div>
          {latestError.message && <div className="mt-2 text-xs text-red-100/80">{latestError.message}</div>}
          <div className="mt-2 text-[11px] font-mono text-red-100/60">{shortDate(latestError.time)}</div>
          <div className="mt-2 text-xs">
            <Link className="underline" href="/ops">Open /ops</Link>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <div>
              <div className="text-sm font-semibold">Recent systems</div>
              <div className="text-xs text-white/50">Collapsed view · click through to /ops for raw</div>
            </div>
            <div className="text-xs text-white/50">rows: {systems.length}</div>
          </div>

          <div className="divide-y divide-white/10">
            {systems.map((s) => {
              const lvl = (s.lastLevel ?? "").toLowerCase();
              const badge =
                s.errorCount > 0
                  ? "border-red-500/30 bg-red-500/10 text-red-200"
                  : s.warnCount > 0
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                    : lvl === "ok"
                      ? "border-green-500/30 bg-green-500/10 text-green-200"
                      : "border-white/10 bg-white/5 text-white/60";

              return (
                <div key={s.jobName} className="px-4 py-3 hover:bg-white/5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="text-sm text-white/85 truncate">{s.jobName}</div>
                      {s.lastMessage && <div className="mt-1 text-xs text-white/55 line-clamp-2">{s.lastMessage}</div>}
                      <div className="mt-1 text-[11px] font-mono text-white/35">
                        {shortDate(s.lastTime)} · {s.count} events · {s.errorCount} err · {s.warnCount} warn
                      </div>
                    </div>
                    <div className="shrink-0 text-right">
                      <div className={"rounded-full border px-2 py-1 text-[11px] font-mono " + badge}>
                        {s.errorCount > 0 ? "error" : s.warnCount > 0 ? "warn" : (s.lastLevel ?? "info")}
                      </div>
                      {s.lastLink && (
                        <a
                          className="mt-2 inline-block text-[11px] font-mono text-blue-300/80 hover:text-blue-200"
                          href={s.lastLink}
                          target="_blank"
                          rel="noreferrer"
                        >
                          link ↗
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}

            {systems.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-white/35 font-mono">No recent systems yet.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-sm font-semibold">Recommendations</div>
            <div className="text-xs text-white/50">OpenClawd Digest (latest)</div>
          </div>
          <div className="p-4">
            {latestDigest?.message ? (
              <pre className="text-[11px] font-mono text-white/70 whitespace-pre-wrap">{latestDigest.message}</pre>
            ) : (
              <div className="text-xs font-mono text-white/35">No digest logged yet.</div>
            )}
            <div className="mt-3 text-xs">
              <Link className="underline" href="/ops">See /ops</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
