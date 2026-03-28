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
      okCount: number;
      lastLink?: string;
      lastErrorTime?: string;
      lastOkTime?: string;
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
      okCount: 0,
    };

    g.count += 1;
    const lvl = (e.level ?? "").toLowerCase();
    if (lvl === "error") {
      g.errorCount += 1;
      if (!g.lastErrorTime || (e.time && Date.parse(e.time) > Date.parse(g.lastErrorTime))) {
        g.lastErrorTime = e.time;
      }
    }
    if (lvl === "warn") g.warnCount += 1;
    if (lvl === "ok") {
      g.okCount += 1;
      if (!g.lastOkTime || (e.time && Date.parse(e.time) > Date.parse(g.lastOkTime))) {
        g.lastOkTime = e.time;
      }
    }

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
  const latestDigest =
    recent.find((e) => (e.name ?? "").toLowerCase().includes("openclawd digest")) ?? null;

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Agents</h1>
        <p className="text-sm text-white/60">
          Daily recommendations (OpenClawd Digest) + a rolled-up view of recent automation runs. Updates when cron runs and when you refresh.
        </p>
      </div>

      {/* Recommendations first: this is the part you actually read. */}
      <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
        <div className="px-4 py-3 border-b border-white/10">
          <div className="text-sm font-semibold">OpenClawd Digest</div>
          <div className="text-xs text-white/50">Daily ~10:00 UTC · logged to Ops Events for this page</div>
        </div>
        <div className="p-4">
          {latestDigest?.message ? (
            <>
              <div className="text-[11px] font-mono text-white/35">Last updated: {shortDate(latestDigest.time)}</div>
              <pre className="mt-3 text-[12px] leading-5 font-mono text-white/75 whitespace-pre-wrap">{latestDigest.message}</pre>
            </>
          ) : (
            <div className="text-xs font-mono text-white/35">No digest logged yet.</div>
          )}
          <div className="mt-3 text-xs">
            <Link className="underline" href="/ops">See /ops</Link>
          </div>
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
              <div className="text-xs text-white/50">Grouped by job · last {windowHours}h · click /ops for raw</div>
            </div>
            <div className="text-xs text-white/50">{systems.length} systems</div>
          </div>

          <div className="divide-y divide-white/10">
            {systems.map((s) => {
              const lvl = (s.lastLevel ?? "").toLowerCase();
              const hasUnrecoveredError =
                Boolean(s.lastErrorTime) &&
                (!s.lastOkTime || Date.parse(s.lastOkTime) < Date.parse(s.lastErrorTime ?? "0"));
              const recovered = Boolean(s.lastErrorTime) && !hasUnrecoveredError;

              const badge = hasUnrecoveredError
                ? "border-red-500/30 bg-red-500/10 text-red-200"
                : recovered
                  ? "border-green-500/30 bg-green-500/10 text-green-200"
                  : s.warnCount > 0
                    ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                    : lvl === "ok"
                      ? "border-green-500/30 bg-green-500/10 text-green-200"
                      : "border-white/10 bg-white/5 text-white/60";

              const statusLabel = hasUnrecoveredError
                ? "error"
                : recovered
                  ? "recovered"
                  : s.warnCount > 0
                    ? "warn"
                    : (s.lastLevel ?? "info");

              return (
                <details key={s.jobName} className="px-4 py-3 hover:bg-white/5">
                  <summary className="cursor-pointer list-none">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-sm text-white/85 truncate">{s.jobName}</div>
                        <div className="mt-1 text-[11px] font-mono text-white/35">
                          last: {shortDate(s.lastTime)} · {s.errorCount} err · {s.warnCount} warn · {s.okCount} ok
                        </div>
                        {hasUnrecoveredError && s.lastErrorTime && (
                          <div className="mt-1 text-[11px] font-mono text-red-200/70">last err: {shortDate(s.lastErrorTime)}</div>
                        )}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={"rounded-full border px-2 py-1 text-[11px] font-mono " + badge}>
                          {statusLabel}
                        </div>
                      </div>
                    </div>
                  </summary>

                  <div className="mt-3 text-xs text-white/60">
                    {s.lastMessage ? <div className="text-white/70">{s.lastMessage}</div> : <div className="text-white/35 font-mono">No message.</div>}
                    <div className="mt-2 text-[11px] font-mono text-white/35">
                      {s.lastErrorTime ? `last err: ${shortDate(s.lastErrorTime)} · ` : ""}
                      {s.lastOkTime ? `last ok: ${shortDate(s.lastOkTime)} · ` : ""}
                      {s.count} events
                    </div>
                    <div className="mt-2 flex gap-3">
                      <Link className="underline" href="/ops">Open /ops</Link>
                      {s.lastLink && (
                        <a className="underline" href={s.lastLink} target="_blank" rel="noreferrer">
                          link ↗
                        </a>
                      )}
                    </div>
                  </div>
                </details>
              );
            })}

            {systems.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-white/35 font-mono">No recent systems yet.</div>
            )}
          </div>
        </div>

        <div className="lg:col-span-1 space-y-3">
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
            <div className="cardTitle">Latest error</div>
            <div className="cardValue">{latestError ? "Yes" : "None"}</div>
            <div className="cardSub">{latestError ? shortDate(latestError.time) : "—"}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
