"use client";

import { useId } from "react";

// Plush mascot-head lion. Dense layered fur (40+ overlapping locks with
// rounded plush tips, not spiky flames), big glossy nose, big mascot-
// cartoon-blue eyes, default open snarl with teeth, hair-strand detail
// lines on the larger locks. Five expressions. Generic mascot — no
// real-team marks. Filename kept for back-compat with existing imports.

const C = {
  outline: "#0a0604",
  outlineSoft: "#2a1208",

  // Reddish-auburn mane, with darker variance for natural shading
  maneDeep: "#26090b",
  maneDark: "#54170c",
  mane: "#852d14",
  maneMid: "#ad441c",
  maneLight: "#d76b33",
  maneHi: "#ef9d5e",
  maneSpec: "#ffd5a3",
  maneStrand: "#3a1208", // thin hair-strand detail

  // Face — warm tan
  faceShadow: "#7a3a14",
  faceDark: "#b16a2c",
  face: "#df954a",
  faceLight: "#f1bc76",
  faceHi: "#ffe6b8",

  // Cream muzzle / chin
  muzzle: "#fae0b4",
  muzzleHi: "#fff4d8",
  muzzleShadow: "#d8a874",

  // Big plush black nose
  noseDeep: "#000000",
  nose: "#160a06",
  noseMid: "#3a1f12",
  noseSpec: "#ffffff",

  // Bigger brighter mascot-blue eyes
  eyeWhite: "#ffffff",
  eyeShade: "#c8d3dc",
  irisOuter: "#0a3a72",
  iris: "#1c84d2",
  irisInner: "#62b4ec",
  pupil: "#000000",
  catchlight: "#ffffff",

  tongue: "#e0577e",
  tongueDark: "#9a2a50",
  toothWhite: "#fff7e4",
  toothShadow: "#d6c39c",
} as const;

export type LionExpression =
  | "ready"
  | "alert"
  | "stunned"
  | "dazed"
  | "determined";

// ─── FUR LOCK ─────────────────────────────────────────────────────────────
// A single clump of fur. Rounded plush tip (not pointed flame) so it
// reads like matted hair rather than a spike.

interface LockDef {
  angle: number;
  length: number;
  width: number;
  curve: number;
  tone: "deep" | "dark" | "mid" | "light";
  hairStrands?: boolean; // whether to draw a few hair-strand detail lines
}

function lockPath(
  cx: number,
  cy: number,
  baseR: number,
  def: LockDef,
): string {
  const a = def.angle;
  const baseAng1 = a - def.width;
  const baseAng2 = a + def.width;
  const tipAng = a + def.curve;

  const base1x = cx + baseR * Math.cos(baseAng1);
  const base1y = cy + baseR * Math.sin(baseAng1);
  const base2x = cx + baseR * Math.cos(baseAng2);
  const base2y = cy + baseR * Math.sin(baseAng2);

  // The tip is a rounded arc — two points slightly apart, joined by a
  // small curve. This gives the plush rounded look.
  const tipWidth = def.width * 0.35;
  const tipAng1 = tipAng - tipWidth;
  const tipAng2 = tipAng + tipWidth;
  const tip1x = cx + def.length * Math.cos(tipAng1);
  const tip1y = cy + def.length * Math.sin(tipAng1);
  const tip2x = cx + def.length * Math.cos(tipAng2);
  const tip2y = cy + def.length * Math.sin(tipAng2);

  // Side control points — gives the flame an "S" curl
  const ctrl1x = cx + (def.length * 0.75) * Math.cos(baseAng1 + def.curve * 0.4);
  const ctrl1y = cy + (def.length * 0.75) * Math.sin(baseAng1 + def.curve * 0.4);
  const ctrl2x = cx + (def.length * 0.75) * Math.cos(baseAng2 + def.curve * 0.4);
  const ctrl2y = cy + (def.length * 0.75) * Math.sin(baseAng2 + def.curve * 0.4);

  // Tip curve control (the rounded top)
  const tipCtrlx = cx + (def.length * 1.06) * Math.cos(tipAng);
  const tipCtrly = cy + (def.length * 1.06) * Math.sin(tipAng);

  return (
    `M ${base1x.toFixed(1)} ${base1y.toFixed(1)} ` +
    `Q ${ctrl1x.toFixed(1)} ${ctrl1y.toFixed(1)} ${tip1x.toFixed(1)} ${tip1y.toFixed(1)} ` +
    `Q ${tipCtrlx.toFixed(1)} ${tipCtrly.toFixed(1)} ${tip2x.toFixed(1)} ${tip2y.toFixed(1)} ` +
    `Q ${ctrl2x.toFixed(1)} ${ctrl2y.toFixed(1)} ${base2x.toFixed(1)} ${base2y.toFixed(1)} ` +
    `Z`
  );
}

// Quick deterministic jitter — keeps the silhouette stable across renders
function jitter(seed: number, min: number, max: number): number {
  const x = Math.sin(seed * 12.9898) * 43758.5453;
  const r = x - Math.floor(x);
  return min + (max - min) * r;
}

// Generate locks programmatically. Major primary locks at deliberate
// positions, secondary fillers at intermediate angles with smaller size.
function buildLocks(): { back: LockDef[]; front: LockDef[] } {
  const back: LockDef[] = [];
  const front: LockDef[] = [];

  // ─── Primary back locks — top arc + sides ──────────────────────────
  // 9 prominent locks across the top half of the head (angles -π to 0)
  const primaryTopAngles = [-Math.PI + 0.05, -2.7, -2.3, -1.95, -1.57, -1.2, -0.85, -0.45, -0.05];
  primaryTopAngles.forEach((a, i) => {
    const lengthBase = 110 + jitter(i + 1, -10, 18);
    const tones: LockDef["tone"][] = ["dark", "mid", "light", "mid", "light", "mid", "light", "dark", "mid"];
    back.push({
      angle: a + jitter(i + 7, -0.04, 0.04),
      length: lengthBase,
      width: 0.19 + jitter(i + 13, -0.02, 0.04),
      curve: jitter(i + 19, -0.08, 0.08),
      tone: tones[i] ?? "mid",
      hairStrands: i % 2 === 0,
    });
  });

  // ─── Secondary back fillers — small locks between the primaries ────
  for (let i = 0; i < 16; i++) {
    const a = -Math.PI + 0.18 + i * (Math.PI / 16);
    const tones: LockDef["tone"][] = ["deep", "dark", "mid", "dark"];
    back.push({
      angle: a + jitter(i + 31, -0.07, 0.07),
      length: 84 + jitter(i + 41, -8, 12),
      width: 0.11 + jitter(i + 53, -0.02, 0.03),
      curve: jitter(i + 61, -0.05, 0.05),
      tone: tones[i % 4],
    });
  }

  // ─── Side locks (around 9-o-clock and 3-o-clock) ────────────────────
  for (let i = 0; i < 5; i++) {
    const aLeft = Math.PI + 0.1 + i * 0.35;
    const aRight = -0.15 + i * 0.3;
    back.push({
      angle: aLeft,
      length: 110 + jitter(i + 71, -10, 14),
      width: 0.18,
      curve: 0.05 + jitter(i + 79, -0.04, 0.04),
      tone: i % 2 === 0 ? "dark" : "mid",
      hairStrands: i === 1,
    });
    back.push({
      angle: aRight,
      length: 110 + jitter(i + 89, -10, 14),
      width: 0.18,
      curve: -0.05 + jitter(i + 97, -0.04, 0.04),
      tone: i % 2 === 0 ? "mid" : "dark",
      hairStrands: i === 1,
    });
  }

  // ─── Front locks (chin + cheek) — drawn AFTER the face ─────────────
  // Cheek tufts
  const cheekAngles = [Math.PI + 0.55, Math.PI + 0.78, -0.55 - 0.0, -0.78];
  cheekAngles.forEach((a, i) => {
    front.push({
      angle: a,
      length: 118 + jitter(i + 101, -8, 14),
      width: 0.21,
      curve: a < 0 ? -0.08 : 0.08,
      tone: i % 2 === 0 ? "dark" : "deep",
      hairStrands: true,
    });
  });
  // Chin tufts (across the bottom)
  for (let i = 0; i < 5; i++) {
    const a = Math.PI / 2 + (-0.5 + i * 0.25);
    front.push({
      angle: a,
      length: 100 + jitter(i + 113, -6, 12),
      width: 0.16,
      curve: jitter(i + 127, -0.04, 0.04),
      tone: i === 2 ? "deep" : "dark",
    });
  }

  return { back, front };
}

const LOCKS = buildLocks();

// ─── LION HEAD ─────────────────────────────────────────────────────────────

export function PixelLion({
  state,
  scale = 14,
}: {
  state: LionExpression;
  scale?: number;
}) {
  const id = useId();
  const size = 16 * scale;
  const cx = 170;
  const cy = 178;
  const baseR = 78;

  const renderLock = (def: LockDef, i: number, layer: string) => {
    const gradId = `${id}-lock-${layer}-${i}`;
    const path = lockPath(cx, cy, baseR, def);
    // Direction the light is "coming from" relative to this lock's tip.
    // Light source is at upper-left of canvas (~225° / -2.36 rad).
    const lightDir = Math.cos(def.angle - -2.36);
    // Pick a tip color based on tone + how directly lit this lock is.
    const tipColor =
      lightDir > 0.5
        ? C.maneSpec
        : def.tone === "light"
          ? C.maneHi
          : def.tone === "mid"
            ? C.maneLight
            : def.tone === "dark"
              ? C.maneMid
              : C.mane;
    const midColor =
      def.tone === "light"
        ? C.maneMid
        : def.tone === "mid"
          ? C.maneDark
          : def.tone === "dark"
            ? C.maneDark
            : C.maneDeep;
    return (
      <g key={`${layer}-${i}`}>
        <defs>
          <linearGradient
            id={gradId}
            x1="50%"
            y1="100%"
            x2={`${50 - Math.cos(def.angle) * 14}%`}
            y2={`${100 - Math.sin(def.angle) * 100}%`}
          >
            <stop offset="0%" stopColor={C.maneDeep} />
            <stop offset="35%" stopColor={midColor} />
            <stop offset="80%" stopColor={tipColor} />
            <stop offset="100%" stopColor={tipColor} />
          </linearGradient>
        </defs>
        <path
          d={path}
          fill={`url(#${gradId})`}
          stroke={C.outline}
          strokeWidth={layer === "back" ? 1.8 : 2.2}
          strokeLinejoin="round"
          opacity={layer === "back" && def.tone === "deep" ? 0.92 : 1}
        />
        {def.hairStrands && <HairStrands cx={cx} cy={cy} baseR={baseR} def={def} />}
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 340 340"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-face`} cx="36%" cy="32%" r="74%">
          <stop offset="0%" stopColor={C.faceHi} />
          <stop offset="22%" stopColor={C.faceLight} />
          <stop offset="60%" stopColor={C.face} />
          <stop offset="90%" stopColor={C.faceDark} />
          <stop offset="100%" stopColor={C.faceShadow} />
        </radialGradient>

        <radialGradient id={`${id}-muzzle`} cx="42%" cy="22%" r="80%">
          <stop offset="0%" stopColor={C.muzzleHi} />
          <stop offset="50%" stopColor={C.muzzle} />
          <stop offset="100%" stopColor={C.muzzleShadow} />
        </radialGradient>

        <radialGradient id={`${id}-nose`} cx="33%" cy="20%" r="80%">
          <stop offset="0%" stopColor={C.noseMid} />
          <stop offset="22%" stopColor={C.nose} />
          <stop offset="80%" stopColor={C.noseDeep} />
          <stop offset="100%" stopColor={C.noseDeep} />
        </radialGradient>

        <radialGradient id={`${id}-eyeball`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={C.eyeWhite} />
          <stop offset="65%" stopColor={C.eyeWhite} />
          <stop offset="100%" stopColor={C.eyeShade} />
        </radialGradient>

        <radialGradient id={`${id}-iris`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor={C.irisInner} />
          <stop offset="55%" stopColor={C.iris} />
          <stop offset="100%" stopColor={C.irisOuter} />
        </radialGradient>

        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse
        cx={cx}
        cy="320"
        rx="130"
        ry="11"
        fill={C.outline}
        opacity="0.38"
        filter={`url(#${id}-blur)`}
      />

      {/* Back mane locks */}
      {LOCKS.back.map((def, i) => renderLock(def, i, "back"))}

      {/* Face plate */}
      <ellipse
        cx={cx}
        cy={cy + 8}
        rx="76"
        ry="68"
        fill={`url(#${id}-face)`}
        stroke={C.outline}
        strokeWidth="3"
      />
      {/* Face highlights & shadows */}
      <ellipse cx={cx - 30} cy={cy - 18} rx="32" ry="34" fill={C.faceHi} opacity="0.4" />
      <ellipse cx={cx + 32} cy={cy + 40} rx="40" ry="24" fill={C.faceShadow} opacity="0.32" />

      {/* Brow ridges */}
      <g>
        <path
          d={`M ${cx - 56} ${cy - 12} q -8 -20 18 -24 q 24 -2 32 14 q -10 8 -26 8 q -14 4 -24 2 z`}
          fill={C.maneDark}
          stroke={C.outline}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d={`M ${cx - 48} ${cy - 22} q 8 -3 18 -3`} stroke={C.maneHi} strokeWidth="1.5" fill="none" opacity="0.7" />
        <path
          d={`M ${cx + 56} ${cy - 12} q 8 -20 -18 -24 q -24 -2 -32 14 q 10 8 26 8 q 14 4 24 2 z`}
          fill={C.maneDark}
          stroke={C.outline}
          strokeWidth="2.2"
          strokeLinejoin="round"
        />
        <path d={`M ${cx + 48} ${cy - 22} q -8 -3 -18 -3`} stroke={C.maneHi} strokeWidth="1.5" fill="none" opacity="0.7" />
      </g>

      {/* Cream muzzle plate */}
      <ellipse
        cx={cx}
        cy={cy + 42}
        rx="62"
        ry="46"
        fill={`url(#${id}-muzzle)`}
        stroke={C.outline}
        strokeWidth="2.5"
      />
      <ellipse cx={cx - 22} cy={cy + 22} rx="24" ry="14" fill={C.muzzleHi} opacity="0.55" />

      {/* Eyes */}
      <Eyes expr={state} id={id} cx={cx} cy={cy} />

      {/* HUGE glossy black nose */}
      <g>
        <path
          d={`M ${cx} ${cy + 44}
              Q ${cx - 38} ${cy + 14} ${cx - 26} ${cy - 6}
              Q ${cx - 12} ${cy - 16} ${cx} ${cy - 12}
              Q ${cx + 12} ${cy - 16} ${cx + 26} ${cy - 6}
              Q ${cx + 38} ${cy + 14} ${cx} ${cy + 44} Z`}
          fill={`url(#${id}-nose)`}
          stroke={C.outline}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Primary specular highlight (top-left) — bigger and brighter */}
        <ellipse cx={cx - 12} cy={cy - 4} rx="11" ry="6" fill={C.noseSpec} opacity="0.9" />
        {/* Secondary highlight */}
        <ellipse cx={cx - 4} cy={cy + 8} rx="4" ry="2.5" fill={C.noseSpec} opacity="0.6" />
        {/* Bottom-left small light wrap */}
        <ellipse cx={cx - 18} cy={cy + 22} rx="3" ry="2" fill={C.noseSpec} opacity="0.35" />
        {/* Nostrils */}
        <ellipse cx={cx - 9} cy={cy + 24} rx="3" ry="4" fill={C.noseDeep} opacity="0.85" />
        <ellipse cx={cx + 9} cy={cy + 24} rx="3" ry="4" fill={C.noseDeep} opacity="0.85" />
      </g>

      {/* Philtrum */}
      <path
        d={`M ${cx} ${cy + 44} L ${cx} ${cy + 58}`}
        stroke={C.outline}
        strokeWidth="2.5"
        opacity="0.75"
      />

      {/* Mouth */}
      <Mouth expr={state} cx={cx} cy={cy} />

      {/* Whiskers */}
      <g stroke={C.outline} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity="0.7">
        <path d={`M ${cx - 32} ${cy + 42} q -16 -2 -30 4`} />
        <path d={`M ${cx - 32} ${cy + 52} q -20 2 -34 14`} />
        <path d={`M ${cx - 28} ${cy + 60} q -16 6 -24 18`} />
        <path d={`M ${cx + 32} ${cy + 42} q 16 -2 30 4`} />
        <path d={`M ${cx + 32} ${cy + 52} q 20 2 34 14`} />
        <path d={`M ${cx + 28} ${cy + 60} q 16 6 24 18`} />
      </g>

      {/* Front mane locks (cheek + chin) — overlap face */}
      {LOCKS.front.map((def, i) => renderLock(def, i, "front"))}
    </svg>
  );
}

// ─── HAIR STRAND DETAIL ────────────────────────────────────────────────────
// Two or three thin lines on the larger locks suggesting individual hair
// strands within the clump. Pure decoration but adds the "lived-in" feel.
function HairStrands({
  cx,
  cy,
  baseR,
  def,
}: {
  cx: number;
  cy: number;
  baseR: number;
  def: LockDef;
}) {
  const a = def.angle;
  const tipAng = a + def.curve;
  // Three strand lines: one center, two slightly off
  const strands: { from: [number, number]; to: [number, number] }[] = [];
  for (let i = -1; i <= 1; i++) {
    const aOff = a + i * (def.width * 0.3);
    const tipAOff = tipAng + i * (def.width * 0.2);
    strands.push({
      from: [
        cx + (baseR + 4) * Math.cos(aOff),
        cy + (baseR + 4) * Math.sin(aOff),
      ],
      to: [
        cx + (def.length - 6) * Math.cos(tipAOff),
        cy + (def.length - 6) * Math.sin(tipAOff),
      ],
    });
  }
  return (
    <g
      stroke={C.maneStrand}
      strokeWidth="0.8"
      fill="none"
      strokeLinecap="round"
      opacity="0.45"
    >
      {strands.map((s, i) => (
        <line key={i} x1={s.from[0]} y1={s.from[1]} x2={s.to[0]} y2={s.to[1]} />
      ))}
    </g>
  );
}

// ─── EYES ──────────────────────────────────────────────────────────────────

interface EyePos { cx: number; cy: number; }

function Eyes({
  expr,
  id,
  cx,
  cy,
}: {
  expr: LionExpression;
  id: string;
  cx: number;
  cy: number;
}) {
  const left: EyePos = { cx: cx - 30, cy: cy + 2 };
  const right: EyePos = { cx: cx + 30, cy: cy + 2 };

  switch (expr) {
    case "ready":
      return (
        <>
          <Eye id={id} {...left} size="default" />
          <Eye id={id} {...right} size="default" />
        </>
      );
    case "alert":
      return (
        <>
          <Eye id={id} {...left} size="wide" />
          <Eye id={id} {...right} size="wide" />
        </>
      );
    case "stunned":
      return (
        <>
          <XEyes {...left} />
          <XEyes {...right} />
        </>
      );
    case "dazed":
      return (
        <>
          <SlitClosed {...left} />
          <Spiral {...right} />
        </>
      );
    case "determined":
      return (
        <>
          <NarrowEye id={id} {...left} />
          <NarrowEye id={id} {...right} />
        </>
      );
  }
}

function Eye({
  id,
  cx,
  cy,
  size,
}: EyePos & { id: string; size: "default" | "wide" }) {
  const rx = size === "wide" ? 24 : 21;
  const ry = size === "wide" ? 22 : 20;
  const irisR = size === "wide" ? 15 : 13;
  const pupilR = size === "wide" ? 9 : 8;
  return (
    <g>
      <ellipse cx={cx + 1} cy={cy + 2} rx={rx + 2} ry={ry + 2} fill={C.faceShadow} opacity="0.35" />
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={`url(#${id}-eyeball)`} stroke={C.outline} strokeWidth="2.8" />
      <circle cx={cx} cy={cy + 1} r={irisR} fill={`url(#${id}-iris)`} />
      <circle cx={cx} cy={cy + 1} r={irisR} fill="none" stroke={C.irisOuter} strokeWidth="1.8" />
      <circle cx={cx} cy={cy + 1} r={pupilR} fill={C.pupil} />
      {/* Big primary catchlight */}
      <ellipse cx={cx - 5} cy={cy - 5} rx="4.5" ry="3" fill={C.catchlight} />
      {/* Secondary smaller catchlight */}
      <circle cx={cx + 4} cy={cy + 6} r="2" fill={C.catchlight} opacity="0.8" />
      {/* Tiny third gleam */}
      <circle cx={cx - 8} cy={cy + 2} r="1" fill={C.catchlight} opacity="0.5" />
    </g>
  );
}

function NarrowEye({ id, cx, cy }: EyePos & { id: string }) {
  return (
    <g>
      <path
        d={`M ${cx - 22} ${cy + 4} q 22 -16 44 0 q -22 16 -44 0 z`}
        fill={`url(#${id}-iris)`}
        stroke={C.outline}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx={cx - 4} cy={cy + 1} rx="3" ry="2" fill={C.catchlight} />
      <path
        d={`M ${cx - 24} ${cy - 10} q 22 -10 46 0 l -4 7 q -20 -8 -36 0 z`}
        fill={C.outline}
        stroke={C.outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </g>
  );
}

function XEyes({ cx, cy }: EyePos) {
  const s = 16;
  return (
    <g stroke={C.outline} strokeWidth="5" strokeLinecap="round">
      <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} />
      <line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} />
    </g>
  );
}

function SlitClosed({ cx, cy }: EyePos) {
  return (
    <path
      d={`M ${cx - 22} ${cy} q 22 -8 44 0`}
      stroke={C.outline}
      strokeWidth="4.5"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Spiral({ cx, cy }: EyePos) {
  return (
    <g stroke={C.outline} strokeWidth="3.5" fill="none" strokeLinecap="round">
      <circle cx={cx} cy={cy} r="19" />
      <circle cx={cx} cy={cy} r="12" />
      <circle cx={cx} cy={cy} r="6" />
    </g>
  );
}

// ─── MOUTH ─────────────────────────────────────────────────────────────────

function Mouth({
  expr,
  cx,
  cy,
}: {
  expr: LionExpression;
  cx: number;
  cy: number;
}) {
  const mouthY = cy + 70;

  switch (expr) {
    case "ready":
      // OPEN mascot smile with teeth + tongue
      return (
        <g>
          <path
            d={`M ${cx - 30} ${mouthY - 2}
                Q ${cx} ${mouthY + 22} ${cx + 30} ${mouthY - 2}
                Q ${cx + 14} ${mouthY - 5} ${cx} ${mouthY - 5}
                Q ${cx - 14} ${mouthY - 5} ${cx - 30} ${mouthY - 2} Z`}
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          {/* Upper teeth row */}
          <g fill={C.toothWhite} stroke={C.toothShadow} strokeWidth="0.8">
            <path d={`M ${cx - 20} ${mouthY - 4} l 2 7 l 5 0 l 2 -7 z`} />
            <path d={`M ${cx - 8} ${mouthY - 4} l 2 6 l 5 0 l 2 -6 z`} />
            <path d={`M ${cx + 5} ${mouthY - 4} l 2 6 l 5 0 l 2 -6 z`} />
            <path d={`M ${cx + 17} ${mouthY - 4} l 2 7 l 5 0 l 2 -7 z`} />
          </g>
          {/* Corner fangs */}
          <path d={`M ${cx - 26} ${mouthY} l 3 10 l 4 -9 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="1.2" />
          <path d={`M ${cx + 21} ${mouthY} l 3 9 l 4 -10 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="1.2" />
          {/* Tongue */}
          <ellipse cx={cx} cy={mouthY + 12} rx="16" ry="6" fill={C.tongueDark} />
          <ellipse cx={cx + 2} cy={mouthY + 11} rx="11" ry="3.5" fill={C.tongue} opacity="0.9" />
          {/* Tongue tip highlight */}
          <ellipse cx={cx - 2} cy={mouthY + 10} rx="4" ry="1.5" fill={C.tongue} opacity="0.6" />
        </g>
      );
    case "alert":
      return (
        <g>
          <ellipse cx={cx} cy={mouthY + 6} rx="16" ry="12" fill={C.outline} stroke={C.outline} strokeWidth="2.8" />
          <ellipse cx={cx} cy={mouthY + 8} rx="10" ry="7" fill={C.tongueDark} />
          <ellipse cx={cx + 2} cy={mouthY + 5} rx="5" ry="3" fill={C.tongue} opacity="0.75" />
          <path d={`M ${cx - 10} ${mouthY - 4} l 1.5 6 l 3 -6 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="0.8" />
          <path d={`M ${cx + 7} ${mouthY - 4} l 1.5 6 l 3 -6 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="0.8" />
        </g>
      );
    case "stunned":
      return (
        <g>
          <ellipse cx={cx} cy={mouthY + 10} rx="26" ry="18" fill={C.outline} stroke={C.outline} strokeWidth="3" />
          <ellipse cx={cx} cy={mouthY + 12} rx="16" ry="11" fill={C.tongueDark} />
          <ellipse cx={cx + 3} cy={mouthY + 8} rx="6" ry="3.5" fill={C.tongue} opacity="0.75" />
        </g>
      );
    case "dazed":
      return (
        <g>
          <path
            d={`M ${cx - 24} ${mouthY} q 14 14 42 4`}
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2.8"
            strokeLinejoin="round"
          />
          <path
            d={`M ${cx + 10} ${mouthY + 2} q 10 12 16 20 q -6 5 -16 -2 Z`}
            fill={C.tongue}
            stroke={C.tongueDark}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path d={`M ${cx + 14} ${mouthY + 10} q 2 5 4 8`} stroke={C.eyeWhite} strokeWidth="1" fill="none" opacity="0.5" />
        </g>
      );
    case "determined":
      return (
        <g>
          {/* Snarl crease */}
          <path
            d={`M ${cx - 30} ${mouthY - 14} q 30 -10 60 0`}
            stroke={C.outline}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.65"
          />
          {/* Gritted teeth band */}
          <path
            d={`M ${cx - 34} ${mouthY - 2} q 34 10 68 0 v 16 q -34 10 -68 0 z`}
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d={`M ${cx - 30} ${mouthY + 1} q 30 8 60 0 v 9 q -30 8 -60 0 z`}
            fill={C.toothWhite}
          />
          <g stroke={C.outline} strokeWidth="1.4">
            <line x1={cx - 18} y1={mouthY + 1} x2={cx - 18} y2={mouthY + 10} />
            <line x1={cx - 6} y1={mouthY + 1} x2={cx - 6} y2={mouthY + 10} />
            <line x1={cx + 6} y1={mouthY + 1} x2={cx + 6} y2={mouthY + 10} />
            <line x1={cx + 18} y1={mouthY + 1} x2={cx + 18} y2={mouthY + 10} />
          </g>
          {/* Corner fangs */}
          <path d={`M ${cx - 28} ${mouthY + 6} l 3 9 l 4 -9 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="1" />
          <path d={`M ${cx + 21} ${mouthY + 6} l 3 9 l 4 -9 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="1" />
        </g>
      );
  }
}

// ─── FOOTBALL ──────────────────────────────────────────────────────────────

export function PixelFootball({ scale = 7 }: { scale?: number }) {
  const id = useId();
  const size = 8 * scale * 1.8;
  return (
    <svg
      viewBox="0 0 100 70"
      width={size}
      height={(size * 70) / 100}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-leather`} cx="32%" cy="28%" r="80%">
          <stop offset="0%" stopColor="#c46a22" />
          <stop offset="35%" stopColor="#8a4515" />
          <stop offset="80%" stopColor="#4a2208" />
          <stop offset="100%" stopColor="#2a1206" />
        </radialGradient>
        <filter id={`${id}-fb-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="2" />
        </filter>
      </defs>
      <ellipse cx="50" cy="64" rx="32" ry="3" fill="rgba(0,0,0,0.3)" filter={`url(#${id}-fb-blur)`} />
      <ellipse cx="50" cy="35" rx="42" ry="24" fill={`url(#${id}-leather)`} stroke="#1a0a04" strokeWidth="2.5" />
      <ellipse cx="36" cy="22" rx="18" ry="7" fill="#fff2d4" opacity="0.32" />
      <path d="M 14 32 q 0 3 0 6" stroke="#fff2d4" strokeWidth="2.2" fill="none" opacity="0.7" />
      <path d="M 86 32 q 0 3 0 6" stroke="#fff2d4" strokeWidth="2.2" fill="none" opacity="0.7" />
      <line x1="40" y1="35" x2="60" y2="35" stroke="#fff2d4" strokeWidth="2.5" strokeLinecap="round" />
      <g stroke="#fff2d4" strokeWidth="2" strokeLinecap="round">
        <line x1="43" y1="31" x2="43" y2="39" />
        <line x1="47" y1="31" x2="47" y2="39" />
        <line x1="51" y1="31" x2="51" y2="39" />
        <line x1="55" y1="31" x2="55" y2="39" />
        <line x1="59" y1="31" x2="59" y2="39" />
      </g>
    </svg>
  );
}
