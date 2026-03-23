"use client";

import { useEffect, useMemo, useState } from "react";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatUtc(d: Date) {
  return `${pad2(d.getUTCHours())}:${pad2(d.getUTCMinutes())}:${pad2(d.getUTCSeconds())} UTC`;
}

function formatLocal(d: Date) {
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function yearProgress(d: Date) {
  const y = d.getFullYear();
  const start = new Date(y, 0, 1, 0, 0, 0, 0).getTime();
  const end = new Date(y + 1, 0, 1, 0, 0, 0, 0).getTime();
  const t = d.getTime();
  const pct = Math.min(1, Math.max(0, (t - start) / (end - start)));
  const msLeft = end - t;
  return { pct, msLeft, year: y };
}

function formatDuration(ms: number) {
  const s = Math.max(0, Math.floor(ms / 1000));
  const days = Math.floor(s / 86400);
  const hrs = Math.floor((s % 86400) / 3600);
  const mins = Math.floor((s % 3600) / 60);
  const secs = s % 60;
  return `${days}d ${pad2(hrs)}:${pad2(mins)}:${pad2(secs)}`;
}

export function YearCountdown() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 250);
    return () => window.clearInterval(id);
  }, []);

  const prog = useMemo(() => yearProgress(now), [now]);
  const pctLabel = `${Math.round(prog.pct * 1000) / 10}%`;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <div className="text-sm font-semibold">T-minus</div>
          <div className="text-xs text-white/45 font-mono">end of year countdown</div>
        </div>
        <div className="text-[11px] font-mono text-white/35">{pctLabel}</div>
      </div>

      <div className="p-4 space-y-3">
        <div className="grid grid-cols-2 gap-2">
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest">Local</div>
            <div className="mt-0.5 text-lg font-semibold text-white/80 font-mono leading-tight">{formatLocal(now)}</div>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest">UTC</div>
            <div className="mt-0.5 text-lg font-semibold text-white/80 font-mono leading-tight">{formatUtc(now)}</div>
          </div>
        </div>

        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest">Year {prog.year}</div>
            <div className="text-[10px] font-mono text-white/35">{pctLabel}</div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-blue-400/70" style={{ width: `${Math.max(2, prog.pct * 100)}%` }} />
          </div>
          <div className="mt-2 text-sm font-mono text-white/70">T-minus {formatDuration(prog.msLeft)}</div>
        </div>
      </div>
    </div>
  );
}
