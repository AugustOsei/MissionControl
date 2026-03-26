import Link from "next/link";

import { ParticleOrbHero } from "@/components/ornaments/ParticleOrbHero";
import { getNewsFeed } from "@/lib/notion/news";
import { getOpsEvents } from "@/lib/notion/opsEvents";
import { getCronMonitorRows, summarizeCronRows } from "@/lib/notion/crons";
import { getTasksForBoard } from "@/lib/notion/tasks";
import { getGatewayHealth } from "@/lib/openclaw/health";

export const dynamic = "force-dynamic";

function shortDate(iso?: string) {
  if (!iso) return "—";
  return iso.replace("T", " ").slice(0, 16);
}

function badge(tone: string) {
  return `rounded-full border px-2 py-1 text-[11px] font-mono ${tone}`;
}

export default async function DashboardPage() {
  const [gw, cronRows, opsEvents, tasks, news] = await Promise.all([
    getGatewayHealth().catch(() => ({ ok: false, status: "offline", url: undefined })),
    getCronMonitorRows().catch(() => []),
    getOpsEvents(60).catch(() => []),
    getTasksForBoard().catch(() => []),
    getNewsFeed(30).catch(() => []),
  ]);

  const cronSummary = summarizeCronRows(cronRows);
  const cronErrors = cronRows.filter((r) => (r.lastStatus ?? "").toLowerCase() === "error");

  const mood = !gw.ok ? "error" : cronErrors.length > 0 ? "warn" : "ok";

  const doing = tasks.filter((t) => (t.status ?? "").toLowerCase() === "doing").slice(0, 6);
  const p0p1 = tasks
    .filter((t) => ["p0", "p1"].includes((t.priority ?? "").toLowerCase()))
    .slice(0, 6);

  const topNews = news.slice(0, 8);

  // Dashboard "Ops highlights" should be curated (avoid duplicating the raw Ops Events feed).
  const opsHighlights = opsEvents
    .filter((e) => {
      const lvl = (e.level ?? "").toLowerCase();
      const name = (e.name ?? "").toLowerCase();
      // Errors + warnings always. Also show explicit recoveries.
      return lvl === "error" || lvl === "warn" || name.includes("recovered");
    })
    .slice(0, 8);

  return (
    <div className="space-y-6">
      {/* HERO */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <ParticleOrbHero mood={mood} />
        </div>

        <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4 md:p-5">
        {/* glow gradient */}
        <div className="pointer-events-none absolute inset-0 opacity-70" style={{
          background:
            "radial-gradient(900px 250px at 10% 10%, rgba(96,165,250,0.18), transparent 55%), radial-gradient(700px 250px at 90% 0%, rgba(168,85,247,0.14), transparent 60%), radial-gradient(600px 280px at 50% 120%, rgba(34,197,94,0.10), transparent 55%)",
        }} />
        {/* scanline */}
        <div className="pointer-events-none absolute inset-0 opacity-40" style={{
          backgroundImage:
            "linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 14px",
        }} />
        {/* subtle noise */}
        <div className="pointer-events-none absolute inset-0 opacity-[0.04]" style={{
          backgroundImage:
            "url('data:image/svg+xml;utf8,<svg xmlns=\"http://www.w3.org/2000/svg\" width=\"120\" height=\"120\"><filter id=\"n\"><feTurbulence type=\"fractalNoise\" baseFrequency=\"0.9\" numOctaves=\"2\" stitchTiles=\"stitch\"/></filter><rect width=\"120\" height=\"120\" filter=\"url(%23n)\" opacity=\"0.35\"/></svg>')",
        }} />

        <div className="relative flex flex-col justify-between gap-4">
          <div>
            <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Welcome back, Augustine.</div>
            <h1 className="mt-1 text-2xl font-semibold text-white/90 leading-tight">Mission Control</h1>
            <p className="mt-2 text-sm text-white/60">
              Status: {mood === "error" ? "ALERT" : mood === "warn" ? "ATTENTION" : "NOMINAL"} · Ops + focus + intel — one cockpit.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span
                className={
                  "rounded-full border px-2 py-1 text-[11px] font-mono " +
                  (mood === "error"
                    ? "border-red-500/30 bg-red-500/10 text-red-200"
                    : mood === "warn"
                      ? "border-amber-500/30 bg-amber-500/10 text-amber-200"
                      : "border-green-500/30 bg-green-500/10 text-green-200")
                }
              >
                {mood === "error" ? "ALERT" : mood === "warn" ? "ATTENTION" : "NOMINAL"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-mono text-white/60">
                gateway: {gw.ok ? "online" : "offline"}
              </span>
              <span className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-mono text-white/60">
                cron errors: {cronErrors.length}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/tasks"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/70 hover:bg-white/10"
            >
              Tasks ↗
            </Link>
            <Link
              href="/ops"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/70 hover:bg-white/10"
            >
              Ops ↗
            </Link>
            <Link
              href="/news"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/70 hover:bg-white/10"
            >
              News ↗
            </Link>
            <Link
              href="/projects"
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-mono text-white/70 hover:bg-white/10"
            >
              Projects ↗
            </Link>
          </div>
        </div>
      </div>
    </div>

      {/* Executive strip */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="card">
          <div className="cardTitle">Gateway</div>
          <div className="cardValue">{gw.ok ? "Online" : "Offline"}</div>
          <div className="cardSub">{gw.url ?? "(not configured)"}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Cron</div>
          <div className="cardValue">{cronSummary.total}</div>
          <div className="cardSub">ok: {cronSummary.ok} · error: {cronSummary.error}</div>
        </div>
        <div className="card">
          <div className="cardTitle">Ops events</div>
          <div className="cardValue">{opsEvents.length}</div>
          <div className="cardSub">last 20</div>
        </div>
        <div className="card">
          <div className="cardTitle">News</div>
          <div className="cardValue">{news.length}</div>
          <div className="cardSub">last 30</div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        {/* Ops-first column */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <div className="text-sm font-semibold">Ops highlights</div>
                <div className="text-xs text-white/50">What just happened</div>
              </div>
              <Link href="/ops" className="text-xs font-mono text-white/40 hover:text-white/60">
                view ↗
              </Link>
            </div>
            <div className="divide-y divide-white/10">
              {opsHighlights.map((e) => {
                const lvl = (e.level ?? "").toLowerCase();
                const tone =
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
                        {e.message && <div className="mt-1 text-xs text-white/55 line-clamp-2">{e.message}</div>}
                      </div>
                      <div className="shrink-0 text-right">
                        <div className={badge(tone)}>{e.level ?? "—"}</div>
                        <div className="mt-1 text-[11px] font-mono text-white/35">{shortDate(e.time)}</div>
                      </div>
                    </div>
                  </div>
                );
              })}

              {opsHighlights.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-white/35 font-mono">
                  No highlights (no recent warn/error/recovery).
                </div>
              )}
            </div>
          </div>

          {cronErrors.length > 0 && (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4">
              <div className="text-sm font-semibold text-red-200">Cron errors</div>
              <div className="mt-2 space-y-1">
                {cronErrors.slice(0, 5).map((c) => (
                  <div key={c.id} className="text-xs font-mono text-red-200/80">
                    - {c.name}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Focus column */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-semibold">Focus</div>
                <div className="text-xs text-white/50">What to touch next</div>
              </div>
              <Link href="/tasks" className="text-xs font-mono text-white/40 hover:text-white/60">
                tasks ↗
              </Link>
            </div>

            <div className="mt-3">
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">Doing</div>
              <div className="mt-2 space-y-2">
                {doing.map((t) => (
                  <div key={t.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="text-sm text-white/80 truncate">{t.title}</div>
                    <div className="mt-1 text-[11px] font-mono text-white/40">
                      {t.status}{t.priority ? ` · ${t.priority}` : ""}
                    </div>
                  </div>
                ))}
                {doing.length === 0 && (
                  <div className="text-xs font-mono text-white/35">No Doing tasks (nice). Pick a P0/P1.</div>
                )}
              </div>
            </div>

            <div className="mt-4">
              <div className="text-[11px] font-mono text-white/40 uppercase tracking-widest">P0/P1</div>
              <div className="mt-2 space-y-2">
                {p0p1.map((t) => (
                  <div key={t.id} className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
                    <div className="text-sm text-white/80 truncate">{t.title}</div>
                    <div className="mt-1 text-[11px] font-mono text-white/40">{t.priority}</div>
                  </div>
                ))}
                {p0p1.length === 0 && (
                  <div className="text-xs font-mono text-white/35">No P0/P1 tasks tagged yet.</div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Intel column */}
        <div className="space-y-4">
          <div className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
              <div>
                <div className="text-sm font-semibold">Intel</div>
                <div className="text-xs text-white/50">Latest link logs</div>
              </div>
              <Link href="/news" className="text-xs font-mono text-white/40 hover:text-white/60">
                news ↗
              </Link>
            </div>
            <div className="divide-y divide-white/10">
              {topNews.map((x) => (
                <div key={x.id} className="px-4 py-3 hover:bg-white/5">
                  <div className="text-sm text-white/85 line-clamp-2">{x.title}</div>
                  <div className="mt-1 text-[11px] font-mono text-white/45">
                    {(x.source ?? "source?")}{x.pillar ? ` · ${x.pillar}` : ""}
                  </div>
                </div>
              ))}
              {topNews.length === 0 && (
                <div className="px-4 py-8 text-center text-sm text-white/35 font-mono">No news items.</div>
              )}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-4">
            <div className="text-sm font-semibold">Next moves</div>
            <div className="mt-2 text-sm text-white/65 leading-relaxed">
              <ul className="list-disc pl-5 space-y-1">
                <li>Approve 1–2 link posts in Notion (Status: Ready) to trigger draft generation.</li>
                <li>Keep an eye on Ops alerts; anything error should be triaged fast.</li>
                <li>Use Projects grid to keep links/docs centralized.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
