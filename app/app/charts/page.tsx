import Link from "next/link";
import {
  getFourthDownDecisions,
  getTopReceivers,
  getWeeklyScoring,
  type FourthDownDecision,
  type Receiver,
  type WeeklyGame,
} from "@/lib/api";
import { CountUp } from "@/components/CountUp";
import { FadeIn } from "@/components/FadeIn";
import { ScoringBars } from "@/components/ScoringBars";
import { SkeletonBox } from "@/components/Skeleton";

export const metadata = {
  title: "The Chart Room",
  description:
    "Weekly scoring margin, NFC North receiving leaders, and the 4th-down identity of the Campbell-era Lions. Every chart wired to a FastAPI service over real nflverse data.",
  openGraph: {
    title: "The Chart Room — 1PRIDE",
    description:
      "Lions weekly scoring + WR room + 4th-down EPA. Real data, 2021-present.",
  },
};

export const revalidate = 3600;

const LATEST_SEASON = 2025;

export default async function ChartsPage() {
  const [scoring, receivers, fourth] = await Promise.all([
    getWeeklyScoring(LATEST_SEASON),
    getTopReceivers(LATEST_SEASON, 8),
    getFourthDownDecisions(2022, LATEST_SEASON),
  ]);

  const games = scoring?.games ?? [];

  return (
    <>
      <header className="border-b-2 border-[var(--lions-blue-deep)] bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-baseline gap-3">
            <span className="font-display text-2xl font-black tracking-tight text-[var(--lions-blue)]">
              1PRIDE
            </span>
            <span className="hidden font-display text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lions-silver-dark)] sm:block">
              The Chart Room
            </span>
          </Link>
          <nav className="flex items-center gap-1 font-display text-sm font-semibold uppercase tracking-wider">
            <Link
              href="/"
              className="border-b-2 border-transparent px-2 py-1 hover:border-[var(--lions-blue)]"
            >
              Home
            </Link>
            <a
              href="https://1pride.app"
              className="border-b-2 border-transparent px-2 py-1 hover:border-[var(--lions-blue)]"
            >
              Curriculum
            </a>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-10 px-6 py-10 sm:py-12">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-blue)]">
            <span className="chevron" />
            Live · {LATEST_SEASON} season
          </div>
          <h1 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl md:text-6xl">
            The Chart Room
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Real Lions data, 2021-present. Every chart wired to the FastAPI
            service that reads from the same Postgres your local notebooks
            do.
          </p>
        </div>

        <FadeIn>
          <ScoringChart games={games} />
        </FadeIn>
        <FadeIn>
          <ReceiversChart receivers={receivers?.receivers ?? []} />
        </FadeIn>
        <FadeIn>
          <FourthDownChart decisions={fourth?.decisions ?? []} />
        </FadeIn>
      </main>

      <footer className="border-t-2 border-[var(--lions-gold)] bg-[var(--lions-blue-deep)] text-[var(--lions-silver-light)]/85">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-display font-bold text-white">1PRIDE</span> ·
            Lions analytics. Not affiliated with the Detroit Lions or the NFL.
          </div>
          <div className="font-mono text-[10px] tracking-wider text-[var(--lions-silver-light)]/65">
            L5 CAPSTONE · v0.4
          </div>
        </div>
      </footer>
    </>
  );
}

// ─── SCORING CHART ─────────────────────────────────────────────────────────

function ScoringChart({ games }: { games: WeeklyGame[] }) {
  if (!games.length) return <ChartSkeleton label="Scoring Margin" rows={3} />;

  const wins = games.filter((g) => g.scored > g.allowed).length;
  const losses = games.filter((g) => g.scored < g.allowed).length;
  const pf = games.reduce((s, g) => s + g.scored, 0);
  const pa = games.reduce((s, g) => s + g.allowed, 0);
  const diff = pf - pa;

  return (
    <section>
      <ChartHeader
        label={`Weekly · Season ${LATEST_SEASON}`}
        title="Scoring Margin"
        sub="Lions points scored vs allowed, week by week. Hover any bar pair for the line."
      />

      <div className="mb-3 grid grid-cols-2 gap-0 overflow-hidden rounded-sm border-2 border-[var(--lions-blue-deep)] sm:grid-cols-4">
        <SummaryStat label="Record" value={`${wins}–${losses}`} />
        <SummaryStat label="Points For" countTo={pf} />
        <SummaryStat label="Points Against" countTo={pa} />
        <SummaryStat
          label="Diff"
          countTo={diff}
          countPrefix={diff > 0 ? "+" : ""}
          accentBlue={diff >= 0}
        />
      </div>

      <div className="card-lift border-2 border-[var(--lions-blue-deep)] bg-white">
        <ScoringBars games={games} />
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-zinc-200 px-6 py-3 text-xs font-display font-semibold uppercase tracking-wider">
          <Swatch color="var(--lions-blue)" label="Scored" />
          <Swatch color="var(--lions-silver)" label="Allowed" />
          <span className="ml-auto font-mono text-[10px] normal-case tracking-wider text-[var(--lions-silver-dark)]">
            Source: nflverse
          </span>
        </div>
      </div>
    </section>
  );
}

function SummaryStat({
  label,
  value,
  countTo,
  countPrefix,
  countDecimals,
  accentBlue,
}: {
  label: string;
  value?: string | number;
  countTo?: number;
  countPrefix?: string;
  countDecimals?: number;
  accentBlue?: boolean;
}) {
  return (
    <div className="bg-white p-3 ring-1 ring-zinc-100">
      <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--lions-silver-dark)]">
        {label}
      </div>
      <div
        className={`font-display text-2xl font-black tabular ${
          accentBlue ? "text-[var(--lions-blue)]" : "text-[var(--lions-charcoal)]"
        }`}
      >
        {countTo !== undefined ? (
          <CountUp
            to={countTo}
            decimals={countDecimals}
            prefix={countPrefix}
          />
        ) : (
          value
        )}
      </div>
    </div>
  );
}

// ─── RECEIVERS CHART ───────────────────────────────────────────────────────

function ReceiversChart({ receivers }: { receivers: Receiver[] }) {
  if (!receivers.length) return <ChartSkeleton label="WR Room" rows={6} />;
  const max = Math.max(...receivers.map((r) => r.yards));
  const top = receivers[0];
  const totalYards = receivers.reduce((s, r) => s + (r.yards ?? 0), 0);
  const lastName = top.name.split(" ").slice(-1)[0];

  return (
    <section>
      <ChartHeader
        label={`Position · Season ${LATEST_SEASON}`}
        title="The WR Room"
        sub="Receiving leaders sorted by total yards."
      />

      <div className="mb-3 grid grid-cols-2 gap-0 overflow-hidden rounded-sm border-2 border-[var(--lions-blue-deep)] sm:grid-cols-3">
        <SummaryStat label="Top Target" value={lastName} />
        <SummaryStat label="Top-1 Yards" countTo={top.yards} />
        <SummaryStat label="Room Total" countTo={totalYards} />
      </div>

      <div className="card-lift border-2 border-[var(--lions-blue-deep)] bg-white">
        <div className="divide-y divide-zinc-100">
          {receivers.map((r, i) => (
            <div
              key={r.name}
              className="grid grid-cols-[140px_1fr_56px] items-center gap-3 px-4 py-3 font-display sm:grid-cols-[180px_1fr_60px] sm:px-6"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--lions-silver-dark)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="min-w-0">
                  <div className="truncate text-sm font-bold uppercase tracking-tight">
                    {r.name}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--lions-silver-dark)]">
                    {r.position} · {r.games}G
                  </div>
                </div>
              </div>
              <div className="relative h-8 overflow-hidden bg-zinc-100">
                <div
                  className="h-full bg-[var(--lions-blue)] transition-all duration-300"
                  style={{ width: `${(r.yards / max) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center px-3 text-xs font-bold uppercase text-white mix-blend-difference tabular">
                  {r.catches}/{r.targets} · {r.tds ?? 0} TD
                </div>
              </div>
              <div className="text-right text-2xl font-black tabular">
                {Math.round(r.yards)}
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-3 font-mono text-[10px] tracking-wider text-[var(--lions-silver-dark)]">
          <span>Bar width = receiving yards</span>
          <span>Source: nflverse</span>
        </div>
      </div>
    </section>
  );
}

// ─── 4TH DOWN ──────────────────────────────────────────────────────────────

function FourthDownChart({ decisions }: { decisions: FourthDownDecision[] }) {
  if (!decisions.length) return <ChartSkeleton label="4th Down" rows={1} />;
  const total = decisions.reduce((s, d) => s + d.plays, 0);
  const go = decisions
    .filter((d) => d.play_type === "pass" || d.play_type === "run")
    .reduce((s, d) => s + d.plays, 0);
  const goPct = total ? Math.round((go / total) * 100) : 0;

  const labels: Record<string, string> = {
    pass: "Pass",
    run: "Run",
    field_goal: "Field Goal",
    punt: "Punt",
  };
  const colors = [
    "var(--lions-blue)",
    "var(--lions-blue-dark)",
    "var(--lions-silver)",
    "var(--lions-silver-dark)",
  ];

  return (
    <section>
      <ChartHeader
        label="Decision · 2022–2025"
        title="4th Down Identity"
        sub={`${total} Lions 4th-down plays over four seasons of the Campbell era.`}
      />

      <div className="mb-3 grid grid-cols-2 gap-0 overflow-hidden rounded-sm border-2 border-[var(--lions-blue-deep)] sm:grid-cols-3">
        <SummaryStat label="Total Plays" countTo={total} />
        <SummaryStat label="Go-For-It" countTo={go} />
        <SummaryStat label="Go Rate" countTo={goPct} accentBlue />
      </div>

      <div className="card-lift border-2 border-[var(--lions-blue-deep)] bg-white">
        <div className="flex h-12 overflow-hidden border-b border-zinc-200">
          {decisions.map((d, i) => {
            const pct = (d.plays / total) * 100;
            return (
              <div
                key={d.play_type}
                className="flex items-center justify-center font-display text-xs font-bold uppercase tracking-wider text-white"
                style={{
                  width: `${pct}%`,
                  backgroundColor: colors[i] ?? "var(--lions-charcoal)",
                }}
              >
                {pct >= 8 && `${pct.toFixed(0)}%`}
              </div>
            );
          })}
        </div>
        <div className="grid grid-cols-2 gap-px bg-zinc-100 sm:grid-cols-4">
          {decisions.map((d) => (
            <div key={d.play_type} className="bg-white p-4">
              <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[var(--lions-silver-dark)]">
                {labels[d.play_type] ?? d.play_type}
              </div>
              <div className="font-display text-4xl font-black tabular text-[var(--lions-charcoal)]">
                <CountUp to={d.plays} />
              </div>
              <div className="mt-2 grid gap-1 font-mono text-[10px] tabular text-[var(--lions-silver-dark)]">
                <div>
                  AVG TO-GO{" "}
                  <span className="font-bold text-[var(--lions-charcoal)]">
                    {d.avg_ydstogo}
                  </span>
                </div>
                <div>
                  AVG YL{" "}
                  <span className="font-bold text-[var(--lions-charcoal)]">
                    {d.avg_yardline}
                  </span>
                </div>
                <div>
                  EPA/PLAY{" "}
                  <span
                    className={`font-bold ${
                      Number(d.avg_epa) >= 0
                        ? "text-[var(--lions-blue)]"
                        : "text-red-700"
                    }`}
                  >
                    {Number(d.avg_epa) >= 0 ? "+" : ""}
                    {d.avg_epa}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="flex items-center justify-between border-t border-zinc-200 px-6 py-3 font-mono text-[10px] tracking-wider text-[var(--lions-silver-dark)]">
          <span>EPA = expected points added per play</span>
          <span>Source: nflverse</span>
        </div>
      </div>
    </section>
  );
}

// ─── PRIMITIVES ────────────────────────────────────────────────────────────

function ChartHeader({
  label,
  title,
  sub,
}: {
  label: string;
  title: string;
  sub: string;
}) {
  return (
    <div className="mb-4">
      <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-blue)]">
        <span className="chevron" />
        {label}
      </div>
      <h2 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
        {title}
      </h2>
      <p className="mt-1 max-w-xl text-sm text-zinc-500">{sub}</p>
    </div>
  );
}

function Swatch({ color, label }: { color: string; label: string }) {
  return (
    <div className="flex items-center gap-2">
      <span
        className="inline-block h-3 w-3"
        style={{ backgroundColor: color }}
      />
      {label}
    </div>
  );
}

function ChartSkeleton({ label, rows = 4 }: { label: string; rows?: number }) {
  return (
    <section>
      <div className="mb-4">
        <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-silver-dark)]">
          <span className="chevron" />
          Loading
        </div>
        <h2 className="font-display text-2xl font-black uppercase tracking-tight sm:text-3xl">
          {label}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Waiting on the FastAPI service…
        </p>
      </div>
      <div className="space-y-3 border-2 border-zinc-200 bg-white p-6">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBox key={i} className="h-10 w-full" />
        ))}
      </div>
    </section>
  );
}
