export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/80 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 md:px-6">
        <div className="flex flex-1 items-center gap-3">
          <div className="hidden text-sm font-medium text-white/80 md:block">
            Control Center
          </div>
          <div className="flex-1">
            <input
              placeholder="Search (coming soon)…"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white/80 placeholder:text-white/30 outline-none focus:border-white/20"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/80 hover:bg-white/10">
            Pause
          </button>
          <div className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-xs text-white/70">
            Auggy
          </div>
        </div>
      </div>
    </header>
  );
}
