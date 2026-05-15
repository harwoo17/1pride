// Pixel-art sprites for the 1PRIDE intro. Pure SVG with crisp-edge
// rendering so the pixels stay chunky at any scale. Two distinct lion
// designs (not modeled on any real person), one football, hard-hat
// variant overlay for the recover beat.

const PALETTE = {
  mane: "#8a4a17", // dark Honolulu-adjacent brown
  manelt: "#c2772a", // lighter mane highlight
  fur: "#f4b86a", // tan face
  furlt: "#fcd58c", // highlight
  eye: "#0f1318",
  blue: "#0076b6",
  silver: "#b0b7bc",
  white: "#ffffff",
  pink: "#ff6b9a", // tongue
  hardhat: "#ffcb05",
  hardhatdk: "#c89500",
  brown: "#7a4214",
  brownlt: "#b96d28",
  lace: "#f4ead4",
  charcoal: "#0f1318",
} as const;

type C = keyof typeof PALETTE;
type Sprite = readonly (readonly (C | " ")[])[];

const lionNormal = (accent: C): Sprite => {
  const M: C = "mane";
  const m: C = "manelt";
  const F: C = "fur";
  const f: C = "furlt";
  const E: C = "eye";
  const A: C = accent;
  const _ = " ";
  return [
    // 12 wide × 12 tall — chunky head-and-shoulders mascot
    [_, _, M, M, M, M, M, M, _, _, _, _],
    [_, M, m, M, m, M, M, m, M, _, _, _],
    [M, m, F, F, f, f, F, F, m, M, _, _],
    [M, F, F, f, E, F, F, E, F, M, _, _],
    [M, F, f, F, F, F, F, F, F, F, M, _],
    [M, F, F, F, F, "pink", "pink", F, F, F, M, _],
    [_, M, F, F, F, F, F, F, F, M, _, _],
    [_, _, M, M, m, M, M, m, M, _, _, _],
    [_, _, A, A, A, A, A, A, _, _, _, _],
    [_, A, A, A, A, A, A, A, A, _, _, _],
    [_, A, A, A, A, A, A, A, A, _, _, _],
    [_, A, _, _, _, _, _, _, A, _, _, _],
  ];
};

const lionBonked = (accent: C): Sprite => {
  const M: C = "mane";
  const m: C = "manelt";
  const F: C = "fur";
  const f: C = "furlt";
  const E: C = "eye";
  const A: C = accent;
  const _ = " ";
  return [
    // mane gets a small "stars" tweak, eyes become X (4-pixel pattern)
    [_, _, M, M, M, M, M, M, _, _, _, _],
    [_, M, m, M, m, M, M, m, M, _, _, _],
    [M, m, F, F, f, f, F, F, m, M, _, _],
    // X eyes: two diagonal pixels each, offset
    [M, F, E, f, E, F, F, E, f, E, _, _],
    [M, F, F, F, F, F, F, F, F, F, M, _],
    // open mouth (stunned)
    [M, F, F, F, "eye", "eye", "eye", F, F, F, M, _],
    [_, M, F, F, "eye", "pink", "eye", F, F, M, _, _],
    [_, _, M, M, "eye", "eye", "eye", m, M, _, _, _],
    [_, _, A, A, A, A, A, A, _, _, _, _],
    [_, A, A, A, A, A, A, A, A, _, _, _],
    [_, A, A, A, A, A, A, A, A, _, _, _],
    [_, A, _, _, _, _, _, _, A, _, _, _],
  ];
};

const lionHardhat = (accent: C): Sprite => {
  const M: C = "mane";
  const m: C = "manelt";
  const F: C = "fur";
  const f: C = "furlt";
  const E: C = "eye";
  const A: C = accent;
  const H: C = "hardhat";
  const h: C = "hardhatdk";
  const _ = " ";
  return [
    [_, _, h, h, h, h, h, h, _, _, _, _],
    [_, h, H, H, H, H, H, H, h, _, _, _],
    [h, H, H, H, H, H, H, H, H, h, _, _],
    [_, M, F, F, f, f, F, F, m, M, _, _],
    [M, F, F, f, E, F, F, E, F, M, _, _],
    [M, F, f, F, F, F, F, F, F, F, M, _],
    [M, F, F, F, F, "pink", "pink", F, F, F, M, _],
    [_, M, F, F, F, F, F, F, F, M, _, _],
    [_, _, A, A, A, A, A, A, _, _, _, _],
    [_, A, A, A, A, A, A, A, A, _, _, _],
    [_, A, A, A, A, A, A, A, A, _, _, _],
    [_, A, _, _, _, _, _, _, A, _, _, _],
  ];
};

const football: Sprite = (() => {
  const B: C = "brown";
  const b: C = "brownlt";
  const L: C = "lace";
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
  accent = "blue",
  scale = 6,
}: {
  state: "normal" | "bonked" | "hardhat";
  accent?: "blue" | "silver";
  scale?: number;
}) {
  const grid =
    state === "bonked"
      ? lionBonked(accent)
      : state === "hardhat"
        ? lionHardhat(accent)
        : lionNormal(accent);
  return renderSprite(grid, scale, `lion-${state}-${accent}`);
}

export function PixelFootball({ scale = 5 }: { scale?: number }) {
  return renderSprite(football, scale, "ball");
}
