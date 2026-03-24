"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname } from "next/navigation";

type ActivityItem = { id: string; title: string; time: string; color: string };
type HNStory = { id: number; title: string; url?: string; score: number; by: string; ago: string };

function timeNow() {
  return new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

export function ActivityRail() {
  const pathname = usePathname();

  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [hn, setHn] = useState<HNStory[]>([]);
  const [lastRefresh, setLastRefresh] = useState<string>("");
  const [loading, setLoading] = useState(true);

  const fetchActivity = useCallback(async () => {
    try {
      const res = await fetch("/api/activity");
      const data = await res.json();
      setActivity(data.items ?? []);
    } catch {}
  }, []);

  const fetchHN = useCallback(async () => {
    try {
      const res = await fetch("/api/hn");
      const data = await res.json();
      setHn(data.stories ?? []);
    } catch {}
  }, []);

  useEffect(() => {
    Promise.all([fetchActivity(), fetchHN()]).finally(() => {
      setLoading(false);
      setLastRefresh(timeNow());
    });

    const activityTimer = setInterval(() => {
      fetchActivity().then(() => setLastRefresh(timeNow()));
    }, 60_000);

    const hnTimer = setInterval(() => {
      fetchHN();
    }, 300_000);

    return () => {
      clearInterval(activityTimer);
      clearInterval(hnTimer);
    };
  }, [fetchActivity, fetchHN]);

  return (
    <aside className="sticky top-[56px] space-y-3 max-h-[calc(100vh-72px)] overflow-y-auto pr-0.5">
      {/* Notion Activity */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-white/80 uppercase tracking-widest font-mono">Notion Activity</div>
          <div className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] text-white/30 font-mono">{lastRefresh || "…"}</span>
          </div>
        </div>

        {loading ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-10 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : activity.length === 0 ? (
          <div className="text-xs text-white/30 font-mono text-center py-3">no activity</div>
        ) : (
          <div className="space-y-1.5">
            {activity.slice(0, 8).map((it) => (
              <div key={it.id} className="flex gap-2 rounded-lg border border-white/8 bg-black/25 p-2 hover:border-white/15 transition-colors">
                <div className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full" style={{ background: it.color }} />
                <div className="min-w-0">
                  <div className="truncate text-xs text-white/75">{it.title}</div>
                  <div className="text-[10px] text-white/35 font-mono mt-0.5">{it.time}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Tech Pulse (HN) */}
      <div className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-xs font-semibold text-white/80 uppercase tracking-widest font-mono">Tech Pulse</div>
          <div className="text-[10px] text-white/25 font-mono">HN · 5m</div>
        </div>

        {hn.length === 0 ? (
          <div className="space-y-2">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-12 rounded-lg bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-1.5">
            {hn.map((story) => (
              <a
                key={story.id}
                href={story.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-lg border border-white/8 bg-black/25 p-2 hover:border-white/20 hover:bg-white/5 transition-all group"
              >
                <div className="text-xs text-white/75 leading-snug line-clamp-2 group-hover:text-white/90 transition-colors">
                  {story.title}
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-[10px] text-orange-400/70 font-mono">▲ {story.score}</span>
                  <span className="text-[10px] text-white/25 font-mono">{story.ago}</span>
                </div>
              </a>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
