// Generates public/hero-animation.json
//
// Particles form "AUGUST" (gold), scatter, then reform into "WHEEL" where
// the two "E" letters are rendered as spinning mechanical gears made of
// particles. Gold = #F5C518; secondary = white; transparent background.

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUT = resolve(__dirname, "..", "public", "hero-animation.json");

// ----- Canvas / timing ------------------------------------------------------
const W = 1200;
const H = 400;
const FPS = 60;

// Phase boundaries (in frames). Loops cleanly at op.
const F = {
  augustForm: [0, 45],      // scatter -> AUGUST
  augustHold: [45, 150],
  scatter1: [150, 220],     // AUGUST -> chaos
  wheelForm: [220, 300],    // chaos -> WHEEL (gears start at rest)
  wheelHold: [300, 510],    // WHEEL holds; gears spin
  scatter2: [510, 570],     // WHEEL -> chaos
  loopBack: [570, 600],     // chaos -> AUGUST start pose
};
const OP = 600;

// ----- Letter bitmaps (5w x 7h) --------------------------------------------
const LETTERS = {
  A: ["01110", "10001", "10001", "11111", "10001", "10001", "10001"],
  U: ["10001", "10001", "10001", "10001", "10001", "10001", "01110"],
  G: ["01111", "10000", "10000", "10011", "10001", "10001", "01111"],
  S: ["01111", "10000", "10000", "01110", "00001", "00001", "11110"],
  T: ["11111", "00100", "00100", "00100", "00100", "00100", "00100"],
  W: ["10001", "10001", "10001", "10001", "10101", "10101", "01010"],
  H: ["10001", "10001", "10001", "11111", "10001", "10001", "10001"],
  L: ["10000", "10000", "10000", "10000", "10000", "10000", "11111"],
};

const LETTER_W = 5;
const LETTER_H = 7;
const GAP_COLS = 1;

function letterCells(word, cellPx, originX, originY) {
  const cells = [];
  let offsetCols = 0;
  for (let li = 0; li < word.length; li++) {
    const ch = word[li];
    const bm = LETTERS[ch];
    if (!bm) throw new Error(`Missing letter: ${ch}`);
    for (let r = 0; r < LETTER_H; r++) {
      for (let c = 0; c < LETTER_W; c++) {
        if (bm[r][c] === "1") {
          cells.push({
            x: originX + (offsetCols + c) * cellPx,
            y: originY + r * cellPx,
            letter: ch,
            letterIndex: li,
            colInLetter: c,
            rowInLetter: r,
          });
        }
      }
    }
    offsetCols += LETTER_W + GAP_COLS;
  }
  return cells;
}

function totalCols(word) {
  return word.length * LETTER_W + (word.length - 1) * GAP_COLS;
}

// Pick cell pixel sizes so both words fit the canvas comfortably.
const AUGUST_CELL = 16;
const WHEEL_CELL = 20;
const AUGUST_TOTAL_COLS = totalCols("AUGUST");
const WHEEL_TOTAL_COLS = totalCols("WHEEL");

const AUGUST_W = AUGUST_TOTAL_COLS * AUGUST_CELL; // 35*16 = 560
const AUGUST_H = LETTER_H * AUGUST_CELL;           //  7*16 = 112
const WHEEL_W = WHEEL_TOTAL_COLS * WHEEL_CELL;     // 29*20 = 580
const WHEEL_H = LETTER_H * WHEEL_CELL;             //  7*20 = 140

const augustCells = letterCells(
  "AUGUST",
  AUGUST_CELL,
  (W - AUGUST_W) / 2,
  (H - AUGUST_H) / 2,
);

// ----- WHEEL cells: E's are replaced with gear point clouds ----------------
// For non-E letters we use the bitmap cells; for E's we substitute gears.
function wheelTargets() {
  const nonECells = [];
  const gearCenters = []; // one per E

  let offsetCols = 0;
  for (let li = 0; li < "WHEEL".length; li++) {
    const ch = "WHEEL"[li];
    const originX = (W - WHEEL_W) / 2;
    const originY = (H - WHEEL_H) / 2;
    const letterLeft = originX + offsetCols * WHEEL_CELL;
    const letterTop = originY;

    if (ch === "E") {
      gearCenters.push({
        cx: letterLeft + (LETTER_W * WHEEL_CELL) / 2,
        cy: letterTop + (LETTER_H * WHEEL_CELL) / 2,
        letterIndex: li,
      });
    } else {
      const bm = LETTERS[ch];
      for (let r = 0; r < LETTER_H; r++) {
        for (let c = 0; c < LETTER_W; c++) {
          if (bm[r][c] === "1") {
            nonECells.push({
              x: letterLeft + c * WHEEL_CELL,
              y: letterTop + r * WHEEL_CELL,
              letter: ch,
              letterIndex: li,
            });
          }
        }
      }
    }
    offsetCols += LETTER_W + GAP_COLS;
  }
  return { nonECells, gearCenters };
}

// Gear particle layout. Returns an array of {r, angle0} pairs describing
// particle offsets from gear center, so we can animate rotation around
// center by recomputing position each keyframe.
function gearLayout(count) {
  const pts = [];
  const outerR = (LETTER_H * WHEEL_CELL) / 2 - 2; // ~68
  const innerR = outerR * 0.55;
  const hubR = outerR * 0.2;

  const teeth = 10; // mechanical look
  const outerCount = Math.round(count * 0.55);
  const innerCount = Math.round(count * 0.3);
  const hubCount = Math.max(1, count - outerCount - innerCount);

  // Outer ring with alternating teeth (big/small radii)
  for (let i = 0; i < outerCount; i++) {
    const a = (i / outerCount) * Math.PI * 2;
    const tooth = Math.round((a / (Math.PI * 2)) * teeth * 2) % 2 === 0;
    const r = tooth ? outerR : outerR * 0.82;
    pts.push({ r, angle0: a });
  }
  // Inner ring
  for (let i = 0; i < innerCount; i++) {
    const a = (i / innerCount) * Math.PI * 2 + Math.PI / innerCount;
    pts.push({ r: innerR, angle0: a });
  }
  // Hub
  for (let i = 0; i < hubCount; i++) {
    const a = (i / hubCount) * Math.PI * 2;
    pts.push({ r: hubR, angle0: a });
  }
  return pts;
}

// ----- Particle count ------------------------------------------------------
// Use enough particles to saturate AUGUST fully; WHEEL uses a fixed allocation
// between non-E letters and gear points.
const N_PARTICLES = augustCells.length; // 91

const { nonECells, gearCenters } = wheelTargets();
// Allocate particle indices: first `nonECells.length` to non-E cells,
// remainder split evenly between the two gears.
const N_NON_E = nonECells.length;
const N_GEAR_TOTAL = N_PARTICLES - N_NON_E;
const N_PER_GEAR = Math.floor(N_GEAR_TOTAL / 2);
const N_GEAR_LEFTOVER = N_GEAR_TOTAL - N_PER_GEAR * 2;

const gearA = gearLayout(N_PER_GEAR + N_GEAR_LEFTOVER);
const gearB = gearLayout(N_PER_GEAR);

// ----- Per-particle target computation -------------------------------------
// Deterministic scatter so loops line up.
function rand(seed) {
  // xorshift
  let x = (seed | 0) || 1;
  return () => {
    x ^= x << 13;
    x ^= x >>> 17;
    x ^= x << 5;
    return ((x >>> 0) / 0xffffffff);
  };
}
const scatterRand1 = rand(1337);
const scatterRand2 = rand(90210);

function scatterPoint(rng) {
  return [rng() * W, rng() * H];
}

function wheelStaticTarget(i) {
  if (i < N_NON_E) {
    const c = nonECells[i];
    return { kind: "static", x: c.x, y: c.y };
  }
  const gi = i - N_NON_E;
  if (gi < gearA.length) {
    return {
      kind: "gear",
      center: gearCenters[0],
      layout: gearA[gi],
      dir: 1,
    };
  }
  return {
    kind: "gear",
    center: gearCenters[1],
    layout: gearB[gi - gearA.length],
    dir: -1,
  };
}

function gearPos(t, target) {
  const { center, layout, dir } = target;
  const omega = 2 * Math.PI / 180; // full rotation every 3s at 60fps
  const a = layout.angle0 + dir * omega * t;
  return [center.cx + layout.r * Math.cos(a), center.cy + layout.r * Math.sin(a)];
}

// Cell centers need a half-offset since particles are drawn at layer center.
function cellCenter(cell, cellPx) {
  return [cell.x + cellPx / 2, cell.y + cellPx / 2];
}

// ----- Build keyframes for each particle -----------------------------------
function buildParticleKeyframes(i) {
  const augPos = cellCenter(augustCells[i], AUGUST_CELL);
  const scat1 = scatterPoint(scatterRand1);
  const scat2 = scatterPoint(scatterRand2);

  const wheelTarget = wheelStaticTarget(i);

  // Base WHEEL target position at frame = 0 relative to wheel start
  const wheelStart = F.wheelForm[0];
  let wheelStartPos;
  if (wheelTarget.kind === "static") {
    wheelStartPos = [
      wheelTarget.x + WHEEL_CELL / 2,
      wheelTarget.y + WHEEL_CELL / 2,
    ];
  } else {
    wheelStartPos = gearPos(0, wheelTarget);
  }

  const frames = [];

  // F0: start at AUGUST position (same as end, for loop)
  frames.push({ t: F.augustForm[0], s: augPos });
  // F1: hold AUGUST during form -> hold
  frames.push({ t: F.augustForm[1], s: augPos });
  frames.push({ t: F.augustHold[1], s: augPos });
  // F2: scatter1
  frames.push({ t: F.scatter1[1], s: scat1 });
  // F3: wheel form start (reach wheelStartPos)
  frames.push({ t: F.wheelForm[1], s: wheelStartPos });

  // F4..: during wheel hold, gear particles rotate. Non-gear particles just hold.
  if (wheelTarget.kind === "gear") {
    const holdStart = F.wheelForm[1];
    const holdEnd = F.wheelHold[1];
    const step = 6; // sample every 6 frames for smooth rotation
    for (let t = holdStart + step; t <= holdEnd; t += step) {
      frames.push({ t, s: gearPos(t - wheelStart, wheelTarget) });
    }
  } else {
    frames.push({ t: F.wheelHold[1], s: wheelStartPos });
  }

  // F5: scatter2
  frames.push({ t: F.scatter2[1], s: scat2 });
  // F6: loop back to AUGUST
  frames.push({ t: F.loopBack[1], s: augPos });

  return frames;
}

// ----- Lottie helpers ------------------------------------------------------
const GOLD = [245 / 255, 197 / 255, 24 / 255, 1];
const WHITE = [1, 1, 1, 1];

function particleLayer(ind, keyframes, color, sizePx) {
  // Position property with animated keyframes
  const k = [];
  for (let i = 0; i < keyframes.length; i++) {
    const kf = keyframes[i];
    const entry = {
      i: { x: [0.5], y: [0.5] },
      o: { x: [0.5], y: [0.5] },
      t: kf.t,
      s: [kf.s[0], kf.s[1], 0],
    };
    k.push(entry);
  }

  return {
    ddd: 0,
    ind,
    ty: 4,
    nm: `p${ind}`,
    sr: 1,
    ks: {
      o: { a: 0, k: 100, ix: 11 },
      r: { a: 0, k: 0, ix: 10 },
      p: { a: 1, k, ix: 2 },
      a: { a: 0, k: [0, 0, 0], ix: 1 },
      s: { a: 0, k: [100, 100, 100], ix: 6 },
    },
    ao: 0,
    shapes: [
      {
        ty: "gr",
        it: [
          {
            ty: "el",
            d: 1,
            s: { a: 0, k: [sizePx, sizePx], ix: 2 },
            p: { a: 0, k: [0, 0], ix: 3 },
            nm: "Ellipse",
          },
          {
            ty: "fl",
            c: { a: 0, k: color, ix: 4 },
            o: { a: 0, k: 100, ix: 5 },
            r: 1,
            nm: "Fill",
          },
          {
            ty: "tr",
            p: { a: 0, k: [0, 0], ix: 2 },
            a: { a: 0, k: [0, 0], ix: 1 },
            s: { a: 0, k: [100, 100], ix: 3 },
            r: { a: 0, k: 0, ix: 6 },
            o: { a: 0, k: 100, ix: 7 },
            sk: { a: 0, k: 0, ix: 4 },
            sa: { a: 0, k: 0, ix: 5 },
          },
        ],
        nm: "Particle",
      },
    ],
    ip: 0,
    op: OP,
    st: 0,
    bm: 0,
  };
}

// Roughly alternate gold/white with a bias toward gold. Gears get more gold.
function colorForParticle(i) {
  if (i >= N_NON_E) {
    // gear particles: mostly gold with white accents
    return i % 5 === 0 ? WHITE : GOLD;
  }
  // letter particles: 70% gold, 30% white
  return i % 10 < 7 ? GOLD : WHITE;
}

function sizeForParticle(i) {
  // Slight variation for depth
  const base = i % 3 === 0 ? 7 : 6;
  return base;
}

const layers = [];
for (let i = 0; i < N_PARTICLES; i++) {
  const frames = buildParticleKeyframes(i);
  layers.push(particleLayer(i + 1, frames, colorForParticle(i), sizeForParticle(i)));
}

const lottie = {
  v: "5.9.0",
  fr: FPS,
  ip: 0,
  op: OP,
  w: W,
  h: H,
  nm: "AugustWheel",
  ddd: 0,
  assets: [],
  layers,
  meta: { g: "generated by scripts/generate-lottie.mjs" },
};

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, JSON.stringify(lottie));
console.log(`Wrote ${OUT} (${N_PARTICLES} particles, ${layers.length} layers)`);
