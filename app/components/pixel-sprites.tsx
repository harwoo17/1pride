"use client";

import { useId } from "react";

// Stylized varsity-logo lion. Bold profile silhouette, two flat colors
// + clean outline + accent silver mane peaks. Embraces SVG's strength
// (flat vector, sharp edges) instead of fighting it (photo-real plush).
//
// Five expressions vary the EYE only — the silhouette stays consistent
// like a real team mark.
//
// Filename retained for back-compat with existing imports.

const C = {
  outline: "#000000",
  base: "#0076b6",          // Honolulu Blue — body of the lion
  baseShadow: "#00558a",
  baseDeep: "#00558a", /* navy stripped — use blue-dark for shadow depth */
  highlight: "#b3d8ec",
  silver: "#b0b7bc",
  silverDark: "#6a7178",
  // Mane-peak accent. Kept the `gold`/`goldDeep` keys for back-compat with
  // the SVG refs below, but the palette is now silver-only (no gold).
  gold: "#d8dde0",
  goldDeep: "#8a9095",
  white: "#ffffff",
  ink: "#0a1929",
} as const;

export type LionExpression =
  | "ready"
  | "alert"
  | "stunned"
  | "dazed"
  | "determined";

// ─── LION HEAD (heraldic / varsity profile) ────────────────────────────────

export function PixelLion({
  state,
  scale = 14,
}: {
  state: LionExpression;
  scale?: number;
}) {
  const id = useId();
  const size = 16 * scale;

  return (
    <svg
      viewBox="0 0 320 320"
      width={size}
      height={size}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={`${id}-body`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={C.highlight} stopOpacity="0.65" />
          <stop offset="22%" stopColor={C.base} />
          <stop offset="80%" stopColor={C.base} />
          <stop offset="100%" stopColor={C.baseShadow} />
        </linearGradient>
        <linearGradient id={`${id}-mane`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={C.gold} />
          <stop offset="60%" stopColor={C.gold} />
          <stop offset="100%" stopColor={C.goldDeep} />
        </linearGradient>
        <filter id={`${id}-shadow`} x="-30%" y="-30%" width="160%" height="160%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse
        cx="160"
        cy="298"
        rx="115"
        ry="10"
        fill={C.ink}
        opacity="0.36"
        filter={`url(#${id}-shadow)`}
      />

      {/* Mane — 9-peak silhouette behind the head */}
      <path
        d="
          M 160 26
          C 178 32, 196 28, 208 42
          C 224 46, 240 54, 246 72
          C 264 80, 274 96, 270 116
          C 286 124, 290 144, 282 164
          C 292 180, 286 202, 268 212
          C 268 232, 248 248, 226 246
          C 218 264, 196 270, 176 262
          C 162 274, 138 274, 124 262
          C 104 270, 82 264, 74 246
          C 52 248, 32 232, 32 212
          C 14 202, 8 180, 18 164
          C 10 144, 14 124, 30 116
          C 26 96, 36 80, 54 72
          C 60 54, 76 46, 92 42
          C 104 28, 122 32, 140 26
          C 148 32, 152 32, 160 26
          Z
        "
        fill={`url(#${id}-mane)`}
        stroke={C.outline}
        strokeWidth="4"
        strokeLinejoin="round"
      />

      {/* Mane upper highlight ridges */}
      <g
        stroke={C.white}
        strokeWidth="2.5"
        fill="none"
        strokeLinecap="round"
        opacity="0.55"
      >
        <path d="M 96 58 Q 110 50 124 56" />
        <path d="M 142 36 Q 160 30 178 36" />
        <path d="M 200 58 Q 214 50 226 58" />
      </g>

      {/* Mane lower shadow ridges */}
      <g
        stroke={C.goldDeep}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.6"
      >
        <path d="M 60 200 Q 70 218 86 226" />
        <path d="M 234 226 Q 250 218 260 200" />
        <path d="M 130 264 Q 160 270 190 264" />
      </g>

      {/* Head — Honolulu Blue, in front of the mane */}
      <ellipse
        cx="160"
        cy="172"
        rx="78"
        ry="74"
        fill={`url(#${id}-body)`}
        stroke={C.outline}
        strokeWidth="3.5"
      />

      <ellipse
        cx="128"
        cy="138"
        rx="34"
        ry="32"
        fill={C.highlight}
        opacity="0.6"
      />

      <ellipse
        cx="190"
        cy="208"
        rx="44"
        ry="22"
        fill={C.baseShadow}
        opacity="0.55"
      />

      <path
        d="M 92 188 Q 110 220 144 218"
        stroke={C.outline}
        strokeWidth="3"
        fill="none"
        strokeLinecap="round"
        opacity="0.85"
      />

      <path
        d="M 100 148 Q 160 132 220 148"
        stroke={C.outline}
        strokeWidth="4"
        fill="none"
        strokeLinecap="round"
      />

      <Eyes expr={state} id={id} />

      {/* Snout */}
      <path
        d="M 160 198
           Q 134 196 122 214
           Q 130 234 160 238
           Q 190 234 198 214
           Q 186 196 160 198 Z"
        fill={C.silver}
        stroke={C.outline}
        strokeWidth="3"
        strokeLinejoin="round"
      />
      <ellipse cx="144" cy="208" rx="14" ry="6" fill={C.white} opacity="0.55" />

      {/* Nose */}
      <path
        d="M 160 198 L 148 184 L 172 184 Z"
        fill={C.ink}
        stroke={C.outline}
        strokeWidth="2.5"
        strokeLinejoin="round"
      />
      <ellipse cx="156" cy="188" rx="3" ry="2" fill={C.white} opacity="0.75" />

      <Mouth expr={state} />

      <g
        stroke={C.outline}
        strokeWidth="2"
        fill="none"
        strokeLinecap="round"
        opacity="0.75"
      >
        <path d="M 122 218 Q 108 218 96 224" />
        <path d="M 124 226 Q 110 230 98 238" />
        <path d="M 198 218 Q 212 218 224 224" />
        <path d="M 196 226 Q 210 230 222 238" />
      </g>
    </svg>
  );
}

// ─── EXPRESSIONS — EYES ────────────────────────────────────────────────────

interface EyePos { cx: number; cy: number; }

function Eyes({ expr, id }: { expr: LionExpression; id: string }) {
  const left: EyePos = { cx: 124, cy: 166 };
  const right: EyePos = { cx: 196, cy: 166 };

  switch (expr) {
    case "ready":
      return (
        <>
          <GoldEye id={id} {...left} />
          <GoldEye id={id} {...right} />
        </>
      );
    case "alert":
      return (
        <>
          <GoldEye id={id} {...left} wide />
          <GoldEye id={id} {...right} wide />
        </>
      );
    case "stunned":
      return (
        <>
          <XEye {...left} />
          <XEye {...right} />
        </>
      );
    case "dazed":
      return (
        <>
          <SlitClosed {...left} />
          <Swirl {...right} />
        </>
      );
    case "determined":
      return (
        <>
          <AngryEye id={id} {...left} flip />
          <AngryEye id={id} {...right} />
        </>
      );
  }
}

function GoldEye({
  id: _id,
  cx,
  cy,
  wide,
}: EyePos & { id: string; wide?: boolean }) {
  const rx = wide ? 16 : 13;
  const ry = wide ? 14 : 12;
  return (
    <g>
      <ellipse
        cx={cx}
        cy={cy}
        rx={rx}
        ry={ry}
        fill={C.gold}
        stroke={C.outline}
        strokeWidth="3"
      />
      {/* Vertical slit pupil — predatory varsity-logo look */}
      <ellipse
        cx={cx}
        cy={cy}
        rx={wide ? 4 : 3}
        ry={wide ? 10 : 9}
        fill={C.ink}
      />
      <ellipse cx={cx - 3} cy={cy - 3} rx="2.5" ry="1.6" fill={C.white} />
    </g>
  );
}

function XEye({ cx, cy }: EyePos) {
  const s = 11;
  return (
    <g stroke={C.outline} strokeWidth="4" strokeLinecap="round">
      <line x1={cx - s} y1={cy - s} x2={cx + s} y2={cy + s} />
      <line x1={cx - s} y1={cy + s} x2={cx + s} y2={cy - s} />
    </g>
  );
}

function SlitClosed({ cx, cy }: EyePos) {
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

function Swirl({ cx, cy }: EyePos) {
  return (
    <g stroke={C.outline} strokeWidth="3" fill="none" strokeLinecap="round">
      <circle cx={cx} cy={cy} r="13" />
      <circle cx={cx} cy={cy} r="7" />
    </g>
  );
}

function AngryEye({
  id: _id,
  cx,
  cy,
  flip,
}: EyePos & { id: string; flip?: boolean }) {
  const browTilt = flip ? -8 : 8;
  return (
    <g>
      <path
        d={`M ${cx - 16} ${cy - 14} l 32 ${browTilt} l -2 6 l -28 ${
          flip ? 10 : -6
        } z`}
        fill={C.outline}
        stroke={C.outline}
        strokeWidth="1.5"
        strokeLinejoin="round"
      />
      <ellipse cx={cx} cy={cy + 2} rx="13" ry="6" fill={C.gold} stroke={C.outline} strokeWidth="2.5" />
      <ellipse cx={cx} cy={cy + 2} rx="3" ry="5" fill={C.ink} />
      <ellipse cx={cx - 3} cy={cy} rx="1.5" ry="1" fill={C.white} />
    </g>
  );
}

// ─── MOUTH ─────────────────────────────────────────────────────────────────

function Mouth({ expr }: { expr: LionExpression }) {
  const cy = 250;

  switch (expr) {
    case "ready":
      return (
        <g stroke={C.outline} strokeWidth="3" fill="none" strokeLinecap="round">
          <path d="M 144 254 Q 160 264 176 254" />
        </g>
      );
    case "alert":
      return (
        <g>
          <ellipse cx="160" cy={cy + 4} rx="14" ry="10" fill={C.ink} stroke={C.outline} strokeWidth="2.5" />
          <ellipse cx="160" cy={cy + 6} rx="9" ry="5" fill="#9a2a50" />
        </g>
      );
    case "stunned":
      return (
        <g>
          <ellipse cx="160" cy={cy + 8} rx="20" ry="14" fill={C.ink} stroke={C.outline} strokeWidth="3" />
          <ellipse cx="160" cy={cy + 10} rx="13" ry="8" fill="#9a2a50" />
        </g>
      );
    case "dazed":
      return (
        <g>
          <path
            d="M 138 256 q 14 14 42 4"
            fill={C.ink}
            stroke={C.outline}
            strokeWidth="2.5"
            strokeLinejoin="round"
          />
          <path
            d="M 178 256 q 8 12 12 22 q -6 4 -14 -2 Z"
            fill="#e0577e"
            stroke="#9a2a50"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </g>
      );
    case "determined":
      return (
        <g>
          <path
            d="M 132 252 q 28 16 56 0 v 14 q -28 12 -56 0 z"
            fill={C.ink}
            stroke={C.outline}
            strokeWidth="3"
            strokeLinejoin="round"
          />
          <path
            d="M 136 256 q 24 12 48 0 v 6 q -24 10 -48 0 z"
            fill={C.white}
          />
          <g stroke={C.outline} strokeWidth="1.4">
            <line x1="148" y1="256" x2="148" y2="264" />
            <line x1="160" y1="256" x2="160" y2="264" />
            <line x1="172" y1="256" x2="172" y2="264" />
          </g>
          <path d="M 138 256 l 3 8 l 3 -8 z" fill={C.white} stroke={C.outline} strokeWidth="1" />
          <path d="M 176 256 l 3 8 l 3 -8 z" fill={C.white} stroke={C.outline} strokeWidth="1" />
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
