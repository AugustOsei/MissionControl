export function OpenClawLogo({ size = 40 }: { size?: number }) {
  const s = size;
  return (
    <div className="relative grid place-items-center" style={{ width: s, height: s }}>
      <div
        style={{
          position: "absolute",
          width: s,
          height: s,
          borderRadius: "9999px",
          background: "radial-gradient(circle, rgba(96,165,250,0.22), transparent 65%)",
          filter: "blur(4px)",
          animation: "mcPulse 2.8s ease-in-out infinite",
        }}
      />
      <svg width={s} height={s} viewBox="0 0 40 40" aria-hidden fill="none">
        {/* Claw base grip */}
        <ellipse cx="20" cy="15" rx="7" ry="4.5" fill="rgba(96,165,250,0.18)" stroke="rgba(96,165,250,0.5)" strokeWidth="1.2" />
        {/* Left talon */}
        <path
          d="M14 17 C11 21 8 26 9.5 32 C10 34 12 35 13 33 C14 31 13 27 15 22"
          stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none"
        />
        {/* Center talon */}
        <path
          d="M20 19 C20 24 19 29 20 35 C20.4 37 22 37.5 23 36 C24 34.5 23 29 22 24"
          stroke="#93c5fd" strokeWidth="2.2" strokeLinecap="round" fill="none"
        />
        {/* Right talon */}
        <path
          d="M26 17 C29 21 32 26 30.5 32 C30 34 28 35 27 33 C26 31 27 27 25 22"
          stroke="#60a5fa" strokeWidth="2" strokeLinecap="round" fill="none"
        />
        {/* Knuckle dots */}
        <circle cx="14.5" cy="19" r="1.5" fill="#60a5fa" opacity="0.7" />
        <circle cx="20.5" cy="21" r="1.8" fill="#93c5fd" opacity="0.8" />
        <circle cx="26.5" cy="19" r="1.5" fill="#60a5fa" opacity="0.7" />
      </svg>
    </div>
  );
}
