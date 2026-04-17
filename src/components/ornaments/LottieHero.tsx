"use client";

import { useEffect, useRef, useState } from "react";
import Lottie from "lottie-react";

// Gold matches the particle palette inside the animation.
const GLOW = "rgba(245,197,24,0.22)";

export function LottieHero() {
  const [data, setData] = useState<object | null>(null);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    fetch("/hero-animation.json", { cache: "force-cache" })
      .then((r) => r.json())
      .then((json) => {
        if (mountedRef.current) setData(json);
      })
      .catch(() => {});
    return () => {
      mountedRef.current = false;
    };
  }, []);

  return (
    <div className="relative h-[220px] md:h-[260px] rounded-2xl border border-white/10 overflow-hidden bg-black/40">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: `radial-gradient(700px 220px at 20% 25%, ${GLOW}, transparent 60%), radial-gradient(700px 220px at 80% 10%, rgba(167,139,250,0.12), transparent 60%)`,
        }}
      />
      <div className="absolute inset-0 flex items-center justify-center">
        {data ? (
          <Lottie
            animationData={data}
            loop
            autoplay
            rendererSettings={{ preserveAspectRatio: "xMidYMid meet" }}
            style={{ width: "100%", height: "100%" }}
          />
        ) : null}
      </div>
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "100% 18px",
          opacity: 0.2,
        }}
      />
    </div>
  );
}
