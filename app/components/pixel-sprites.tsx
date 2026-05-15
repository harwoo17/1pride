// Pixel-art lion HEAD sprites for the 1PRIDE intro. No bodies, no human
// references. Pure SVG with crisp-edge rendering so the pixels stay
// chunky at any scale.

const PALETTE = {
  // Mane — earth tones, intentionally not the team palette (it's still a
  // lion, after all). Team color lives in the surrounding UI.
  mane: "#7a3f10",
  manelt: "#b06a25",
  fur: "#f4b86a",
  furlt: "#fcd58c",
  furdk: "#d09246",
  // Features
  eye: "#0f1318",
  nose: "#3a1f10",
  mouth: "#3a1f10",
  tongue: "#d54e74",
  // Team accents — used for ribbons / collar pixels
  blue: "#0076b6",
  silver: "#b0b7bc",
  white: "#ffffff",
  charcoal: "#0f1318",
} as const;

type C = keyof typeof PALETTE;
type Sprite = readonly (readonly (C | " ")[])[];

// 16×16 lion head. Round face, starburst mane, two big eyes,
// triangle nose, open mouth.
function makeHead(state: "normal" | "bonked"): Sprite {
  const M: C = "mane";
  const m: C = "manelt";
  const F: C = "fur";
  const f: C = "furlt";
  const d: C = "furdk";
  const E: C = "eye";
  const N: C = "nose";
  const O: C = "mouth";
  const T: C = "tongue";
  const _ = " " as const;

  if (state === "normal") {
    return [
      [_, _, _, _, M, M, M, M, M, M, _, _, _, _, _, _],
      [_, _, M, M, m, M, M, m, M, M, M, M, _, _, _, _],
      [_, M, M, m, M, m, M, m, M, m, M, m, M, M, _, _],
      [_, M, m, F, F, F, F, F, F, F, F, F, m, M, _, _],
      [M, m, F, F, f, F, F, F, F, F, F, F, F, F, m, M],
      [M, F, F, F, F, F, F, F, F, F, F, F, F, F, F, M],
      [M, F, F, E, E, F, F, F, F, F, F, E, E, F, F, M],
      [M, F, F, E, E, F, F, f, f, F, F, E, E, F, F, M],
      [M, F, F, F, F, F, F, F, F, F, F, F, F, F, F, M],
      [M, f, F, F, F, F, F, N, N, F, F, F, F, F, F, M],
      [M, F, F, F, F, F, N, N, N, N, F, F, F, F, F, M],
      [M, F, F, F, F, O, O, T, T, O, O, F, F, F, F, M],
      [M, F, F, F, F, F, O, O, O, O, F, F, F, F, F, M],
      [_, M, F, F, d, F, F, F, F, F, F, d, F, F, M, _],
      [_, _, M, m, M, M, m, M, M, m, M, M, m, M, _, _],
      [_, _, _, M, M, M, m, M, M, m, M, M, M, _, _, _],
    ];
  }

  // bonked: X-eyes, wide-open shock mouth, slight wobble in mane
  return [
    [_, _, _, _, M, M, M, M, M, M, _, _, _, _, _, _],
    [_, _, M, M, m, M, m, m, M, M, M, M, _, _, _, _],
    [_, M, M, m, M, M, m, M, m, M, m, M, M, M, _, _],
    [_, M, m, F, F, F, F, F, F, F, F, F, m, M, _, _],
    [M, m, F, F, f, F, F, F, F, F, F, F, F, F, m, M],
    [M, F, F, F, F, F, F, F, F, F, F, F, F, F, F, M],
    // X eyes (3 wide × 3 tall on each side)
    [M, F, F, E, F, E, F, F, F, F, E, F, E, F, F, M],
    [M, F, F, F, E, F, F, F, F, F, F, E, F, F, F, M],
    [M, F, F, E, F, E, F, F, F, F, E, F, E, F, F, M],
    [M, f, F, F, F, F, F, N, N, F, F, F, F, F, F, M],
    [M, F, F, F, F, F, N, N, N, N, F, F, F, F, F, M],
    // shock-O mouth
    [M, F, F, F, O, O, O, O, O, O, O, O, F, F, F, M],
    [M, F, F, F, O, F, F, F, F, F, F, O, F, F, F, M],
    [_, M, F, F, O, O, O, O, O, O, O, O, F, F, M, _],
    [_, _, M, m, M, M, m, M, M, m, M, M, m, M, _, _],
    [_, _, _, M, M, M, m, M, M, m, M, M, M, _, _, _],
  ];
}

// Football — small, brown leather + white laces.
const football: Sprite = (() => {
  const B: C = "mane"; // re-use brown
  const b: C = "manelt";
  const L: C = "white";
  const _ = " ";
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
  state: "normal" | "bonked";
  scale?: number;
}) {
  return renderSprite(makeHead(state), scale, `lion-${state}`);
}

export function PixelFootball({ scale = 7 }: { scale?: number }) {
  return renderSprite(football, scale, "ball");
}
