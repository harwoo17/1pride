import Link from "next/link";
import {
  getFourthDownDecisions,
  getTopReceivers,
  getWeeklyScoring,
  type FourthDownDecision,
  type Receiver,
  type WeeklyGame,
} from "@/lib/api";

export const metadata = {
  title: "The Chart Room — 1PRIDE",
};

export const revalidate = 3600;

const LATEST_SEASON = 2025;

export default async function ChartsPage() {
  const [scoring, receivers, fourth] = await Promise.all([
    getWeeklyScoring(LATEST_SEASON),
    getTopReceivers(LATEST_SEASON, 8),
    getFourthDownDecisions(2022, 2025),
  ]);

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
          <nav className="font-display text-sm font-semibold uppercase tracking-wider">
            <Link
              href="/"
              className="border-b-2 border-transparent px-2 py-1 hover:border-[var(--lions-blue)]"
            >
              Home
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-12 px-6 py-12">
        <div>
          <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-blue)]">
            <span className="chevron" />
            Live · {LATEST_SEASON} season
          </div>
          <h1 className="font-display text-5xl font-black uppercase tracking-tight">
            The Chart Room
          </h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600">
            Real Lions data, 2021-present. Wired to the FastAPI service
            reading from local Postgres.
          </p>
        </div>

        <ScoringChart games={scoring?.games ?? []} />
        <ReceiversChart receivers={receivers?.receivers ?? []} />
        <FourthDownChart decisions={fourth?.decisions ?? []} />
      </main>

      <footer className="border-t-2 border-[var(--lions-blue-deep)] bg-[var(--lions-charcoal)] text-zinc-400">
        <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="font-display font-bold text-white">1PRIDE</span> ·
            Lions analytics. Not affiliated with the Detroit Lions or the NFL.
          </div>
          <div className="font-mono text-[10px] tracking-wider text-zinc-500">
            L5 CAPSTONE · v0.1
          </div>
        </div>
      </footer>
    </>
  );
}

// ─── SCORING CHART ─────────────────────────────────────────────────────────

function ScoringChart({ games }: { games: WeeklyGame[] }) {
  if (!games.length) return <NoData label="Weekly Scoring" />;
  const max = Math.max(...games.flatMap((g) => [g.scored, g.allowed]));

  return (
    <section>
      <ChartHeader
        label="Weekly · Season 2025"
        title="Scoring Margin"
        sub="Lions points scored vs allowed, week by week."
      />
      <div className="border-2 border-[var(--lions-charcoal)] bg-white">
        <div className="grid grid-cols-[60px_1fr] gap-2 p-6">
          <div className="flex flex-col-reverse justify-between text-right font-mono text-[10px] text-[var(--lions-silver-dark)]">
            <div>0</div>
            <div>{Math.ceil(max / 2)}</div>
            <div>{max}</div>
          </div>
          <div className="grid grid-flow-col auto-cols-fr items-end gap-2">
            {games.map((g) => {
              const result =
                g.scored > g.allowed
                  ? "W"
                  : g.scored < g.allowed
                    ? "L"
                    : "T";
              return (
                <div
                  key={g.week}
                  className="group relative flex flex-col items-center gap-1"
                >
                  <div className="flex h-[200px] w-full items-end gap-1">
                    <div
                      title={`Scored: ${g.scored}`}
                      className="flex-1 bg-[var(--lions-blue)] transition-opacity group-hover:opacity-80"
                      style={{ height: `${(g.scored / max) * 100}%` }}
                    />
                    <div
                      title={`Allowed: ${g.allowed}`}
                      className="flex-1 bg-[var(--lions-silver)] transition-opacity group-hover:opacity-80"
                      style={{ height: `${(g.allowed / max) * 100}%` }}
                    />
                  </div>
                  <div className="font-display text-[10px] font-bold uppercase tracking-wider text-[var(--lions-silver-dark)]">
                    W{g.week}
                  </div>
                  <div
                    className={`font-display text-[10px] font-bold ${
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
        </div>
        <div className="flex items-center gap-6 border-t border-zinc-200 px-6 py-3 text-xs font-display font-semibold uppercase tracking-wider">
          <Swatch color="var(--lions-blue)" label="Scored" />
          <Swatch color="var(--lions-silver)" label="Allowed" />
          <span className="ml-auto font-mono text-[10px] tracking-wider text-[var(--lions-silver-dark)]">
            Source: nflverse
          </span>
        </div>
      </div>
    </section>
  );
}

// ─── RECEIVERS CHART ───────────────────────────────────────────────────────

function ReceiversChart({ receivers }: { receivers: Receiver[] }) {
  if (!receivers.length) return <NoData label="WR Room" />;
  const max = Math.max(...receivers.map((r) => r.yards));

  return (
    <section>
      <ChartHeader
        label="Position · Season 2025"
        title="The WR Room"
        sub="Receiving yards per player, sorted top to bottom."
      />
      <div className="border-2 border-[var(--lions-charcoal)] bg-white">
        <div className="divide-y divide-zinc-100">
          {receivers.map((r, i) => (
            <div
              key={r.name}
              className="grid grid-cols-[180px_1fr_60px] items-center gap-3 px-6 py-3 font-display"
            >
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs text-[var(--lions-silver-dark)]">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <div className="text-sm font-bold uppercase tracking-tight">
                    {r.name}
                  </div>
                  <div className="text-[10px] font-bold uppercase tracking-wider text-[var(--lions-silver-dark)]">
                    {r.position} · {r.games}G
                  </div>
                </div>
              </div>
              <div className="relative h-8 overflow-hidden bg-zinc-100">
                <div
                  className="h-full bg-[var(--lions-blue)]"
                  style={{ width: `${(r.yards / max) * 100}%` }}
                />
                <div className="absolute inset-0 flex items-center px-3 text-xs font-bold uppercase text-white mix-blend-difference tabular">
                  {r.catches}/{r.targets} · {r.tds} TD
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
  if (!decisions.length) return <NoData label="4th Down" />;
  const total = decisions.reduce((s, d) => s + d.plays, 0);
  const labels: Record<string, string> = {
    pass: "Pass",
    run: "Run",
    field_goal: "Field Goal",
    punt: "Punt",
  };

  return (
    <section>
      <ChartHeader
        label="Decision · 2022–2025"
        title="4th Down Identity"
        sub={`${total} Lions 4th-down plays over four seasons of the Campbell era.`}
      />
      <div className="border-2 border-[var(--lions-charcoal)] bg-white">
        <div className="flex h-12 overflow-hidden border-b border-zinc-200">
          {decisions.map((d, i) => {
            const pct = (d.plays / total) * 100;
            const colors = [
              "var(--lions-blue)",
              "var(--lions-blue-dark)",
              "var(--lions-silver)",
              "var(--lions-silver-dark)",
            ];
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
                {d.plays}
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
    <div className="mb-3">
      <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-blue)]">
        <span className="chevron" />
        {label}
      </div>
      <h2 className="font-display text-3xl font-black uppercase tracking-tight">
        {title}
      </h2>
      <p className="text-sm text-zinc-500">{sub}</p>
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

function NoData({ label }: { label: string }) {
  return (
    <section className="border-2 border-dashed border-zinc-300 bg-white p-8 text-center">
      <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-silver-dark)]">
        {label}
      </div>
      <p className="mt-2 text-sm text-zinc-500">
        API offline. Start the FastAPI service with:
        <br />
        <code className="font-mono text-xs">
          uv run --python 3.11 --extra api uvicorn onepride_data.api:app
        </code>
      </p>
    </section>
  );
}
