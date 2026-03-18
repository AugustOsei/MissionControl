export function SpinningGlobe({ size = 44 }: { size?: number }) {
  const s = size;
  const c = s / 2;
  const r = s * 0.42;

  // Nerdy dotted “planet” using SVG circles + rotating group.
  // Cheap, crisp, and no canvas/WebGL needed.
  const dots = [] as Array<{ x: number; y: number; a: number }>;
  for (let i = 0; i < 42; i++) {
    const a = (i / 42) * Math.PI * 2;
    const y = c + Math.sin(a * 1.7) * (r * 0.72);
    const x = c + Math.cos(a) * (r * 0.92);
    dots.push({ x, y, a });
  }

  return (
    <div className="relative grid place-items-center">
      <div className="mc-glow" />
      <svg
        width={s}
        height={s}
        viewBox={`0 0 ${s} ${s}`}
        className="mc-globe"
        aria-hidden
      >
        <defs>
          <radialGradient id="mcPlanet" cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.55" />
            <stop offset="55%" stopColor="#22c55e" stopOpacity="0.16" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        <circle cx={c} cy={c} r={r} fill="url(#mcPlanet)" />
        <circle cx={c} cy={c} r={r} fill="none" stroke="rgba(255,255,255,0.16)" />

        <g className="mc-globeSpin">
          {dots.map((d, idx) => (
            <circle
              key={idx}
              cx={d.x}
              cy={d.y}
              r={1.2}
              fill={idx % 3 === 0 ? "#60a5fa" : "rgba(255,255,255,0.55)"}
              opacity={0.75}
            />
          ))}
          <ellipse
            cx={c}
            cy={c}
            rx={r * 0.95}
            ry={r * 0.45}
            fill="none"
            stroke="rgba(96,165,250,0.35)"
            strokeDasharray="3 6"
          />
        </g>
      </svg>
    </div>
  );
}
