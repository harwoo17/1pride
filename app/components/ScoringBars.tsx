"use client";

import { useState } from "react";
import type { WeeklyGame } from "@/lib/api";

const TEAM_NAMES: Record<string, string> = {
  ARI: "Cardinals", ATL: "Falcons", BAL: "Ravens", BUF: "Bills",
  CAR: "Panthers", CHI: "Bears", CIN: "Bengals", CLE: "Browns",
  DAL: "Cowboys", DEN: "Broncos", DET: "Lions", GB: "Packers",
  HOU: "Texans", IND: "Colts", JAX: "Jaguars", KC: "Chiefs",
  LA: "Rams", LAC: "Chargers", LV: "Raiders", MIA: "Dolphins",
  MIN: "Vikings", NE: "Patriots", NO: "Saints", NYG: "Giants",
  NYJ: "Jets", PHI: "Eagles", PIT: "Steelers", SEA: "Seahawks",
  SF: "49ers", TB: "Buccaneers", TEN: "Titans", WAS: "Commanders",
};

/**
 * Interactive paired-bar chart for Lions weekly scoring. Each bar pair
 * (Detroit points vs opponent points) reveals a tooltip on hover with
 * the full game line.
 */
export function ScoringBars({ games }: { games: WeeklyGame[] }) {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);
  const max = Math.max(...games.flatMap((g) => [g.scored, g.allowed]));

  return (
    <div className="relative grid grid-cols-[40px_1fr] gap-2 p-4 sm:gap-3 sm:p-6">
      {/* Y-axis ticks */}
      <div className="flex flex-col-reverse justify-between text-right font-mono text-[10px] text-[var(--lions-silver-dark)]">
        <div>0</div>
        <div>{Math.ceil(max / 2)}</div>
        <div>{max}</div>
      </div>

      <div className="relative">
        <div className="grid grid-flow-col auto-cols-fr items-end gap-1 sm:gap-2">
          {games.map((g, i) => {
            const margin = g.scored - g.allowed;
            const result = margin > 0 ? "W" : margin < 0 ? "L" : "T";
            const isHovered = hoverIdx === i;
            const scoredH = (g.scored / max) * 100;
            const allowedH = (g.allowed / max) * 100;
            return (
              <div
                key={g.week}
                className="group relative flex cursor-help flex-col items-center gap-1"
                onMouseEnter={() => setHoverIdx(i)}
                onMouseLeave={() => setHoverIdx(null)}
              >
                <div className="flex h-[180px] w-full items-end gap-0.5 sm:gap-1">
                  <div
                    className="flex-1 bg-[var(--lions-blue)] transition-all duration-150"
                    style={{
                      height: `${scoredH}%`,
                      opacity: hoverIdx === null || isHovered ? 1 : 0.55,
                    }}
                  />
                  <div
                    className="flex-1 bg-[var(--lions-silver)] transition-all duration-150"
                    style={{
                      height: `${allowedH}%`,
                      opacity: hoverIdx === null || isHovered ? 1 : 0.55,
                    }}
                  />
                </div>
                <div className="font-display text-[9px] font-bold uppercase tracking-wider text-[var(--lions-silver-dark)] sm:text-[10px]">
                  W{g.week}
                </div>
                <div
                  className={`font-display text-[9px] font-bold sm:text-[10px] ${
                    result === "W"
                      ? "text-[var(--lions-blue)]"
                      : "text-zinc-400"
                  }`}
                >
                  {g.opp}
                </div>
              </div>
            );
          })}
        </div>

        {/* Hover tooltip — positioned above the active bar pair */}
        {hoverIdx !== null && (
          <div
            className="pointer-events-none absolute -top-2 z-20 -translate-x-1/2 -translate-y-full whitespace-nowrap rounded-sm border-2 border-[var(--lions-blue-deep)] bg-white px-3 py-2 font-display text-xs tabular shadow-lg"
            style={{
              left: `${((hoverIdx + 0.5) / games.length) * 100}%`,
            }}
          >
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--lions-silver-dark)]">
              Week {games[hoverIdx].week} ·{" "}
              {TEAM_NAMES[games[hoverIdx].opp] ?? games[hoverIdx].opp}
            </div>
            <div className="mt-1 flex items-center gap-2 text-sm font-bold">
              <span className="text-[var(--lions-blue)]">
                DET {games[hoverIdx].scored}
              </span>
              <span className="text-zinc-400">·</span>
              <span className="text-[var(--lions-charcoal)]">
                {games[hoverIdx].opp} {games[hoverIdx].allowed}
              </span>
              <span
                className={`ml-2 font-black ${
                  games[hoverIdx].scored > games[hoverIdx].allowed
                    ? "text-[var(--lions-blue)]"
                    : games[hoverIdx].scored < games[hoverIdx].allowed
                      ? "text-zinc-500"
                      : "text-[var(--lions-silver-dark)]"
                }`}
              >
                {games[hoverIdx].scored > games[hoverIdx].allowed ? "+" : ""}
                {games[hoverIdx].scored - games[hoverIdx].allowed}
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
