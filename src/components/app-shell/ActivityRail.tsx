import { getActivityFeed } from "@/lib/activity/feed";

export async function ActivityRail() {
  const feed = await getActivityFeed();

  return (
    <aside className="sticky top-[64px] space-y-3">
      <div className="rounded-xl border border-white/10 bg-white/5 p-4">
        <div className="flex items-center justify-between">
          <div className="text-sm font-semibold">Live activity</div>
          <div className="text-xs text-white/50">polling</div>
        </div>
        <div className="mt-3 space-y-2">
          {feed.items.map((it) => (
            <div key={it.id} className="flex gap-2 rounded-lg border border-white/10 bg-black/30 p-2">
              <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full" style={{ background: it.color }} />
              <div className="min-w-0">
                <div className="truncate text-xs text-white/80">{it.title}</div>
                <div className="text-[11px] text-white/45">{it.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </aside>
  );
}
