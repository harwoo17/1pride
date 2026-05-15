// Pixel-art lion HEAD sprites for the 1PRIDE intro. Head-only, 16×16,
// five expressions mapped to intro phases. No bodies, no human refs.

const PALETTE = {
  mane: "#7a3f10",
  manelt: "#b06a25",
  fur: "#f4b86a",
  furlt: "#fcd58c",
  furdk: "#d09246",
  eye: "#0f1318",
  nose: "#3a1f10",
  mouth: "#3a1f10",
  tongue: "#d54e74",
  white: "#ffffff",
  charcoal: "#0f1318",
} as const;

type C = keyof typeof PALETTE;
type Cell = C | " ";
type Row = readonly Cell[];
type Sprite = readonly Row[];

// Short aliases so the sprite arrays read like art, not code.
const M: C = "mane";
const m: C = "manelt";
const F: C = "fur";
const f: C = "furlt";
const d: C = "furdk";
const E: C = "eye";
const N: C = "nose";
const O: C = "mouth";
const T: C = "tongue";
const _: " " = " ";

// ─── HEAD BASE (rows shared across every expression) ───────────────────────

const BASE_TOP: Sprite = [
  [_, _, _, _, M, M, M, M, M, M, _, _, _, _, _, _],
  [_, _, M, M, m, M, M, m, M, M, M, M, _, _, _, _],
  [_, M, M, m, M, m, M, m, M, m, M, m, M, M, _, _],
  [_, M, m, F, F, F, F, F, F, F, F, F, m, M, _, _],
  [M, m, F, F, f, F, F, F, F, F, F, F, F, F, m, M],
];

const BLANK_ROW_5: Row = [
  M, F, F, F, F, F, F, F, F, F, F, F, F, F, F, M,
];

const NOSE_ROWS: Sprite = [
  // row 9 — left cheek highlight + nose tip
  [M, f, F, F, F, F, F, N, N, F, F, F, F, F, F, M],
  // row 10 — nose bridge
  [M, F, F, F, F, F, N, N, N, N, F, F, F, F, F, M],
];

const BASE_BOTTOM: Sprite = [
  [_, M, F, F, d, F, F, F, F, F, F, d, F, F, M, _],
  [_, _, M, m, M, M, m, M, M, m, M, M, m, M, _, _],
  [_, _, _, M, M, M, m, M, M, m, M, M, M, _, _, _],
];

// ─── EXPRESSIONS ───────────────────────────────────────────────────────────

export type LionExpression =
  | "ready"
  | "alert"
  | "stunned"
  | "dazed"
  | "determined";

interface Look {
  row5?: Row;          // optional eyebrow row replacement
  eyes: Sprite;        // rows 6, 7, 8
  mouth: Sprite;       // rows 11, 12
}

const LOOKS: Record<LionExpression, Look> = {
  // Chill, mid-yawn ready stance — soft pupils, light closed-mouth smile.
  ready: {
    eyes: [
      [M, F, F, F, F, F, F, F, F, F, F, F, F, F, F, M],
      [M, F, F, F, E, F, F, f, f, F, F, F, E, F, F, M],
      [M, F, F, F, E, F, F, F, F, F, F, F, E, F, F, M],
    ],
    mouth: [
      [M, F, F, F, F, O, O, T, T, O, O, F, F, F, F, M],
      [M, F, F, F, F, F, O, O, O, O, F, F, F, F, F, M],
    ],
  },

  // Wide-open surprise — "incoming!" — whites of the eyes visible.
  alert: {
    eyes: [
      [M, F, F, E, E, E, F, F, F, F, E, E, E, F, F, M],
      [M, F, F, E, "white", E, F, f, f, F, E, "white", E, F, F, M],
      [M, F, F, E, E, E, F, F, F, F, E, E, E, F, F, M],
    ],
    mouth: [
      [M, F, F, F, F, F, F, O, O, F, F, F, F, F, F, M],
      [M, F, F, F, F, F, O, T, T, O, F, F, F, F, F, M],
    ],
  },

  // Bonked — classic cartoon X eyes + shock-O mouth.
  stunned: {
    eyes: [
      [M, F, F, E, F, E, F, F, F, F, E, F, E, F, F, M],
      [M, F, F, F, E, F, F, f, f, F, F, E, F, F, F, M],
      [M, F, F, E, F, E, F, F, F, F, E, F, E, F, F, M],
    ],
    mouth: [
      [M, F, F, F, O, O, O, O, O, O, O, O, F, F, F, M],
      [M, F, F, F, O, F, F, F, F, F, F, O, F, F, F, M],
    ],
  },

  // Shaking it off — left eye slit-closed, right eye dazed-box, tongue out.
  dazed: {
    eyes: [
      [M, F, F, F, E, F, F, F, F, F, F, E, E, E, F, M],
      [M, F, F, E, E, E, F, f, f, F, F, E, F, E, F, M],
      [M, F, F, F, E, F, F, F, F, F, F, E, E, E, F, M],
    ],
    mouth: [
      [M, F, F, F, F, O, O, O, O, F, F, F, F, F, F, M],
      [M, F, F, F, F, F, F, T, T, T, F, F, F, F, F, M],
    ],
  },

  // Fired up — heavy eyebrows down, narrow slits, gritted teeth.
  determined: {
    row5: [M, F, E, E, F, F, F, F, F, F, F, F, E, E, F, M],
    eyes: [
      [M, F, F, F, E, E, F, F, F, F, E, E, F, F, F, M],
      [M, F, F, E, E, F, F, f, f, F, F, E, E, F, F, M],
      [M, F, F, F, F, F, F, F, F, F, F, F, F, F, F, M],
    ],
    mouth: [
      [M, F, F, F, O, O, O, O, O, O, O, O, F, F, F, M],
      [M, F, F, F, O, F, O, F, O, F, O, F, F, F, F, M],
    ],
  },
};

function makeHead(expr: LionExpression): Sprite {
  const look = LOOKS[expr];
  return [
    ...BASE_TOP,
    look.row5 ?? BLANK_ROW_5,
    ...look.eyes,
    ...NOSE_ROWS,
    ...look.mouth,
    ...BASE_BOTTOM,
  ];
}

// ─── FOOTBALL ──────────────────────────────────────────────────────────────

const football: Sprite = (() => {
  const B: C = "mane";
  const b: C = "manelt";
  const L: C = "white";
  return [
    [_, _, _, B, B, B, _, _],
    [_, _, B, b, b, B, B, _],
    [_, B, b, b, L, b, B, _],
    [B, b, b, L, L, L, b, B],
    [B, b, L, L, L, b, b, B],
    [_, B, b, L, b, b, B, _],
    [_, _, B, b, b, B, B, _],
    [_, _, _, B, B, B, _, _],
  ];
})();

// ─── RENDERER ──────────────────────────────────────────────────────────────

function renderSprite(grid: Sprite, scale: number, idPrefix: string) {
  const h = grid.length;
  const w = grid[0]?.length ?? 0;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      width={w * scale}
      height={h * scale}
      shapeRendering="crispEdges"
      style={{ imageRendering: "pixelated" }}
      aria-hidden="true"
    >
      {grid.map((row, y) =>
        row.map((cell, x) =>
          cell === " " ? null : (
            <rect
              key={`${idPrefix}-${x}-${y}`}
              x={x}
              y={y}
              width={1}
              height={1}
              fill={PALETTE[cell as C]}
            />
          ),
        ),
      )}
    </svg>
  );
}

export function PixelLion({
  state,
  scale = 14,
}: {
  state: LionExpression;
  scale?: number;
}) {
  return renderSprite(makeHead(state), scale, `lion-${state}`);
}

export function PixelFootball({ scale = 7 }: { scale?: number }) {
  return renderSprite(football, scale, "ball");
}
