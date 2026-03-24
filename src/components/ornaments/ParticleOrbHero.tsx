"use client";

import { useEffect, useMemo, useRef } from "react";
import * as THREE from "three";

export type OrbMood = "ok" | "warn" | "error";

function prefersReducedMotion() {
  return typeof window !== "undefined" && window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function palette(mood: OrbMood) {
  // Pushed saturation/contrast for a more "hero" look.
  if (mood === "error") {
    return {
      a: new THREE.Color("#ff2d55"),
      b: new THREE.Color("#ff6a00"),
      ring: new THREE.Color("#ff4d6d"),
      glow: "rgba(255,45,85,0.26)",
    };
  }
  if (mood === "warn") {
    return {
      a: new THREE.Color("#ffb703"),
      b: new THREE.Color("#3b82f6"),
      ring: new THREE.Color("#ffd166"),
      glow: "rgba(255,183,3,0.22)",
    };
  }
  return {
    a: new THREE.Color("#2dd4ff"),
    b: new THREE.Color("#a855f7"),
    ring: new THREE.Color("#22c55e"),
    glow: "rgba(45,212,255,0.24)",
  };
}

export function ParticleOrbHero({ mood = "ok" }: { mood?: OrbMood }) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const cfg = useMemo(
    () => ({
      count: 26000,
      radius: 1.15,
      ringCount: 2800,
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
      size: 0.0125,
      transparent: true,
      opacity: 0.92,
      vertexColors: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });

    const orb = new THREE.Points(orbGeo, orbMat);
    scene.add(orb);

    // Orbit ring
    // Build a base ring geometry once, then reuse across multiple "banded" rings.
    const ringGeoBase = new THREE.BufferGeometry();
    const ringPos = new Float32Array(cfg.ringCount * 3);
    for (let i = 0; i < cfg.ringCount; i++) {
      const tt = (i / cfg.ringCount) * Math.PI * 2;
      const wobble = (Math.random() - 0.5) * 0.035;
      ringPos[i * 3 + 0] = Math.cos(tt) * (cfg.ringRadius + wobble);
      ringPos[i * 3 + 1] = (Math.sin(tt * 2) * 0.07) + wobble * 0.25;
      ringPos[i * 3 + 2] = Math.sin(tt) * (cfg.ringRadius + wobble);
    }
    ringGeoBase.setAttribute("position", new THREE.BufferAttribute(ringPos, 3));

    const rings: Array<{ geo: THREE.BufferGeometry; mat: THREE.PointsMaterial; pts: THREE.Points }> = [];

    function addRingBand({
      tiltX,
      tiltY,
      tiltZ,
      color,
      opacity,
      size,
      band = 3,
    }: {
      tiltX: number;
      tiltY: number;
      tiltZ: number;
      color: THREE.Color;
      opacity: number;
      size: number;
      band?: number;
    }) {
      // "band" = multiple close layers to fake thickness.
      for (let i = 0; i < band; i++) {
        const geo = ringGeoBase.clone();
        const mat = new THREE.PointsMaterial({
          size: size + i * 0.0015,
          transparent: true,
          opacity: opacity - i * 0.08,
          color,
          depthWrite: false,
          blending: THREE.AdditiveBlending,
        });
        const pts = new THREE.Points(geo, mat);
        pts.rotation.x = tiltX + i * 0.012;
        pts.rotation.y = tiltY + i * 0.010;
        pts.rotation.z = tiltZ - i * 0.008;
        scene.add(pts);
        rings.push({ geo, mat, pts });
      }
    }

    // Multiple thicker rings (closer to the reference video)
    // Thicker, more vivid bands (closer to the reference):
    addRingBand({ tiltX: Math.PI * 0.52, tiltY: 0, tiltZ: Math.PI * 0.12, color: pal.ring, opacity: 0.92, size: 0.017, band: 5 });
    addRingBand({ tiltX: Math.PI * 0.18, tiltY: Math.PI * 0.33, tiltZ: -Math.PI * 0.06, color: pal.b, opacity: 0.78, size: 0.016, band: 5 });
    addRingBand({ tiltX: Math.PI * 0.34, tiltY: -Math.PI * 0.22, tiltZ: Math.PI * 0.28, color: pal.a, opacity: 0.62, size: 0.014, band: 4 });
    addRingBand({ tiltX: Math.PI * 0.62, tiltY: Math.PI * 0.18, tiltZ: -Math.PI * 0.20, color: pal.b, opacity: 0.52, size: 0.013, band: 4 });

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

        // ring motion (gyroscope feel)
        for (let i = 0; i < rings.length; i++) {
          const r = rings[i].pts;
          const dir = i % 2 === 0 ? 1 : -1;
          r.rotation.y += dir * (0.0006 + i * 0.00008);
          r.rotation.x += dir * (0.00015 + i * 0.00002);
        }

        // mouse parallax
        const tx = pointer.x * cfg.parallax;
        const ty = -pointer.y * cfg.parallax;
        orb.rotation.y += tx * 0.002;
        orb.rotation.x += ty * 0.002;
        for (let i = 0; i < rings.length; i++) {
          const r = rings[i].pts;
          const dir = i % 2 === 0 ? 1 : -1;
          r.rotation.z += dir * tx * 0.001;
          r.rotation.x += dir * ty * 0.0005;
        }
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
      ringGeoBase.dispose();
      for (const r of rings) {
        r.geo.dispose();
        r.mat.dispose();
      }
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
