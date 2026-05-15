"use client";

import { useId } from "react";

// Plush varsity-mascot lion HEAD — chunky overlapping fur locks for the
// mane, big glossy black nose, big cartoon-blue eyes, default open snarl
// with teeth visible. Five expressions driven by `state`. Generic
// stylized mascot — no real-team marks. Filename retained for back-compat
// with existing imports.

const C = {
  outline: "#0a0604",
  outlineSoft: "#2a1208",

  // Reddish-auburn mane palette — like a wild plush fur coat
  maneDeep: "#2b0d04",
  maneDark: "#5a1d0a",
  mane: "#8c3014",
  maneMid: "#b14a1e",
  maneLight: "#dc7236",
  maneHi: "#f0a460",
  maneSpec: "#ffd8a0",

  // Face — warm tan tones, soft plush
  faceShadow: "#7a3a14",
  faceDark: "#b46a2c",
  face: "#df954a",
  faceLight: "#f0bb74",
  faceHi: "#ffe2b4",

  // Cream muzzle / chin tuft — the lighter fur ring around the mouth
  muzzle: "#fae0b4",
  muzzleHi: "#fff4d8",
  muzzleShadow: "#d8a874",

  // Big plush black nose
  noseDeep: "#000000",
  nose: "#1a0d08",
  noseMid: "#3a1f12",
  noseSpec: "#ffffff",

  // Mascot-blue eyes (NOT Lions team logo blue — a generic cartoon
  // bright blue that reads as "plush mascot eye")
  eyeWhite: "#ffffff",
  eyeShade: "#cdd6dd",
  iris: "#1e7cc4",
  irisRim: "#0a3a6a",
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
// A single curved-triangle "lock" of fur, radiating from a base point on
// the face circle out to a tip. Each lock has its own linear gradient so
// it reads as a 3D form.

interface LockDef {
  angle: number;     // radians from center, -π/2 = top
  length: number;    // outer radius from face center
  width: number;     // base half-width in radians
  curve: number;     // tip lateral offset (positive = curl clockwise)
  tone: "deep" | "dark" | "mid" | "light"; // shade
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
  const tipx = cx + def.length * Math.cos(tipAng);
  const tipy = cy + def.length * Math.sin(tipAng);
  // Control points pull the sides into a flame-like curve.
  const ctrl1x = cx + (def.length * 0.7) * Math.cos(baseAng1 + def.curve * 0.5);
  const ctrl1y = cy + (def.length * 0.7) * Math.sin(baseAng1 + def.curve * 0.5);
  const ctrl2x = cx + (def.length * 0.7) * Math.cos(baseAng2 + def.curve * 0.5);
  const ctrl2y = cy + (def.length * 0.7) * Math.sin(baseAng2 + def.curve * 0.5);
  return (
    `M ${base1x.toFixed(1)} ${base1y.toFixed(1)} ` +
    `Q ${ctrl1x.toFixed(1)} ${ctrl1y.toFixed(1)} ${tipx.toFixed(1)} ${tipy.toFixed(1)} ` +
    `Q ${ctrl2x.toFixed(1)} ${ctrl2y.toFixed(1)} ${base2x.toFixed(1)} ${base2y.toFixed(1)} ` +
    `Z`
  );
}

// Defines all the fur locks around the head. Drawn back-to-front so
// upper/outer locks render under the face and the lowest cheek locks
// render in front of the face edge.
const BACK_LOCKS: LockDef[] = [
  // Top — long, prominent
  { angle: -Math.PI / 2 - 0.6, length: 118, width: 0.20, curve: 0.10, tone: "mid" },
  { angle: -Math.PI / 2 - 0.3, length: 132, width: 0.18, curve: 0.05, tone: "light" },
  { angle: -Math.PI / 2,        length: 138, width: 0.18, curve: 0.00, tone: "light" },
  { angle: -Math.PI / 2 + 0.3,  length: 128, width: 0.18, curve: -0.05, tone: "mid" },
  { angle: -Math.PI / 2 + 0.6,  length: 116, width: 0.20, curve: -0.10, tone: "dark" },
  // Right side
  { angle: -0.2, length: 122, width: 0.20, curve: -0.10, tone: "mid" },
  { angle:  0.2, length: 124, width: 0.20, curve: -0.05, tone: "dark" },
  { angle:  0.6, length: 118, width: 0.20, curve: 0.05, tone: "mid" },
  // Left side
  { angle: -Math.PI + 0.2,  length: 122, width: 0.20, curve: 0.10, tone: "dark" },
  { angle: -Math.PI - 0.2,  length: 124, width: 0.20, curve: 0.05, tone: "mid" },
  { angle: -Math.PI - 0.6,  length: 118, width: 0.20, curve: -0.05, tone: "dark" },
  // Mid-fills between major locks
  { angle: -Math.PI / 2 - 0.95, length: 102, width: 0.16, curve: 0.10, tone: "deep" },
  { angle: -Math.PI / 2 + 0.95, length: 102, width: 0.16, curve: -0.10, tone: "deep" },
];

// Cheek / chin locks drawn AFTER the face, so they overlap the face edge
const FRONT_LOCKS: LockDef[] = [
  { angle: 2.4,  length: 124, width: 0.22, curve: 0.12, tone: "dark" },
  { angle: 2.7,  length: 116, width: 0.20, curve: 0.08, tone: "mid" },
  { angle: Math.PI / 2 + 0.45, length: 108, width: 0.18, curve: 0.05, tone: "deep" },
  { angle: Math.PI / 2 + 0.15, length: 104, width: 0.16, curve: 0.02, tone: "dark" },
  { angle: Math.PI / 2 - 0.15, length: 104, width: 0.16, curve: -0.02, tone: "dark" },
  { angle: Math.PI / 2 - 0.45, length: 108, width: 0.18, curve: -0.05, tone: "deep" },
  { angle: 0.42, length: 116, width: 0.20, curve: -0.08, tone: "mid" },
  { angle: 0.74, length: 124, width: 0.22, curve: -0.12, tone: "dark" },
];

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
  const cx = 160;
  const cy = 175;
  const baseR = 76; // where locks emerge from
  const faceRx = 70;
  const faceRy = 64;

  const renderLock = (def: LockDef, i: number, layer: string) => {
    const gradId = `${id}-lock-${layer}-${i}`;
    const path = lockPath(cx, cy, baseR, def);
    // Light source direction varies by angle — locks on the upper-left
    // catch more light, lower-right less.
    const lightFactor = Math.cos(def.angle - (-Math.PI * 0.65)); // brightest near angle = -2.04 rad
    return (
      <g key={`${layer}-${i}`}>
        <defs>
          <linearGradient
            id={gradId}
            x1="50%"
            y1="100%"
            x2={`${50 - Math.cos(def.angle) * 20}%`}
            y2={`${100 - Math.sin(def.angle) * 100}%`}
          >
            <stop offset="0%" stopColor={C.maneDeep} />
            <stop
              offset="40%"
              stopColor={
                def.tone === "light" ? C.mane
                : def.tone === "mid" ? C.maneDark
                : def.tone === "dark" ? C.maneDark
                : C.maneDeep
              }
            />
            <stop
              offset="85%"
              stopColor={
                def.tone === "light" ? C.maneHi
                : def.tone === "mid" ? C.maneLight
                : def.tone === "dark" ? C.mane
                : C.maneDark
              }
            />
            <stop
              offset="100%"
              stopColor={
                lightFactor > 0.4
                  ? C.maneSpec
                  : def.tone === "light" ? C.maneHi
                  : def.tone === "mid" ? C.maneLight
                  : def.tone === "dark" ? C.maneMid
                  : C.mane
              }
            />
          </linearGradient>
        </defs>
        <path
          d={path}
          fill={`url(#${gradId})`}
          stroke={C.outline}
          strokeWidth="2.5"
          strokeLinejoin="round"
        />
      </g>
    );
  };

  return (
    <svg
      viewBox="0 0 320 320"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Face plush gradient */}
        <radialGradient
          id={`${id}-face`}
          cx="38%"
          cy="32%"
          r="72%"
        >
          <stop offset="0%" stopColor={C.faceHi} />
          <stop offset="22%" stopColor={C.faceLight} />
          <stop offset="60%" stopColor={C.face} />
          <stop offset="90%" stopColor={C.faceDark} />
          <stop offset="100%" stopColor={C.faceShadow} />
        </radialGradient>

        {/* Cream muzzle — the lighter fur ring around mouth/chin */}
        <radialGradient
          id={`${id}-muzzle`}
          cx="42%"
          cy="22%"
          r="80%"
        >
          <stop offset="0%" stopColor={C.muzzleHi} />
          <stop offset="50%" stopColor={C.muzzle} />
          <stop offset="100%" stopColor={C.muzzleShadow} />
        </radialGradient>

        {/* Big glossy black nose */}
        <radialGradient
          id={`${id}-nose`}
          cx="35%"
          cy="22%"
          r="80%"
        >
          <stop offset="0%" stopColor={C.noseMid} />
          <stop offset="20%" stopColor={C.nose} />
          <stop offset="80%" stopColor={C.noseDeep} />
          <stop offset="100%" stopColor={C.noseDeep} />
        </radialGradient>

        {/* Eye sphere */}
        <radialGradient id={`${id}-eyeball`} cx="38%" cy="30%" r="80%">
          <stop offset="0%" stopColor={C.eyeWhite} />
          <stop offset="65%" stopColor={C.eyeWhite} />
          <stop offset="100%" stopColor={C.eyeShade} />
        </radialGradient>

        {/* Iris — bright mascot blue */}
        <radialGradient id={`${id}-iris`} cx="35%" cy="30%" r="75%">
          <stop offset="0%" stopColor="#5fb0e8" />
          <stop offset="55%" stopColor={C.iris} />
          <stop offset="100%" stopColor={C.irisRim} />
        </radialGradient>

        {/* Drop shadow under head */}
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* ───── Ground shadow ─────────────────────────────────────────── */}
      <ellipse
        cx={cx}
        cy="298"
        rx="118"
        ry="11"
        fill={C.outline}
        opacity="0.36"
        filter={`url(#${id}-blur)`}
      />

      {/* ───── Back mane locks (top + sides) ─────────────────────────── */}
      {BACK_LOCKS.map((def, i) => renderLock(def, i, "back"))}

      {/* ───── Face plate ────────────────────────────────────────────── */}
      <ellipse
        cx={cx}
        cy={cy + 10}
        rx={faceRx}
        ry={faceRy}
        fill={`url(#${id}-face)`}
        stroke={C.outline}
        strokeWidth="3"
      />

      {/* Face highlight (upper-left) */}
      <ellipse
        cx={cx - 28}
        cy={cy - 18}
        rx="30"
        ry="32"
        fill={C.faceHi}
        opacity="0.42"
      />
      {/* Face shadow (lower-right) */}
      <ellipse
        cx={cx + 30}
        cy={cy + 38}
        rx="38"
        ry="22"
        fill={C.faceShadow}
        opacity="0.32"
      />

      {/* ───── Brow ridges — fur tufts above the eyes ────────────────── */}
      <g>
        {/* Left brow */}
        <path
          d={`M ${cx - 50} ${cy - 8} q -6 -16 16 -20 q 18 0 26 12 q -8 6 -22 8 q -12 4 -20 0 z`}
          fill={C.maneDark}
          stroke={C.outline}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d={`M ${cx - 42} ${cy - 18} q 6 -3 14 -3`}
          stroke={C.maneHi}
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        {/* Right brow */}
        <path
          d={`M ${cx + 50} ${cy - 8} q 6 -16 -16 -20 q -18 0 -26 12 q 8 6 22 8 q 12 4 20 0 z`}
          fill={C.maneDark}
          stroke={C.outline}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d={`M ${cx + 42} ${cy - 18} q -6 -3 -14 -3`}
          stroke={C.maneHi}
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      </g>

      {/* ───── Cream muzzle plate — covers the lower face ────────────── */}
      <ellipse
        cx={cx}
        cy={cy + 38}
        rx="56"
        ry="42"
        fill={`url(#${id}-muzzle)`}
        stroke={C.outline}
        strokeWidth="2.5"
      />
      {/* Muzzle highlight */}
      <ellipse
        cx={cx - 20}
        cy={cy + 20}
        rx="22"
        ry="12"
        fill={C.muzzleHi}
        opacity="0.55"
      />

      {/* ───── Eyes ───────────────────────────────────────────────────── */}
      <Eyes expr={state} id={id} cx={cx} cy={cy} />

      {/* ───── Nose — BIG glossy black plush nose ────────────────────── */}
      <g>
        <path
          d={`M ${cx} ${cy + 38}
              Q ${cx - 32} ${cy + 12} ${cx - 22} ${cy - 2}
              Q ${cx - 10} ${cy - 12} ${cx} ${cy - 8}
              Q ${cx + 10} ${cy - 12} ${cx + 22} ${cy - 2}
              Q ${cx + 32} ${cy + 12} ${cx} ${cy + 38} Z`}
          fill={`url(#${id}-nose)`}
          stroke={C.outline}
          strokeWidth="3"
          strokeLinejoin="round"
        />
        {/* Big primary highlight (top-left) */}
        <ellipse
          cx={cx - 10}
          cy={cy - 2}
          rx="8"
          ry="5"
          fill={C.noseSpec}
          opacity="0.85"
        />
        {/* Secondary highlight */}
        <ellipse
          cx={cx - 4}
          cy={cy + 8}
          rx="3"
          ry="2"
          fill={C.noseSpec}
          opacity="0.55"
        />
        {/* Nostril hints (two tiny dark dots) */}
        <ellipse cx={cx - 8} cy={cy + 22} rx="2.5" ry="3.5" fill={C.noseDeep} opacity="0.7" />
        <ellipse cx={cx + 8} cy={cy + 22} rx="2.5" ry="3.5" fill={C.noseDeep} opacity="0.7" />
      </g>

      {/* Philtrum — line from nose to mouth */}
      <path
        d={`M ${cx} ${cy + 38} L ${cx} ${cy + 52}`}
        stroke={C.outline}
        strokeWidth="2.5"
        opacity="0.75"
      />

      {/* ───── Mouth (varies per expression) ─────────────────────────── */}
      <Mouth expr={state} cx={cx} cy={cy} />

      {/* ───── Whiskers — 3 per side, emerging from muzzle ───────────── */}
      <g
        stroke={C.outline}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        opacity="0.7"
      >
        <path d={`M ${cx - 30} ${cy + 38} q -16 -2 -28 4`} />
        <path d={`M ${cx - 30} ${cy + 46} q -18 2 -32 12`} />
        <path d={`M ${cx - 26} ${cy + 54} q -14 6 -22 16`} />
        <path d={`M ${cx + 30} ${cy + 38} q 16 -2 28 4`} />
        <path d={`M ${cx + 30} ${cy + 46} q 18 2 32 12`} />
        <path d={`M ${cx + 26} ${cy + 54} q 14 6 22 16`} />
      </g>

      {/* ───── Front mane locks (cheek + chin, overlap the face) ─────── */}
      {FRONT_LOCKS.map((def, i) => renderLock(def, i, "front"))}
    </svg>
  );
}

// ─── EXPRESSIONS — EYES ────────────────────────────────────────────────────

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
  const left: EyePos = { cx: cx - 26, cy: cy + 2 };
  const right: EyePos = { cx: cx + 26, cy: cy + 2 };

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
  const rx = size === "wide" ? 22 : 18;
  const ry = size === "wide" ? 20 : 17;
  const irisR = size === "wide" ? 14 : 12;
  const pupilR = size === "wide" ? 8 : 7;
  return (
    <g>
      {/* Eye socket shadow (subtle, behind sclera) */}
      <ellipse
        cx={cx + 1}
        cy={cy + 2}
        rx={rx + 2}
        ry={ry + 2}
        fill={C.faceShadow}
        opacity="0.35"
      />
      {/* Sclera with sphere gradient */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={`url(#${id}-eyeball)`}
        stroke={C.outline}
        strokeWidth="2.5"
      />
      {/* Iris */}
      <circle cx={cx} cy={cy + 1} r={irisR} fill={`url(#${id}-iris)`} />
      {/* Iris rim */}
      <circle cx={cx} cy={cy + 1} r={irisR} fill="none" stroke={C.irisRim} strokeWidth="1.5" />
      {/* Pupil */}
      <circle cx={cx} cy={cy + 1} r={pupilR} fill={C.pupil} />
      {/* Catchlights — primary upper-left, secondary lower-right */}
      <ellipse cx={cx - 4} cy={cy - 4} rx="3.5" ry="2.5" fill={C.catchlight} />
      <circle cx={cx + 3} cy={cy + 5} r="1.5" fill={C.catchlight} opacity="0.75" />
    </g>
  );
}

function NarrowEye({ id, cx, cy }: EyePos & { id: string }) {
  return (
    <g>
      <path
        d={`M ${cx - 18} ${cy + 4} q 18 -14 36 0 q -18 14 -36 0 z`}
        fill={`url(#${id}-iris)`}
        stroke={C.outline}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx={cx - 3} cy={cy + 1} rx="2.5" ry="1.8" fill={C.catchlight} />
      {/* Heavy lowered brow on top */}
      <path
        d={`M ${cx - 20} ${cy - 8} q 18 -8 38 0 l -4 6 q -16 -6 -30 0 z`}
        fill={C.outline}
        stroke={C.outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
    </g>
  );
}

function XEyes({ cx, cy }: EyePos) {
  const s = 14;
  return (
    <g stroke={C.outline} strokeWidth="4.5" strokeLinecap="round">
      <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} />
      <line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} />
    </g>
  );
}

function SlitClosed({ cx, cy }: EyePos) {
  return (
    <path
      d={`M ${cx - 18} ${cy} q 18 -7 36 0`}
      stroke={C.outline}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Spiral({ cx, cy }: EyePos) {
  return (
    <g stroke={C.outline} strokeWidth="3.5" fill="none" strokeLinecap="round">
      <circle cx={cx} cy={cy} r="16" />
      <circle cx={cx} cy={cy} r="10" />
      <path d={`M ${cx} ${cy} m -4 0 a 4 4 0 1 0 8 0`} />
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
  const mouthY = cy + 64;

  switch (expr) {
    case "ready":
      // Open snarl-smile with visible teeth — the DEFAULT mascot face
      return (
        <g>
          {/* Mouth opening — dark cavity */}
          <path
            d={`M ${cx - 26} ${mouthY - 2}
                Q ${cx} ${mouthY + 18} ${cx + 26} ${mouthY - 2}
                Q ${cx + 12} ${mouthY - 4} ${cx} ${mouthY - 4}
                Q ${cx - 12} ${mouthY - 4} ${cx - 26} ${mouthY - 2} Z`}
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Upper teeth row (4 visible teeth) */}
          <g fill={C.toothWhite} stroke={C.toothShadow} strokeWidth="0.8">
            <path d={`M ${cx - 18} ${mouthY - 3} l 2 6 l 4 0 l 2 -6 z`} />
            <path d={`M ${cx - 8} ${mouthY - 3} l 2 5 l 4 0 l 2 -5 z`} />
            <path d={`M ${cx + 2} ${mouthY - 3} l 2 5 l 4 0 l 2 -5 z`} />
            <path d={`M ${cx + 12} ${mouthY - 3} l 2 6 l 4 0 l 2 -6 z`} />
          </g>
          {/* Two pointed fangs at the corners */}
          <path
            d={`M ${cx - 22} ${mouthY - 1} l 2 8 l 3 -7 z`}
            fill={C.toothWhite}
            stroke={C.outline}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          <path
            d={`M ${cx + 17} ${mouthY - 1} l 2 7 l 3 -8 z`}
            fill={C.toothWhite}
            stroke={C.outline}
            strokeWidth="1"
            strokeLinejoin="round"
          />
          {/* Tongue inside the cavity */}
          <ellipse
            cx={cx}
            cy={mouthY + 10}
            rx="14"
            ry="5"
            fill={C.tongueDark}
          />
          <ellipse
            cx={cx + 2}
            cy={mouthY + 9}
            rx="9"
            ry="3"
            fill={C.tongue}
            opacity="0.85"
          />
        </g>
      );

    case "alert":
      return (
        <g>
          <ellipse cx={cx} cy={mouthY + 4} rx="14" ry="11" fill={C.outline} stroke={C.outline} strokeWidth="2.5" />
          <ellipse cx={cx} cy={mouthY + 6} rx="9" ry="6" fill={C.tongueDark} />
          <ellipse cx={cx + 2} cy={mouthY + 4} rx="4" ry="2.5" fill={C.tongue} opacity="0.7" />
          {/* Two small fangs */}
          <path d={`M ${cx - 9} ${mouthY - 3} l 1 5 l 2 -5 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="0.8" />
          <path d={`M ${cx + 6} ${mouthY - 3} l 1 5 l 2 -5 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="0.8" />
        </g>
      );

    case "stunned":
      return (
        <g>
          <ellipse cx={cx} cy={mouthY + 8} rx="22" ry="16" fill={C.outline} stroke={C.outline} strokeWidth="3" />
          <ellipse cx={cx} cy={mouthY + 10} rx="14" ry="10" fill={C.tongueDark} />
          <ellipse cx={cx + 3} cy={mouthY + 6} rx="5" ry="3" fill={C.tongue} opacity="0.7" />
        </g>
      );

    case "dazed":
      return (
        <g>
          {/* Lopsided open mouth, left-leaning */}
          <path
            d={`M ${cx - 22} ${mouthY} q 14 12 38 4`}
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Tongue hanging out right */}
          <path
            d={`M ${cx + 8} ${mouthY + 2} q 8 10 14 16 q -6 4 -14 -2 Z`}
            fill={C.tongue}
            stroke={C.tongueDark}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          <path
            d={`M ${cx + 12} ${mouthY + 8} q 2 5 4 7`}
            stroke={C.eyeWhite}
            strokeWidth="1"
            fill="none"
            opacity="0.5"
          />
        </g>
      );

    case "determined":
      return (
        <g>
          {/* Snarl crease above the mouth */}
          <path
            d={`M ${cx - 26} ${mouthY - 12} q 26 -8 52 0`}
            stroke={C.outline}
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.65"
          />
          {/* Wide gritted mouth */}
          <path
            d={`M ${cx - 30} ${mouthY - 2} q 30 8 60 0 v 14 q -30 8 -60 0 z`}
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d={`M ${cx - 27} ${mouthY} q 27 7 54 0 v 8 q -27 7 -54 0 z`}
            fill={C.toothWhite}
          />
          <g stroke={C.outline} strokeWidth="1.4">
            <line x1={cx - 16} y1={mouthY} x2={cx - 16} y2={mouthY + 8} />
            <line x1={cx - 5} y1={mouthY} x2={cx - 5} y2={mouthY + 8} />
            <line x1={cx + 6} y1={mouthY} x2={cx + 6} y2={mouthY + 8} />
            <line x1={cx + 17} y1={mouthY} x2={cx + 17} y2={mouthY + 8} />
          </g>
          {/* Fangs at corners */}
          <path d={`M ${cx - 25} ${mouthY + 4} l 3 7 l 3 -7 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="1" />
          <path d={`M ${cx + 19} ${mouthY + 4} l 3 7 l 3 -7 z`} fill={C.toothWhite} stroke={C.outline} strokeWidth="1" />
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
