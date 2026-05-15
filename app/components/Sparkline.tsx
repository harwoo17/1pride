// Inline trend chart for table rows. Pure SVG, no chart library.
// Renders a polyline + a filled area + a terminal dot. Designed to read
// at ~80px wide and ~24px tall, alongside numeric tabular data.

export function Sparkline({
  values,
  width = 96,
  height = 28,
  color = "#0076B6",
  fill = "rgba(0,118,182,0.15)",
}: {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
}) {
  if (values.length < 2) {
    return (
      <span className="font-mono text-[10px] text-zinc-400">—</span>
    );
  }

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = max - min || 1;
  const pad = 2; // breathing room inside the SVG

  const points = values.map((v, i) => {
    const x = pad + (i / (values.length - 1)) * (width - pad * 2);
    const y = height - pad - ((v - min) / span) * (height - pad * 2);
    return [x, y] as const;
  });

  const linePath = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)} ${y.toFixed(1)}`)
    .join(" ");
  const areaPath = `${linePath} L${points[points.length - 1][0].toFixed(1)} ${(
    height - pad
  ).toFixed(1)} L${pad} ${(height - pad).toFixed(1)} Z`;

  const [lastX, lastY] = points[points.length - 1];

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      role="img"
      aria-label={`Weekly trend, ${values.length} data points, max ${max}, min ${min}`}
      className="overflow-visible"
    >
      <path d={areaPath} fill={fill} />
      <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} />
      <circle cx={lastX} cy={lastY} r={2.5} fill={color} />
      <circle cx={lastX} cy={lastY} r={4.5} fill={color} fillOpacity={0.25} />
    </svg>
  );
}
