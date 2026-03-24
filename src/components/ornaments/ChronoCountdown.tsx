"use client";

import { useEffect, useMemo, useState } from "react";

function pad(n: number, len = 2) {
  return String(n).padStart(len, "0");
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

function splitDuration(ms: number) {
  const totalMs = Math.max(0, ms);
  const totalSec = Math.floor(totalMs / 1000);

  const days = Math.floor(totalSec / 86400);
  const hrs = Math.floor((totalSec % 86400) / 3600);
  const mins = Math.floor((totalSec % 3600) / 60);
  const secs = totalSec % 60;

  // centiseconds (00-99)
  const cs = Math.floor((totalMs % 1000) / 10);

  return { days, hrs, mins, secs, cs };
}

function formatLocal(d: Date) {
  return `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

function formatUtc(d: Date) {
  return `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())} UTC`;
}

function Segment({ label, value, wide }: { label: string; value: string; wide?: boolean }) {
  return (
    <div className="flex flex-col items-center">
      <div
        className={
          "rounded-xl border border-white/10 bg-black/40 px-3 py-2 font-mono text-white/85 shadow-[0_0_24px_rgba(96,165,250,0.10)] " +
          (wide ? "text-3xl md:text-4xl" : "text-3xl md:text-4xl")
        }
        style={{ letterSpacing: "0.04em" }}
      >
        {value}
      </div>
      <div className="mt-1 text-[10px] font-mono text-white/35 uppercase tracking-widest">{label}</div>
    </div>
  );
}

export function ChronoCountdown() {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    // 10Hz update for centiseconds (smooth enough without melting CPUs)
    const id = window.setInterval(() => setNow(new Date()), 100);
    return () => window.clearInterval(id);
  }, []);

  const prog = useMemo(() => yearProgress(now), [now]);
  const dur = useMemo(() => splitDuration(prog.msLeft), [prog.msLeft]);

  const pctLabel = `${Math.round(prog.pct * 1000) / 10}%`;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <div className="text-sm font-semibold">T-minus</div>
          <div className="text-xs text-white/45 font-mono">end of year chronograph</div>
        </div>
        <div className="text-[11px] font-mono text-white/35">Year {prog.year} · {pctLabel}</div>
      </div>

      <div className="p-4 space-y-4">
        {/* main digits */}
        <div className="flex flex-wrap items-end justify-between gap-2">
          <Segment label="days" value={pad(dur.days, 3)} wide />
          <div className="pb-6 text-2xl font-mono text-white/20">:</div>
          <Segment label="hrs" value={pad(dur.hrs)} />
          <div className="pb-6 text-2xl font-mono text-white/20">:</div>
          <Segment label="min" value={pad(dur.mins)} />
          <div className="pb-6 text-2xl font-mono text-white/20">:</div>
          <Segment label="sec" value={pad(dur.secs)} />
          <div className="pb-6 text-2xl font-mono text-white/20">:</div>
          <Segment label="cs" value={pad(dur.cs)} />
        </div>

        {/* progress bar */}
        <div className="rounded-xl border border-white/10 bg-black/30 p-3">
          <div className="flex items-center justify-between">
            <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest">Year progress</div>
            <div className="text-[10px] font-mono text-white/35">{pctLabel}</div>
          </div>
          <div className="mt-2 h-2 w-full rounded-full bg-white/10 overflow-hidden">
            <div className="h-full rounded-full bg-blue-400/70" style={{ width: `${Math.max(2, prog.pct * 100)}%` }} />
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2">
            <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
              <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest">Local</div>
              <div className="mt-0.5 text-sm font-mono text-white/75">{formatLocal(now)}</div>
            </div>
            <div className="rounded-lg border border-white/10 bg-black/40 px-3 py-2">
              <div className="text-[10px] font-mono text-white/35 uppercase tracking-widest">UTC</div>
              <div className="mt-0.5 text-sm font-mono text-white/75">{formatUtc(now)}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
