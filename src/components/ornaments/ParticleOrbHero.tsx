"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type OrbMood = "ok" | "warn" | "error";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function palette(mood: OrbMood) {
  if (mood === "error") {
    return {
      a: new THREE.Color("#ef4444"),
      b: new THREE.Color("#f97316"),
      ring: new THREE.Color("#fb7185"),
      glow: "rgba(239,68,68,0.20)",
    };
  }
  if (mood === "warn") {
    return {
      a: new THREE.Color("#f59e0b"),
      b: new THREE.Color("#60a5fa"),
      ring: new THREE.Color("#fbbf24"),
      glow: "rgba(245,158,11,0.18)",
    };
  }
  return {
    a: new THREE.Color("#60a5fa"),
    b: new THREE.Color("#a78bfa"),
    ring: new THREE.Color("#22c55e"),
    glow: "rgba(96,165,250,0.20)",
  };
}

export function ParticleOrbHero({ mood = "ok" }: { mood?: OrbMood }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cfg = useMemo(
    () => ({
      count: 24000,
      radius: 1.15,
      ringCount: 2400,
      ringRadius: 1.62,
      pixelRatioCap: 1.6,
      parallax: 0.28,
    }),
    [],
  );

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !canvas) return;

    const reduced = prefersReducedMotion();

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, 1, 0.01, 50);
    camera.position.set(0, 0, 4.2);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: "high-performance",
    });

    const pal = palette(mood);

    function resize() {
      const rect = wrap!.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width));
      const h = Math.max(1, Math.floor(rect.height));
      const dpr = Math.min(cfg.pixelRatioCap, window.devicePixelRatio || 1);
      renderer.setPixelRatio(dpr);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
    }

    // Orb point cloud
    const orbGeo = new THREE.BufferGeometry();
    const orbPos = new Float32Array(cfg.count * 3);
    const orbCol = new Float32Array(cfg.count * 3);

    for (let i = 0; i < cfg.count; i++) {
      // random points on sphere
      const u = Math.random();
      const v = Math.random();
      const theta = 2 * Math.PI * u;
      const phi = Math.acos(2 * v - 1);
      const r = cfg.radius + (Math.random() - 0.5) * 0.06;

      const x = r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      orbPos[i * 3 + 0] = x;
      orbPos[i * 3 + 1] = y;
      orbPos[i * 3 + 2] = z;

      const t = (y / (cfg.radius * 2)) + 0.5;
      const c = pal.a.clone().lerp(pal.b, t);
      orbCol[i * 3 + 0] = c.r;
      orbCol[i * 3 + 1] = c.g;
      orbCol[i * 3 + 2] = c.b;
    }

    orbGeo.setAttribute("position", new THREE.BufferAttribute(orbPos, 3));
    orbGeo.setAttribute("color", new THREE.BufferAttribute(orbCol, 3));

    const orbMat = new THREE.PointsMaterial({
      size: 0.012,
      transparent: true,
      opacity: 0.85,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const orb = new THREE.Points(orbGeo, orbMat);
    scene.add(orb);

    // Orbit ring
    const ringGeo = new THREE.BufferGeometry();
    const ringPos = new Float32Array(cfg.ringCount * 3);
    for (let i = 0; i < cfg.ringCount; i++) {
      const t = (i / cfg.ringCount) * Math.PI * 2;
      const wobble = (Math.random() - 0.5) * 0.03;
      ringPos[i * 3 + 0] = Math.cos(t) * (cfg.ringRadius + wobble);
      ringPos[i * 3 + 1] = (Math.sin(t * 2) * 0.06) + wobble * 0.2;
      ringPos[i * 3 + 2] = Math.sin(t) * (cfg.ringRadius + wobble);
    }
    ringGeo.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));

    const ringMat = new THREE.PointsMaterial({
      size: 0.010,
      transparent: true,
      opacity: 0.7,
      color: pal.ring,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const ring = new THREE.Points(ringGeo, ringMat);
    ring.rotation.x = Math.PI * 0.52;
    ring.rotation.z = Math.PI * 0.12;
    scene.add(ring);

    // Second orbit ring (adds that "hero" motion)
    const ring2Geo = ringGeo.clone();
    const ring2Mat = new THREE.PointsMaterial({
      size: 0.009,
      transparent: true,
      opacity: 0.55,
      color: pal.b,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
    const ring2 = new THREE.Points(ring2Geo, ring2Mat);
    ring2.rotation.x = Math.PI * 0.18;
    ring2.rotation.y = Math.PI * 0.33;
    ring2.rotation.z = -Math.PI * 0.06;
    scene.add(ring2);

    // Light touch: a dim ambient so the GPU pipeline stays stable (materials are additive anyway)
    scene.add(new THREE.AmbientLight(0xffffff, 0.1));

    let raf = 0;
    let t = 0;

    const pointer = { x: 0, y: 0 };
    function onMove(e: PointerEvent) {
      const rect = wrap!.getBoundingClientRect();
      const nx = (e.clientX - rect.left) / rect.width;
      const ny = (e.clientY - rect.top) / rect.height;
      pointer.x = (nx - 0.5) * 2;
      pointer.y = (ny - 0.5) * 2;
    }
    function onLeave() {
      pointer.x = 0;
      pointer.y = 0;
    }
    wrap.addEventListener("pointermove", onMove);
    wrap.addEventListener("pointerleave", onLeave);

    function animate() {
      raf = requestAnimationFrame(animate);
      if (document.hidden) return;

      if (!reduced) {
        t += 0.0015;

        // "breath"
        const s = 1 + Math.sin(t * 1.5) * 0.012;
        orb.scale.setScalar(s);

        // base drift
        orb.rotation.y += 0.0011;
        orb.rotation.x = Math.sin(t * 1.2) * 0.05;

        ring.rotation.y -= 0.0015;
        ring2.rotation.y += 0.0012;
        ring2.rotation.x += 0.0004;

        // mouse parallax
        const tx = pointer.x * cfg.parallax;
        const ty = -pointer.y * cfg.parallax;
        orb.rotation.y += tx * 0.002;
        orb.rotation.x += ty * 0.002;
        ring.rotation.z += tx * 0.001;
        ring2.rotation.z -= tx * 0.001;
      }

      renderer.render(scene, camera);
    }

    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      wrap.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
      orbGeo.dispose();
      orbMat.dispose();
      ringGeo.dispose();
      ringMat.dispose();
      ring2Geo.dispose();
      ring2Mat.dispose();
      renderer.dispose();
      (renderer as any).forceContextLoss?.();
    };
  }, [cfg, mood]);

  const glow = palette(mood).glow;

  return (
    <div
      ref={wrapRef}
      className="relative h-[220px] md:h-[260px] rounded-2xl border border-white/10 overflow-hidden bg-black/40"
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            `radial-gradient(700px 220px at 20% 25%, ${glow}, transparent 60%), radial-gradient(700px 220px at 80% 10%, rgba(167,139,250,0.12), transparent 60%)`,
        }}
      />
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" />
      <div className="pointer-events-none absolute inset-0" style={{
        backgroundImage: "linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
        backgroundSize: "100% 18px",
        opacity: 0.20,
      }} />
    </div>
  );
}
