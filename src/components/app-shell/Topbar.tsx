"use client";

import { useState } from "react";
// NOTE: HudClock is used in the top bar. Tasks page also has a larger YearCountdown card.
import { HudClock } from "@/components/ornaments/HudClock";

function Avatar() {
  const [imgError, setImgError] = useState(false);
  if (!imgError) {
    return (
      <img
        src="/avatar.jpg"
        alt="Avatar"
        onError={() => setImgError(true)}
        className="h-8 w-8 rounded-full object-cover border border-white/20"
      />
    );
  }
  return (
    <div className="h-8 w-8 rounded-full border border-blue-500/40 bg-blue-500/15 grid place-items-center text-xs font-semibold text-blue-400 font-mono">
      A
    </div>
  );
}

export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-neutral-950/85 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-2.5 md:px-6">
        <div className="flex flex-1 items-center gap-3">
          <div className="hidden text-xs font-mono text-white/40 md:block tracking-widest uppercase">
            Control Center
          </div>
          <div className="flex-1 max-w-sm">
            <input
              placeholder="Search (coming soon)…"
              className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-1.5 text-sm text-white/80 placeholder:text-white/25 outline-none focus:border-blue-500/40 focus:ring-1 focus:ring-blue-500/20 transition-colors font-mono"
            />
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <HudClock />
          <div className="hidden md:flex items-center gap-1.5 rounded-lg border border-green-500/25 bg-green-500/8 px-2.5 py-1">
            <span className="h-1.5 w-1.5 rounded-full bg-green-400 shadow-[0_0_6px_rgba(74,222,128,0.8)] animate-pulse" />
            <span className="text-[11px] font-mono text-green-400">live</span>
          </div>
          <Avatar />
          <div className="text-sm text-white/70 font-medium">Auggy</div>
        </div>
      </div>
    </header>
  );
}
