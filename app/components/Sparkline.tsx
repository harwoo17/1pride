"use client";

import { useState } from "react";

// Inline trend chart for table rows. Pure SVG, no chart library.
// On hover, an absolute-positioned tooltip shows the value + label of
// the nearest data point. Native <title> wasn't an option in React 19
// — it gets auto-hoisted to <head> as document metadata.

interface SparklineProps {
  values: number[];
  width?: number;
  height?: number;
  color?: string;
  fill?: string;
  /** Optional labels for each data point — surfaced in the tooltip. */
  labels?: string[];
  /** Suffix appended to the tooltip value, e.g. "yds" or "%". */
  unitSuffix?: string;
}

export function Sparkline({
  values,
  width = 96,
  height = 28,
  color = "#0076B6",
  fill = "rgba(0,118,182,0.15)",
  labels,
  unitSuffix = "",
}: SparklineProps) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  if (values.length < 2) {
    return <span className="font-mono text-[10px] text-zinc-400">—</span>;
  }

  const min = Math.min(...values, 0);
  const max = Math.max(...values, 1);
  const span = max - min || 1;
  const pad = 3;

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

  const formatValue = (v: number) =>
    v.toFixed(v % 1 === 0 ? 0 : 1);

  return (
    <div className="relative inline-block" style={{ width, height }}>
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label={`Weekly trend, ${values.length} data points, max ${Math.round(max)}, min ${Math.round(min)}`}
        className="overflow-visible"
      >
        <path d={areaPath} fill={fill} />
        <path d={linePath} fill="none" stroke={color} strokeWidth={1.5} />

        {/* Data points: small visible dot + bigger transparent hit zone */}
        {points.map(([x, y], i) => (
          <g key={i}>
            <circle
              cx={x}
              cy={y}
              r={hoverIdx === i ? 4.5 : 2.5}
              fill={color}
              className="transition-all duration-150 ease-out"
            />
            <circle
              cx={x}
              cy={y}
              r={7}
              fill="transparent"
              className="cursor-help"
              onMouseEnter={() => setHoverIdx(i)}
              onMouseLeave={() => setHoverIdx(null)}
            />
          </g>
        ))}

        {/* Terminal halo */}
        <circle
          cx={lastX}
          cy={lastY}
          r={4.5}
          fill={color}
          fillOpacity={0.25}
          className="pointer-events-none"
        />
      </svg>

      {hoverIdx !== null && (
        <div
          className="pointer-events-none absolute z-20 whitespace-nowrap rounded-sm border border-[var(--lions-blue-deep)] bg-[var(--lions-blue-deep)] px-2 py-1 font-mono text-[10px] font-bold text-white shadow-md"
          style={{
            left: points[hoverIdx][0],
            top: points[hoverIdx][1] - 24,
            transform: "translateX(-50%)",
          }}
        >
          {labels?.[hoverIdx] ? `${labels[hoverIdx]} · ` : ""}
          {formatValue(values[hoverIdx])}
          {unitSuffix ? ` ${unitSuffix}` : ""}
        </div>
      )}
    </div>
  );
}
