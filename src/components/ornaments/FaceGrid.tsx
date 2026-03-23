"use client";

import { useEffect, useMemo, useRef } from "react";

/**
 * A lightweight "face" made of dots that reacts to mouse movement.
 * Not photoreal — intentionally abstract / sci-fi HUD.
 */
export function FaceGrid({ height = 180 }: { height?: number }) {
  const ref = useRef<HTMLCanvasElement | null>(null);

  const cfg = useMemo(
    () => ({
      dot: 2.0,
      gap: 10,
      repelRadius: 80,
      repelStrength: 18,
    }),
    [],
  );

  useEffect(() => {
    const canvas = ref.current;
    if (!canvas) return;
    const c = canvas.getContext("2d");
    if (!c) return;
    const ctx: CanvasRenderingContext2D = c;

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const mouse = { x: -9999, y: -9999 };

    function resize() {
      const rect = canvas!.getBoundingClientRect();
      dpr = Math.max(1, Math.floor(window.devicePixelRatio || 1));
      w = Math.floor(rect.width);
      h = Math.floor(rect.height);
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function faceMask(x: number, y: number) {
      // Normalized coords in [-1..1]
      const nx = (x / w) * 2 - 1;
      const ny = (y / h) * 2 - 1;

      // Head ellipse
      const head = (nx * nx) / (0.8 * 0.8) + (ny * ny) / (0.95 * 0.95) <= 1;
      if (!head) return 0;

      // Eyes (holes)
      const le = ((nx + 0.28) ** 2) / (0.12 ** 2) + ((ny + 0.18) ** 2) / (0.08 ** 2) <= 1;
      const re = ((nx - 0.28) ** 2) / (0.12 ** 2) + ((ny + 0.18) ** 2) / (0.08 ** 2) <= 1;
      if (le || re) return 0.15;

      // Nose ridge
      const nose = Math.exp(-((nx * nx) / (0.08 ** 2) + ((ny - 0.02) ** 2) / (0.35 ** 2)));

      // Mouth arc (slightly brighter)
      const mouth = Math.exp(-(((nx) ** 2) / (0.25 ** 2) + ((ny - 0.45) ** 2) / (0.06 ** 2)));

      return 0.35 + 0.35 * nose + 0.35 * mouth;
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);

      // background wash
      ctx.fillStyle = "rgba(96,165,250,0.06)";
      ctx.fillRect(0, 0, w, h);

      for (let y = cfg.gap / 2; y < h; y += cfg.gap) {
        for (let x = cfg.gap / 2; x < w; x += cfg.gap) {
          const m = faceMask(x, y);
          if (m <= 0) continue;

          const dx = x - mouse.x;
          const dy = y - mouse.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          let ox = 0;
          let oy = 0;
          if (dist < cfg.repelRadius) {
            const t = 1 - dist / cfg.repelRadius;
            const s = cfg.repelStrength * t;
            ox = (dx / (dist + 0.001)) * s;
            oy = (dy / (dist + 0.001)) * s;
          }

          const alpha = Math.min(1, 0.12 + m * 0.75);
          ctx.fillStyle = `rgba(96,165,250,${alpha})`;
          ctx.beginPath();
          ctx.arc(x + ox, y + oy, cfg.dot, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // subtle scanline
      ctx.fillStyle = "rgba(255,255,255,0.03)";
      ctx.fillRect(0, Math.floor((Date.now() / 50) % h), w, 1);

      raf = requestAnimationFrame(draw);
    }

    function onMove(e: PointerEvent) {
      const rect = canvas!.getBoundingClientRect();
      mouse.x = e.clientX - rect.left;
      mouse.y = e.clientY - rect.top;
    }
    function onLeave() {
      mouse.x = -9999;
      mouse.y = -9999;
    }

    resize();
    draw();

    window.addEventListener("resize", resize);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [cfg]);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
        <div>
          <div className="text-sm font-semibold">Sentinel</div>
          <div className="text-xs text-white/45 font-mono">pointer-reactive face grid</div>
        </div>
        <div className="text-[11px] font-mono text-white/35">experimental</div>
      </div>
      <canvas ref={ref} style={{ width: "100%", height }} />
    </div>
  );
}
