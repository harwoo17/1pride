"use client";

import { useId } from "react";

// Stylized varsity-mascot lion head in polished SVG: layered mane with
// gradients, smooth face, beveled features. Five expressions driven by
// the `state` prop. Generic cartoon lion — no real-team marks.

const C = {
  maneShadow: "#3a1e08",
  maneDark: "#6b3210",
  mane: "#8a4514",
  maneLight: "#c2772a",
  maneHi: "#e89a4a",
  faceDark: "#c98443",
  face: "#f4b86a",
  faceLight: "#fcd58c",
  faceHi: "#fff2d4",
  eye: "#0f1318",
  noseDark: "#2a1408",
  nose: "#4a2410",
  noseHi: "#f4b86a",
  tongue: "#d54e74",
  tongueDark: "#9b2e54",
  white: "#ffffff",
  shadow: "rgba(15,19,24,0.28)",
  outline: "#0f1318",
} as const;

export type LionExpression =
  | "ready"
  | "alert"
  | "stunned"
  | "dazed"
  | "determined";

// 9-point mane "starburst" centered at (cx, cy). Alternates outer/inner
// vertices to give a sweep-back varsity feel.
function maneStar(
  cx: number,
  cy: number,
  outR: number,
  inR: number,
  n: number,
  rotate = 0,
): string {
  const pts: string[] = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 === 0 ? outR : inR;
    const angle = (i / (n * 2)) * Math.PI * 2 - Math.PI / 2 + rotate;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }
  return pts.join(" ");
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
  const size = 16 * scale; // matches previous pixel sprite footprint

  // Mane geometry — center at (120, 120), outer radius 108, inner 76.
  const manePoints = maneStar(120, 122, 108, 78, 9, 0.1);
  const maneInnerPoints = maneStar(120, 122, 92, 68, 9, 0.18);

  return (
    <svg
      viewBox="0 0 240 240"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient
          id={`${id}-mane`}
          cx="42%"
          cy="36%"
          r="72%"
        >
          <stop offset="0%" stopColor={C.maneHi} />
          <stop offset="55%" stopColor={C.mane} />
          <stop offset="100%" stopColor={C.maneShadow} />
        </radialGradient>
        <radialGradient
          id={`${id}-face`}
          cx="42%"
          cy="34%"
          r="68%"
        >
          <stop offset="0%" stopColor={C.faceHi} />
          <stop offset="55%" stopColor={C.faceLight} />
          <stop offset="100%" stopColor={C.faceDark} />
        </radialGradient>
        <radialGradient
          id={`${id}-nose`}
          cx="35%"
          cy="30%"
          r="70%"
        >
          <stop offset="0%" stopColor={C.nose} />
          <stop offset="100%" stopColor={C.noseDark} />
        </radialGradient>
        <filter id={`${id}-blur`} x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3" />
        </filter>
      </defs>

      {/* Drop shadow */}
      <ellipse cx="120" cy="228" rx="78" ry="7" fill={C.shadow} filter={`url(#${id}-blur)`} />

      {/* Outer mane silhouette — dark base for ridge effect */}
      <polygon
        points={manePoints}
        fill={C.maneShadow}
        stroke={C.outline}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Mane gradient overlay — gives volume */}
      <polygon
        points={maneInnerPoints}
        fill={`url(#${id}-mane)`}
        stroke={C.maneDark}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />

      {/* Face — round, slightly low-set */}
      <ellipse
        cx="120"
        cy="138"
        rx="58"
        ry="54"
        fill={`url(#${id}-face)`}
        stroke={C.outline}
        strokeWidth="3"
      />

      {/* Top-left face highlight */}
      <ellipse
        cx="98"
        cy="115"
        rx="22"
        ry="24"
        fill={C.faceHi}
        opacity="0.45"
      />

      {/* Cheek tufts (subtle bumps on the lower face) */}
      <path
        d="M75 162 q-6 4 -3 12 q5 4 12 0"
        fill="none"
        stroke={C.faceDark}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />
      <path
        d="M165 162 q6 4 3 12 q-5 4 -12 0"
        fill="none"
        stroke={C.faceDark}
        strokeWidth="1.5"
        strokeLinecap="round"
        opacity="0.5"
      />

      {/* Eyes — driven by expression */}
      <Eyes expr={state} />

      {/* Nose */}
      <g>
        <path
          d="M120 168 L108 152 Q120 146 132 152 Z"
          fill={`url(#${id}-nose)`}
          stroke={C.outline}
          strokeWidth="2"
          strokeLinejoin="round"
        />
        <ellipse cx="113" cy="156" rx="2" ry="2.5" fill={C.white} opacity="0.5" />
      </g>

      {/* Mouth — driven by expression */}
      <Mouth expr={state} />

      {/* Whisker dots — three on each side */}
      <g fill={C.outline} opacity="0.55">
        <circle cx="92" cy="172" r="1.2" />
        <circle cx="88" cy="178" r="1.2" />
        <circle cx="92" cy="184" r="1.2" />
        <circle cx="148" cy="172" r="1.2" />
        <circle cx="152" cy="178" r="1.2" />
        <circle cx="148" cy="184" r="1.2" />
      </g>
    </svg>
  );
}

// ─── EXPRESSIONS ───────────────────────────────────────────────────────────

const LEFT_EYE_X = 102;
const RIGHT_EYE_X = 138;
const EYE_Y = 138;

function Eyes({ expr }: { expr: LionExpression }) {
  switch (expr) {
    case "ready":
      return (
        <>
          <Eye x={LEFT_EYE_X} y={EYE_Y} />
          <Eye x={RIGHT_EYE_X} y={EYE_Y} />
        </>
      );
    case "alert":
      return (
        <>
          <Eye x={LEFT_EYE_X} y={EYE_Y} variant="wide" />
          <Eye x={RIGHT_EYE_X} y={EYE_Y} variant="wide" />
        </>
      );
    case "stunned":
      return (
        <>
          <XEyes x={LEFT_EYE_X} y={EYE_Y} />
          <XEyes x={RIGHT_EYE_X} y={EYE_Y} />
        </>
      );
    case "dazed":
      return (
        <>
          <SlitClosed x={LEFT_EYE_X} y={EYE_Y} />
          <Spiral x={RIGHT_EYE_X} y={EYE_Y} />
        </>
      );
    case "determined":
      return (
        <>
          <AngryEye x={LEFT_EYE_X} y={EYE_Y} dir="right" />
          <AngryEye x={RIGHT_EYE_X} y={EYE_Y} dir="left" />
        </>
      );
  }
}

function Eye({
  x,
  y,
  variant,
}: {
  x: number;
  y: number;
  variant?: "wide";
}) {
  const rx = variant === "wide" ? 10 : 7;
  const ry = variant === "wide" ? 12 : 9;
  const pupilR = variant === "wide" ? 5.5 : 4.5;
  return (
    <g>
      <ellipse
        cx={x}
        cy={y}
        rx={rx}
        ry={ry}
        fill={C.white}
        stroke={C.outline}
        strokeWidth="2"
      />
      <circle cx={x} cy={y + 1} r={pupilR} fill={C.eye} />
      <circle cx={x - 2} cy={y - 2} r={1.6} fill={C.white} />
    </g>
  );
}

function XEyes({ x, y }: { x: number; y: number }) {
  const s = 10;
  return (
    <g stroke={C.outline} strokeWidth="3.5" strokeLinecap="round">
      <line x1={x - s} y1={y - s} x2={x + s} y2={y + s} />
      <line x1={x - s} y1={y + s} x2={x + s} y2={y - s} />
    </g>
  );
}

function SlitClosed({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M ${x - 12} ${y} q 12 -5 24 0`}
      stroke={C.outline}
      strokeWidth="3.5"
      fill="none"
      strokeLinecap="round"
    />
  );
}

function Spiral({ x, y }: { x: number; y: number }) {
  // Hand-drawn-feeling spiral via two arcs
  return (
    <g stroke={C.outline} strokeWidth="2.5" fill="none" strokeLinecap="round">
      <ellipse cx={x} cy={y} rx="10" ry="10" />
      <path d={`M${x - 7} ${y} a 7 7 0 1 1 7 7`} />
      <path d={`M${x - 3} ${y + 1} a 3 3 0 1 0 3 -3`} />
    </g>
  );
}

function AngryEye({
  x,
  y,
  dir,
}: {
  x: number;
  y: number;
  dir: "left" | "right";
}) {
  // Angled eyebrow + narrow slit eye
  const browTilt = dir === "right" ? -15 : 15;
  return (
    <g>
      {/* Brow */}
      <path
        d={`M ${x - 12} ${y - 14} l 24 ${browTilt > 0 ? 6 : -6} l -2 4 l -22 ${
          browTilt > 0 ? -2 : 2
        } z`}
        fill={C.eye}
        stroke={C.outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      {/* Eye (narrow lemon shape) */}
      <path
        d={`M ${x - 10} ${y + 2} q 10 -6 20 0 q -10 6 -20 0 z`}
        fill={C.eye}
        stroke={C.outline}
        strokeWidth="1.5"
      />
      {/* Catchlight */}
      <circle cx={x - 2} cy={y} r={1.3} fill={C.white} />
    </g>
  );
}

function Mouth({ expr }: { expr: LionExpression }) {
  switch (expr) {
    case "ready":
      return (
        <g
          stroke={C.outline}
          strokeWidth="2.5"
          fill="none"
          strokeLinecap="round"
        >
          {/* Two-curve gentle smile */}
          <path d="M 110 184 q 10 8 20 0" />
          <path d="M 120 170 v 14" />
        </g>
      );
    case "alert":
      return (
        <g>
          <ellipse
            cx="120"
            cy="186"
            rx="9"
            ry="8"
            fill={C.eye}
            stroke={C.outline}
            strokeWidth="2"
          />
          <ellipse cx="120" cy="186" rx="5" ry="4" fill={C.tongueDark} />
        </g>
      );
    case "stunned":
      return (
        <g>
          <ellipse
            cx="120"
            cy="188"
            rx="14"
            ry="11"
            fill={C.eye}
            stroke={C.outline}
            strokeWidth="2.5"
          />
          <ellipse cx="120" cy="190" rx="9" ry="6" fill={C.tongueDark} />
        </g>
      );
    case "dazed":
      return (
        <g stroke={C.outline} strokeWidth="2.5" fill="none" strokeLinecap="round">
          {/* lopsided open mouth + tongue out the side */}
          <path
            d="M 105 184 q 8 8 28 -2"
            fill={C.eye}
            stroke={C.outline}
            strokeWidth="2.5"
          />
          <path
            d="M 132 184 q 6 6 4 12 q -3 2 -7 -1 z"
            fill={C.tongue}
            stroke={C.tongueDark}
            strokeWidth="1.5"
          />
        </g>
      );
    case "determined":
      return (
        <g>
          {/* Gritted teeth: dark gum band + white teeth + tooth dividers */}
          <rect
            x="104"
            y="180"
            width="32"
            height="12"
            rx="2"
            fill={C.eye}
            stroke={C.outline}
            strokeWidth="2"
          />
          <rect x="106" y="182" width="28" height="6" fill={C.white} />
          <g stroke={C.eye} strokeWidth="1.2">
            <line x1="113" y1="182" x2="113" y2="188" />
            <line x1="120" y1="182" x2="120" y2="188" />
            <line x1="127" y1="182" x2="127" y2="188" />
          </g>
          {/* Subtle snarl crease */}
          <path
            d="M 102 178 q 18 -4 36 0"
            stroke={C.outline}
            strokeWidth="1.5"
            fill="none"
            strokeLinecap="round"
            opacity="0.5"
          />
        </g>
      );
  }
}

// ─── FOOTBALL ──────────────────────────────────────────────────────────────

export function PixelFootball({ scale = 7 }: { scale?: number }) {
  const id = useId();
  const size = 8 * scale * 1.5;
  return (
    <svg
      viewBox="0 0 80 60"
      width={size}
      height={(size * 60) / 80}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <radialGradient id={`${id}-leather`} cx="35%" cy="30%" r="80%">
          <stop offset="0%" stopColor="#a85a1b" />
          <stop offset="55%" stopColor="#7a3f10" />
          <stop offset="100%" stopColor="#3e1f06" />
        </radialGradient>
      </defs>
      {/* Shadow */}
      <ellipse cx="42" cy="56" rx="28" ry="3" fill="rgba(0,0,0,0.25)" />
      {/* Football body */}
      <ellipse
        cx="40"
        cy="30"
        rx="34"
        ry="20"
        fill={`url(#${id}-leather)`}
        stroke="#0f1318"
        strokeWidth="2.5"
      />
      {/* Top highlight */}
      <ellipse
        cx="28"
        cy="20"
        rx="14"
        ry="6"
        fill="#fff2d4"
        opacity="0.18"
      />
      {/* End stripes */}
      <path
        d="M 12 28 q 0 2 0 4"
        stroke="#fff2d4"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      <path
        d="M 68 28 q 0 2 0 4"
        stroke="#fff2d4"
        strokeWidth="2"
        fill="none"
        opacity="0.6"
      />
      {/* Lacing — main rib */}
      <line
        x1="32"
        y1="30"
        x2="48"
        y2="30"
        stroke="#fff2d4"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      {/* Lacing — crossbars */}
      <g stroke="#fff2d4" strokeWidth="2" strokeLinecap="round">
        <line x1="35" y1="27" x2="35" y2="33" />
        <line x1="38" y1="27" x2="38" y2="33" />
        <line x1="42" y1="27" x2="42" y2="33" />
        <line x1="45" y1="27" x2="45" y2="33" />
      </g>
    </svg>
  );
}
