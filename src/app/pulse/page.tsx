import Link from "next/link";

import { getHNPulse, summarizeThemes } from "@/lib/pulse/hn";

export const dynamic = "force-dynamic";

function timeAgo(iso?: string): string {
  if (!iso) return "";
  const ts = Date.parse(iso);
  if (!Number.isFinite(ts)) return "";
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 48) return `${h}h ago`;
  const d = Math.floor(h / 24);
  return `${d}d ago`;
}

export default async function PulsePage() {
  const items = await getHNPulse({ hours: 72, perQuery: 25 }).catch(() => []);
  const themes = summarizeThemes(items);

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-xl font-semibold">Pulse</h1>
        <p className="text-sm text-white/60">Trending chatter scan (HN, last 72h). Updates on refresh / cache window.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="lg:col-span-1 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10">
            <div className="text-sm font-semibold">Top themes</div>
            <div className="text-xs text-white/50">What keeps popping up</div>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {themes.map((t) => (
              <span
                key={t.tag}
                className="rounded-full border border-white/10 bg-white/5 px-2 py-1 text-[11px] font-mono text-white/70"
              >
                {t.tag} · {t.count}
              </span>
            ))}
            {themes.length === 0 && <div className="text-xs font-mono text-white/35">No themes yet.</div>}
          </div>
        </div>

        <div className="lg:col-span-2 rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
          <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Must-read links</div>
              <div className="text-xs text-white/50">Ranked by heat (points + comments)</div>
            </div>
            <Link href="https://news.ycombinator.com/" target="_blank" className="text-xs font-mono text-white/40 hover:text-white/60">
              HN ↗
            </Link>
          </div>

          <div className="divide-y divide-white/10">
            {items.slice(0, 18).map((it) => (
              <a
                key={it.id}
                href={it.url}
                target="_blank"
                className="block px-4 py-3 hover:bg-white/5"
                rel="noreferrer"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="text-sm text-white/85 line-clamp-2">{it.title}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2 text-[11px] font-mono text-white/40">
                      <span>hn</span>
                      {it.points != null && <span>· {it.points} pts</span>}
                      {it.comments != null && <span>· {it.comments} c</span>}
                      {it.createdAt && <span>· {timeAgo(it.createdAt)}</span>}
                    </div>
                  </div>
                  <div className="shrink-0 flex flex-wrap gap-1 justify-end">
                    {it.tags.slice(0, 3).map((t) => (
                      <span
                        key={t}
                        className="rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[10px] font-mono text-white/60"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </a>
            ))}

            {items.length === 0 && (
              <div className="px-4 py-10 text-center text-sm text-white/35 font-mono">
                No pulse items yet (HN fetch failed or nothing matched).
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
