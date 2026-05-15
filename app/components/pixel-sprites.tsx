"use client";

import { useId } from "react";

// Stylized varsity-mascot lion HEAD — chunky 3D look done in SVG.
// Curved tufts (not pointy starburst), directional lighting from the
// upper-left, layered gradients on mane / face / snout / nose / eyes.
// Five expressions driven by the `state` prop. Generic cartoon lion —
// no real-team marks. The previous file name (`pixel-sprites.tsx`) is
// kept so existing imports don't have to change.

const C = {
  outline: "#0a0f15",
  outlineSoft: "#22150a",
  // Mane palette — deep coffee → caramel → honey → cream highlight
  maneDeep: "#321709",
  maneDark: "#5a2c0e",
  mane: "#7e3e14",
  maneMid: "#a6571f",
  maneLight: "#cf8333",
  maneHighlight: "#f0b665",
  maneSpec: "#fde4b0",
  // Face palette — tan with a warmer top-light and cool bottom-shadow
  faceShadow: "#7a4514",
  faceDark: "#b87532",
  face: "#e6a155",
  faceLight: "#f5c98a",
  faceHi: "#fff0c8",
  // Snout (muzzle) — lighter than the face, sits forward
  snoutDark: "#e6b078",
  snout: "#f6d7a5",
  snoutHi: "#fff5dc",
  // Features
  eyeBack: "#fef4dd", // warm sclera
  eyeShade: "#d9b27c", // sclera shadow (under brow)
  iris: "#1c3b1a", // dark green-brown, more interesting than pure black
  irisRim: "#000",
  pupil: "#000",
  catchlight: "#ffffff",
  noseDark: "#1a0a04",
  nose: "#42180a",
  noseHi: "#9a4a22",
  tongue: "#e0577e",
  tongueDark: "#9a2a50",
  white: "#ffffff",
} as const;

export type LionExpression =
  | "ready"
  | "alert"
  | "stunned"
  | "dazed"
  | "determined";

// ─── HELPERS ───────────────────────────────────────────────────────────────

// Generate a wavy/spiked outer mane path with smooth Bezier curves between
// peaks. `bumps` is the number of outward tufts. Each peak's outer radius
// is slightly randomized via the `jitter` array so the silhouette isn't
// mechanically symmetrical.
function manePath(
  cx: number,
  cy: number,
  outerR: number,
  valleyR: number,
  bumps: number,
  rotate = 0,
  jitter: number[] = [],
): string {
  const pts: { x: number; y: number; r: number }[] = [];
  const totalSteps = bumps * 2;
  for (let i = 0; i < totalSteps; i++) {
    const isPeak = i % 2 === 0;
    const r = isPeak
      ? outerR + (jitter[i / 2] ?? 0)
      : valleyR;
    const a = (i / totalSteps) * Math.PI * 2 - Math.PI / 2 + rotate;
    pts.push({ x: cx + r * Math.cos(a), y: cy + r * Math.sin(a), r });
  }
  // Build path: start at first peak, then for each pair (valley → next peak)
  // use a quadratic Bezier with the valley as the control point.
  let d = `M ${pts[0].x.toFixed(1)} ${pts[0].y.toFixed(1)}`;
  for (let i = 1; i < pts.length; i += 2) {
    const valley = pts[i];
    const nextPeak = pts[(i + 1) % pts.length];
    d += ` Q ${valley.x.toFixed(1)} ${valley.y.toFixed(1)} ${nextPeak.x.toFixed(1)} ${nextPeak.y.toFixed(1)}`;
  }
  d += " Z";
  return d;
}

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

  // Mane geometry: 9 outer tufts, with mild jitter for organic feel
  const outerMane = manePath(140, 148, 122, 86, 9, 0.06, [
    0, -6, 3, -4, 4, -2, 5, -3, 2,
  ]);
  const innerMane = manePath(140, 148, 106, 80, 9, 0.15, [
    0, -2, 1, -2, 2, 0, 1, -1, 1,
  ]);

  return (
    <svg
      viewBox="0 0 280 280"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        {/* Directional light from upper-left — mane volume gradient */}
        <radialGradient
          id={`${id}-mane`}
          cx="32%"
          cy="28%"
          r="78%"
        >
          <stop offset="0%" stopColor={C.maneSpec} />
          <stop offset="14%" stopColor={C.maneHighlight} />
          <stop offset="36%" stopColor={C.maneLight} />
          <stop offset="62%" stopColor={C.mane} />
          <stop offset="86%" stopColor={C.maneDark} />
          <stop offset="100%" stopColor={C.maneDeep} />
        </radialGradient>

        {/* Inner mane ridge — tighter highlight, suggests a second volume */}
        <radialGradient
          id={`${id}-mane-inner`}
          cx="38%"
          cy="32%"
          r="60%"
        >
          <stop offset="0%" stopColor={C.maneHighlight} />
          <stop offset="40%" stopColor={C.maneMid} />
          <stop offset="85%" stopColor={C.maneDark} />
          <stop offset="100%" stopColor={C.maneDeep} />
        </radialGradient>

        {/* Face — softer, warm */}
        <radialGradient
          id={`${id}-face`}
          cx="38%"
          cy="30%"
          r="70%"
        >
          <stop offset="0%" stopColor={C.faceHi} />
          <stop offset="22%" stopColor={C.faceLight} />
          <stop offset="58%" stopColor={C.face} />
          <stop offset="88%" stopColor={C.faceDark} />
          <stop offset="100%" stopColor={C.faceShadow} />
        </radialGradient>

        {/* Snout — sits forward, brightly lit on the upper edge */}
        <radialGradient
          id={`${id}-snout`}
          cx="40%"
          cy="25%"
          r="75%"
        >
          <stop offset="0%" stopColor={C.snoutHi} />
          <stop offset="35%" stopColor={C.snout} />
          <stop offset="80%" stopColor={C.snoutDark} />
          <stop offset="100%" stopColor={C.faceDark} />
        </radialGradient>

        {/* Sclera — tiny radial gradient to suggest a sphere */}
        <radialGradient id={`${id}-eye-bg`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor={C.white} />
          <stop offset="60%" stopColor={C.eyeBack} />
          <stop offset="100%" stopColor={C.eyeShade} />
        </radialGradient>

        {/* Nose — rounded triangle, top-lit */}
        <linearGradient id={`${id}-nose`} x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor={C.noseHi} />
          <stop offset="30%" stopColor={C.nose} />
          <stop offset="100%" stopColor={C.noseDark} />
        </linearGradient>

        {/* Iris — green-brown with a darker rim */}
        <radialGradient id={`${id}-iris`} cx="40%" cy="35%" r="65%">
          <stop offset="0%" stopColor="#4a7a3a" />
          <stop offset="55%" stopColor={C.iris} />
          <stop offset="100%" stopColor={C.irisRim} />
        </radialGradient>

        {/* Drop shadow — soft, beneath the head */}
        <filter id={`${id}-blur`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>

        {/* Subtle face inner shadow — applied to the face ellipse */}
        <filter id={`${id}-inset`} x="-10%" y="-10%" width="120%" height="120%">
          <feGaussianBlur stdDeviation="2" in="SourceGraphic" />
        </filter>
      </defs>

      {/* ───── Ground shadow under the head ────────────────────────────── */}
      <ellipse
        cx="140"
        cy="262"
        rx="100"
        ry="10"
        fill={C.outline}
        opacity="0.35"
        filter={`url(#${id}-blur)`}
      />

      {/* ───── Outer mane silhouette — dark base ───────────────────────── */}
      <path
        d={outerMane}
        fill={C.maneDeep}
        stroke={C.outline}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* ───── Outer mane gradient overlay ─────────────────────────────── */}
      <path d={outerMane} fill={`url(#${id}-mane)`} />

      {/* ───── Inner mane ridge — gives 3D layered look ────────────────── */}
      <path
        d={innerMane}
        fill={`url(#${id}-mane-inner)`}
        stroke={C.maneDark}
        strokeWidth="1.5"
        strokeLinejoin="round"
        opacity="0.95"
      />

      {/* ───── Light streaks on top mane (specular hits) ───────────────── */}
      <g opacity="0.6">
        <path
          d="M 92 90 Q 105 70 124 78"
          stroke={C.maneSpec}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 132 60 Q 145 50 158 60"
          stroke={C.maneSpec}
          strokeWidth="3"
          fill="none"
          strokeLinecap="round"
        />
        <path
          d="M 170 78 Q 188 72 198 88"
          stroke={C.maneSpec}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        />
      </g>

      {/* ───── Face — round, slightly low-set ──────────────────────────── */}
      <ellipse
        cx="140"
        cy="160"
        rx="68"
        ry="62"
        fill={`url(#${id}-face)`}
        stroke={C.outline}
        strokeWidth="3"
      />

      {/* Face highlight (upper-left soft glow) */}
      <ellipse
        cx="110"
        cy="130"
        rx="30"
        ry="32"
        fill={C.faceHi}
        opacity="0.4"
      />

      {/* Face shadow (lower-right) — suggests a sphere */}
      <ellipse
        cx="170"
        cy="195"
        rx="40"
        ry="22"
        fill={C.faceShadow}
        opacity="0.25"
      />

      {/* Cheek tufts — small bumps on either side of the muzzle */}
      <g>
        {/* Left tuft */}
        <path
          d="M 78 192 Q 70 200 78 212 Q 88 218 100 210 Q 96 200 92 196 Z"
          fill={C.faceDark}
          stroke={C.outline}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M 80 198 Q 78 203 82 207"
          stroke={C.faceHi}
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
        {/* Right tuft */}
        <path
          d="M 202 192 Q 210 200 202 212 Q 192 218 180 210 Q 184 200 188 196 Z"
          fill={C.faceDark}
          stroke={C.outline}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <path
          d="M 198 198 Q 200 203 196 207"
          stroke={C.faceHi}
          strokeWidth="1.5"
          fill="none"
          opacity="0.6"
        />
      </g>

      {/* ───── Snout / muzzle — pulled forward, brighter ────────────────── */}
      <ellipse
        cx="140"
        cy="200"
        rx="44"
        ry="32"
        fill={`url(#${id}-snout)`}
        stroke={C.outline}
        strokeWidth="2.5"
      />
      {/* Snout highlight */}
      <ellipse
        cx="124"
        cy="184"
        rx="18"
        ry="10"
        fill={C.snoutHi}
        opacity="0.55"
      />

      {/* ───── Brow ridge — subtle shadow above eyes for deep-set look ─── */}
      <path
        d="M 96 135 Q 140 122 184 135"
        stroke={C.faceShadow}
        strokeWidth="4"
        fill="none"
        opacity="0.4"
        strokeLinecap="round"
      />

      {/* ───── Eyes — driven by expression ────────────────────────────── */}
      <Eyes expr={state} id={id} />

      {/* ───── Nose — rounded triangle ────────────────────────────────── */}
      <g>
        <path
          d="M 140 196 Q 124 180 130 170 Q 140 164 150 170 Q 156 180 140 196 Z"
          fill={`url(#${id}-nose)`}
          stroke={C.outline}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        {/* Glossy nose highlight */}
        <ellipse cx="133" cy="174" rx="3.5" ry="2.5" fill={C.white} opacity="0.65" />
        <ellipse cx="137" cy="180" rx="1.5" ry="1.5" fill={C.white} opacity="0.4" />
      </g>

      {/* Philtrum — line down the middle of the muzzle */}
      <path
        d="M 140 196 L 140 215"
        stroke={C.outline}
        strokeWidth="2"
        opacity="0.7"
      />

      {/* ───── Mouth — driven by expression ───────────────────────────── */}
      <Mouth expr={state} id={id} />

      {/* ───── Whiskers — 3 per side, fine lines ──────────────────────── */}
      <g
        stroke={C.outline}
        strokeWidth="1.4"
        fill="none"
        strokeLinecap="round"
        opacity="0.65"
      >
        <path d="M 78 202 q -12 -2 -22 2" />
        <path d="M 78 210 q -14 1 -24 7" />
        <path d="M 80 218 q -10 4 -18 11" />
        <path d="M 202 202 q 12 -2 22 2" />
        <path d="M 202 210 q 14 1 24 7" />
        <path d="M 200 218 q 10 4 18 11" />
      </g>
    </svg>
  );
}

// ─── EXPRESSIONS ───────────────────────────────────────────────────────────

const LEFT_EYE = { cx: 113, cy: 152, rx: 14, ry: 12 };
const RIGHT_EYE = { cx: 167, cy: 152, rx: 14, ry: 12 };

function Eyes({ expr, id }: { expr: LionExpression; id: string }) {
  switch (expr) {
    case "ready":
      return (
        <>
          <Eye id={id} {...LEFT_EYE} pupil="forward" />
          <Eye id={id} {...RIGHT_EYE} pupil="forward" />
        </>
      );
    case "alert":
      return (
        <>
          <Eye id={id} {...LEFT_EYE} rx={16} ry={14} pupil="dilated" />
          <Eye id={id} {...RIGHT_EYE} rx={16} ry={14} pupil="dilated" />
        </>
      );
    case "stunned":
      return (
        <>
          <XEyes cx={LEFT_EYE.cx} cy={LEFT_EYE.cy} />
          <XEyes cx={RIGHT_EYE.cx} cy={RIGHT_EYE.cy} />
        </>
      );
    case "dazed":
      return (
        <>
          <SlitClosed cx={LEFT_EYE.cx} cy={LEFT_EYE.cy} />
          <Spiral cx={RIGHT_EYE.cx} cy={RIGHT_EYE.cy} />
        </>
      );
    case "determined":
      return (
        <>
          <Brow x={LEFT_EYE.cx} y={LEFT_EYE.cy} dir="right" />
          <NarrowEye id={id} {...LEFT_EYE} />
          <Brow x={RIGHT_EYE.cx} y={RIGHT_EYE.cy} dir="left" />
          <NarrowEye id={id} {...RIGHT_EYE} />
        </>
      );
  }
}

function Eye({
  id,
  cx,
  cy,
  rx,
  ry,
  pupil,
}: {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  pupil: "forward" | "dilated";
}) {
  const pupilR = pupil === "dilated" ? 7 : 5;
  return (
    <g>
      {/* Sclera with sphere gradient */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={`url(#${id}-eye-bg)`}
        stroke={C.outline}
        strokeWidth="2"
      />
      {/* Iris */}
      <circle cx={cx} cy={cy + 1} r={pupilR + 2} fill={`url(#${id}-iris)`} />
      {/* Pupil */}
      <circle cx={cx} cy={cy + 1} r={pupilR} fill={C.pupil} />
      {/* Catchlight (top-left, common to both eyes — light source consistent) */}
      <ellipse cx={cx - 3} cy={cy - 3} rx={2.2} ry={1.6} fill={C.catchlight} />
      <circle cx={cx - 1} cy={cy + 3} r={0.8} fill={C.catchlight} opacity="0.7" />
    </g>
  );
}

function NarrowEye({
  id,
  cx,
  cy,
  rx,
}: {
  id: string;
  cx: number;
  cy: number;
  rx: number;
  ry: number;
}) {
  // Lemon-shape slit eye — used for "determined"
  return (
    <g>
      <path
        d={`M ${cx - rx} ${cy + 2} q ${rx} -10 ${rx * 2} 0 q -${rx} 10 -${rx * 2} 0 z`}
        fill={`url(#${id}-iris)`}
        stroke={C.outline}
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <ellipse cx={cx - 2} cy={cy} rx={1.6} ry={1.2} fill={C.catchlight} />
    </g>
  );
}

function XEyes({ cx, cy }: { cx: number; cy: number }) {
  const s = 12;
  return (
    <g stroke={C.outline} strokeWidth="4" strokeLinecap="round">
      <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} />
      <line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} />
    </g>
  );
}

function SlitClosed({ cx, cy }: { cx: number; cy: number }) {
  return (
    <path
      d={`M ${cx - 14} ${cy} q 14 -6 28 0`}
      stroke={C.outline}
      strokeWidth="4"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Spiral({ cx, cy }: { cx: number; cy: number }) {
  // Concentric circles + curl, suggests a dizzy swirl
  return (
    <g stroke={C.outline} strokeWidth="3" fill="none" strokeLinecap="round">
      <circle cx={cx} cy={cy} r="13" />
      <circle cx={cx} cy={cy} r="8" />
      <path d={`M ${cx} ${cy} m -4 0 a 4 4 0 1 0 8 0`} />
    </g>
  );
}

function Brow({
  x,
  y,
  dir,
}: {
  x: number;
  y: number;
  dir: "left" | "right";
}) {
  const w = 22;
  const tilt = dir === "right" ? 8 : -8;
  return (
    <path
      d={`M ${x - w / 2} ${y - 20} l ${w} ${tilt} l -2 6 l -${w - 2} -${
        tilt > 0 ? tilt - 2 : -(tilt + 2)
      } z`}
      fill={C.outline}
      stroke={C.outline}
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
  );
}

// ─── MOUTH ─────────────────────────────────────────────────────────────────

function Mouth({ expr, id: _id }: { expr: LionExpression; id: string }) {
  switch (expr) {
    case "ready":
      // Soft closed-mouth grin: two arcs forming the underside of the snout
      return (
        <g
          stroke={C.outline}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        >
          <path d="M 116 224 q 12 8 24 8 q 12 0 24 -8" />
          <path d="M 140 215 v 12" />
        </g>
      );
    case "alert":
      return (
        <g>
          <ellipse
            cx="140"
            cy="226"
            rx="14"
            ry="10"
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2"
          />
          <ellipse cx="140" cy="227" rx="9" ry="6" fill={C.tongueDark} />
          <ellipse cx="142" cy="225" rx="4" ry="2.5" fill={C.tongue} opacity="0.7" />
        </g>
      );
    case "stunned":
      return (
        <g>
          <ellipse
            cx="140"
            cy="232"
            rx="20"
            ry="15"
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2.5"
          />
          <ellipse cx="140" cy="234" rx="13" ry="9" fill={C.tongueDark} />
          <ellipse cx="143" cy="231" rx="5" ry="3" fill={C.tongue} opacity="0.7" />
        </g>
      );
    case "dazed":
      return (
        <g>
          {/* Lopsided open mouth, left side */}
          <path
            d="M 110 224 q 14 12 34 6"
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          {/* Tongue dangling out right side */}
          <path
            d="M 138 226 q 6 8 12 14 q -6 4 -12 -2 Z"
            fill={C.tongue}
            stroke={C.tongueDark}
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
          {/* Tongue highlight */}
          <path d="M 142 230 q 2 4 4 6" stroke={C.white} strokeWidth="1" fill="none" opacity="0.5" />
        </g>
      );
    case "determined":
      return (
        <g>
          {/* Snarl creases */}
          <path
            d="M 116 216 q 24 -6 48 0"
            stroke={C.outline}
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            opacity="0.6"
          />
          {/* Gritted teeth — dark gum band with white teeth */}
          <path
            d="M 110 226 q 30 6 60 0 v 12 q -30 6 -60 0 z"
            fill={C.outline}
            stroke={C.outline}
            strokeWidth="2"
            strokeLinejoin="round"
          />
          <path
            d="M 113 228 q 27 5 54 0 v 8 q -27 5 -54 0 z"
            fill={C.white}
          />
          {/* Tooth dividers */}
          <g stroke={C.outline} strokeWidth="1.4">
            <line x1="125" y1="228" x2="125" y2="236" />
            <line x1="140" y1="228" x2="140" y2="236" />
            <line x1="155" y1="228" x2="155" y2="236" />
          </g>
          {/* Two pointed fangs at the corners */}
          <path
            d="M 117 231 l 3 5 l 3 -5 z"
            fill={C.white}
            stroke={C.outline}
            strokeWidth="1"
          />
          <path
            d="M 157 231 l 3 5 l 3 -5 z"
            fill={C.white}
            stroke={C.outline}
            strokeWidth="1"
          />
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
      {/* Shadow */}
      <ellipse cx="50" cy="64" rx="32" ry="3" fill="rgba(0,0,0,0.3)" filter={`url(#${id}-fb-blur)`} />
      {/* Body */}
      <ellipse
        cx="50"
        cy="35"
        rx="42"
        ry="24"
        fill={`url(#${id}-leather)`}
        stroke="#1a0a04"
        strokeWidth="2.5"
      />
      {/* Top highlight (specular) */}
      <ellipse cx="36" cy="22" rx="18" ry="7" fill="#fff2d4" opacity="0.32" />
      {/* End stripes */}
      <path
        d="M 14 32 q 0 3 0 6"
        stroke="#fff2d4"
        strokeWidth="2.2"
        fill="none"
        opacity="0.7"
      />
      <path
        d="M 86 32 q 0 3 0 6"
        stroke="#fff2d4"
        strokeWidth="2.2"
        fill="none"
        opacity="0.7"
      />
      {/* Lacing — main rib */}
      <line
        x1="40"
        y1="35"
        x2="60"
        y2="35"
        stroke="#fff2d4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Lacing — crossbars */}
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
