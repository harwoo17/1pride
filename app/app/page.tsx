import Link from "next/link";
import {
  getFourthDownDecisions,
  getTopReceivers,
  getWeeklyScoring,
  type FourthDownDecision,
  type Receiver,
  type WeeklyGame,
} from "@/lib/api";

export const revalidate = 3600;

const ERA_START = 2021;
const LATEST_SEASON = 2025;

// Public-press-conference Dan Campbell, attributed. These are the
// kneecap-bite era quotables — not hot-takes, just the man on the
// record at podiums between 2021 and now.
const CAMPBELL_QUOTES = [
  "Bite a kneecap off.",
  "Punch you in the mouth.",
  "We don't blink.",
  "These dudes.",
  "Knock you down. Get up. Knock you down again.",
  "Hard. Tough. Smart. Disciplined.",
  "We're gonna kick you in the teeth.",
  "Earn the right.",
];

export default async function Home() {
  const [scoring, receivers, fourth] = await Promise.all([
    getWeeklyScoring(LATEST_SEASON),
    getTopReceivers(LATEST_SEASON, 8),
    getFourthDownDecisions(2022, LATEST_SEASON),
  ]);

  const games = scoring?.games ?? [];
  const wins = games.filter((g) => g.scored > g.allowed).length;
  const losses = games.filter((g) => g.scored < g.allowed).length;
  const pointsFor = games.reduce((s, g) => s + g.scored, 0);
  const pointsAgainst = games.reduce((s, g) => s + g.allowed, 0);
  const ppg = games.length ? (pointsFor / games.length).toFixed(1) : "—";
  const biggestWin = topByMargin(games, "win");
  const worstLoss = topByMargin(games, "loss");
  const gritIndex = computeGritIndex(fourth?.decisions ?? []);

  return (
    <>
      <Ticker games={games} />
      <QuoteTicker quotes={CAMPBELL_QUOTES} />
      <Header />

      <main className="flex-1">
        <Hero
          season={LATEST_SEASON}
          wins={wins}
          losses={losses}
          ppg={ppg}
          grit={gritIndex}
          biggestWin={biggestWin}
          worstLoss={worstLoss}
        />
        <Hardhat />
        <DefiningMoments games={games} />
        <Hardhat />
        <GoForIt decisions={fourth?.decisions ?? []} />
        <StatLeaders
          season={LATEST_SEASON}
          receivers={receivers?.receivers ?? []}
        />
        <CampbellEra />
        <ChartsPreview />
      </main>

      <Footer pointsFor={pointsFor} pointsAgainst={pointsAgainst} />
    </>
  );
}

// ─── HELPERS ───────────────────────────────────────────────────────────────

function topByMargin(games: WeeklyGame[], kind: "win" | "loss"): WeeklyGame | null {
  if (!games.length) return null;
  const pool =
    kind === "win"
      ? games.filter((g) => g.scored > g.allowed)
      : games.filter((g) => g.scored < g.allowed);
  if (!pool.length) return null;
  return pool.reduce((best, g) => {
    const m = Math.abs(g.scored - g.allowed);
    const bm = Math.abs(best.scored - best.allowed);
    return m > bm ? g : best;
  });
}

function computeGritIndex(decisions: FourthDownDecision[]): number {
  // GO-FOR-IT share: (pass + run) / total 4th-down plays. Higher = more
  // aggressive. Scaled to 0-100 with league-average go-rate (~12%) at 50.
  if (!decisions.length) return 0;
  const total = decisions.reduce((s, d) => s + d.plays, 0);
  const go = decisions
    .filter((d) => d.play_type === "pass" || d.play_type === "run")
    .reduce((s, d) => s + d.plays, 0);
  const share = total ? go / total : 0;
  // 12% league avg -> 50; 30%+ -> 100.
  return Math.max(0, Math.min(100, Math.round((share / 0.24) * 100)));
}

// ─── SCORE TICKER ──────────────────────────────────────────────────────────

function Ticker({ games }: { games: WeeklyGame[] }) {
  if (!games.length) return null;
  const entries = games.flatMap((g) => [g, g]);

  return (
    <div className="border-b-2 border-[#ffcb05] bg-[var(--lions-blue-deep)] overflow-hidden">
      <div className="ticker-track flex w-max gap-10 py-2 whitespace-nowrap font-display text-base font-semibold tracking-wider text-white uppercase">
        {entries.map((g, i) => {
          const margin = g.scored - g.allowed;
          const result = margin > 0 ? "W" : margin < 0 ? "L" : "T";
          const isRout = margin >= 14;
          return (
            <span key={i} className="flex items-center gap-3 px-3 tabular">
              <span className="text-[var(--lions-blue)]">W{g.week}</span>
              <span>DET</span>
              <span className="text-[var(--lions-silver)]">{g.scored}</span>
              <span className="text-zinc-500">·</span>
              <span>{g.opp}</span>
              <span className="text-[var(--lions-silver)]">{g.allowed}</span>
              <span
                className={
                  result === "W"
                    ? isRout
                      ? "dub-badge rounded-sm text-[10px]"
                      : "rounded bg-[var(--lions-blue)] px-2 text-white"
                    : result === "L"
                      ? "rounded border border-[var(--lions-silver-dark)] px-2 text-[var(--lions-silver)]"
                      : "rounded bg-[var(--lions-silver)] px-2 text-[var(--lions-blue-deep)]"
                }
              >
                {isRout && result === "W" ? "ROUT" : result}
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}

// ─── QUOTE TICKER ──────────────────────────────────────────────────────────

function QuoteTicker({ quotes }: { quotes: string[] }) {
  const entries = [...quotes, ...quotes];
  return (
    <div className="border-b-2 border-[var(--lions-charcoal)] bg-[#ffcb05] overflow-hidden">
      <div className="ticker-track-slow flex w-max items-center gap-10 py-2 whitespace-nowrap font-display text-sm font-bold tracking-wider text-[var(--lions-charcoal)] uppercase">
        {entries.map((q, i) => (
          <span key={i} className="flex items-center gap-4 px-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--lions-charcoal)]/60">
              {String((i % quotes.length) + 1).padStart(2, "0")}
            </span>
            <span className="text-base">&ldquo;{q}&rdquo;</span>
            <span className="text-xs text-[var(--lions-charcoal)]/60">
              — D.C., HC
            </span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── HEADER ────────────────────────────────────────────────────────────────

function Header() {
  return (
    <header className="border-b-2 border-[var(--lions-blue-deep)] bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
        <div className="flex items-baseline gap-3">
          <div className="font-display text-3xl font-black tracking-tight text-[var(--lions-blue)]">
            1PRIDE
          </div>
          <div className="hidden font-display text-xs font-semibold uppercase tracking-[0.2em] text-[var(--lions-silver-dark)] sm:block">
            EST. {ERA_START} · Kneecap Division
          </div>
        </div>
        <nav className="font-display text-sm font-semibold uppercase tracking-wider">
          <Link
            href="/charts"
            className="border-b-2 border-transparent px-2 py-1 hover:border-[var(--lions-blue)]"
          >
            Charts
          </Link>
          <a
            href="https://1pride.dev"
            className="ml-2 border-b-2 border-transparent px-2 py-1 hover:border-[var(--lions-blue)]"
          >
            Curriculum
          </a>
        </nav>
      </div>
    </header>
  );
}

// ─── HARD-HAT RULE ─────────────────────────────────────────────────────────

function Hardhat() {
  return <div className="hardhat-rule" aria-hidden="true" />;
}

// ─── HERO ──────────────────────────────────────────────────────────────────

function Hero({
  season,
  wins,
  losses,
  ppg,
  grit,
  biggestWin,
  worstLoss,
}: {
  season: number;
  wins: number;
  losses: number;
  ppg: string;
  grit: number;
  biggestWin: WeeklyGame | null;
  worstLoss: WeeklyGame | null;
}) {
  return (
    <section className="stripes yard-lines relative border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-blue)]">
            <span className="inline-block h-1.5 w-6 bg-[var(--lions-blue)]" />
            Season {season} · Regular Season
            <span className="text-[var(--lions-silver-dark)]">·</span>
            <span className="text-[var(--lions-silver-dark)]">17 of 17</span>
          </div>
          <h1 className="font-display text-6xl font-black uppercase leading-none tracking-tight text-[var(--lions-charcoal)] sm:text-7xl lg:text-8xl">
            Don't blink.
            <br />
            <span className="text-[var(--lions-blue)]">Bite the kneecap.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-zinc-600">
            Lions analytics, all heart. Real{" "}
            <a
              href="https://github.com/nflverse"
              className="font-semibold text-[var(--lions-blue)] hover:underline"
            >
              nflverse
            </a>{" "}
            data for the entire Dan Campbell era — every game, every play, every
            4th-down decision. The Level 5 capstone of the{" "}
            <a
              href="https://1pride.dev"
              className="font-semibold text-[var(--lions-blue)] hover:underline"
            >
              1PRIDE
            </a>{" "}
            curriculum.
          </p>

          {(biggestWin || worstLoss) && (
            <div className="mt-6 inline-block">
              <span className="stamp font-display text-sm text-[var(--lions-blue)]">
                Season-Defining
              </span>
              <div className="mt-3 flex flex-wrap gap-3">
                {biggestWin && (
                  <ResultPill
                    label="Biggest Win"
                    accent="win"
                    game={biggestWin}
                  />
                )}
                {worstLoss && (
                  <ResultPill
                    label="Worst Loss"
                    accent="loss"
                    game={worstLoss}
                  />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Record" value={`${wins}–${losses}`} />
          <StatBox label="PPG" value={ppg} />
          <StatBox label="Grit Index" value={grit} suffix="/100" emphasize />
          <StatBox
            label="Kneecap Status"
            value={grit >= 60 ? "BITTEN" : grit >= 40 ? "GNAWING" : "EYEING"}
            small
          />
        </div>
      </div>
    </section>
  );
}

function StatBox({
  label,
  value,
  suffix,
  emphasize,
  small,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  emphasize?: boolean;
  small?: boolean;
}) {
  return (
    <div
      className={`flex flex-col justify-between border-l-4 ${
        emphasize
          ? "border-[#ffcb05] bg-[var(--lions-charcoal)] text-white"
          : "border-[var(--lions-blue)] bg-white"
      } p-4 shadow-sm`}
    >
      <div
        className={`font-display text-xs font-bold uppercase tracking-[0.18em] ${
          emphasize ? "text-[#ffcb05]" : "text-[var(--lions-silver-dark)]"
        }`}
      >
        {label}
      </div>
      <div
        className={`font-display font-black tabular ${
          small ? "text-3xl" : "text-5xl"
        } ${emphasize ? "text-white" : "text-[var(--lions-charcoal)]"}`}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-xl text-[var(--lions-silver-dark)]">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function ResultPill({
  label,
  accent,
  game,
}: {
  label: string;
  accent: "win" | "loss";
  game: WeeklyGame;
}) {
  const margin = Math.abs(game.scored - game.allowed);
  const isWin = accent === "win";
  return (
    <div
      className={`flex items-center gap-3 border-2 ${
        isWin
          ? "border-[var(--lions-blue)] bg-white"
          : "border-zinc-300 bg-white"
      } px-3 py-2 font-display tabular`}
    >
      <div className="text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--lions-silver-dark)]">
        {label}
      </div>
      <div className="text-sm font-bold">
        W{game.week} · DET {game.scored} – {game.opp} {game.allowed}
      </div>
      <span
        className={`text-xs font-black ${
          isWin ? "text-[var(--lions-blue)]" : "text-zinc-500"
        }`}
      >
        {isWin ? "+" : "−"}
        {margin}
      </span>
    </div>
  );
}

// ─── DEFINING MOMENTS ──────────────────────────────────────────────────────

function DefiningMoments({ games }: { games: WeeklyGame[] }) {
  if (!games.length) return null;

  const wins = games
    .filter((g) => g.scored > g.allowed)
    .sort((a, b) => b.scored - b.allowed - (a.scored - a.allowed));
  const losses = games
    .filter((g) => g.scored < g.allowed)
    .sort((a, b) => a.scored - a.allowed - (b.scored - b.allowed));

  const top = [
    ...wins.slice(0, 3).map((g) => ({ g, kind: "W" as const })),
    ...losses.slice(0, 2).map((g) => ({ g, kind: "L" as const })),
  ];

  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow={`${LATEST_SEASON} · Story of the Season`}
          title="Defining Moments"
          sub="Three biggest wins, two toughest losses. Sorted by margin."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {top.map(({ g, kind }) => {
            const margin = Math.abs(g.scored - g.allowed);
            const isRout = kind === "W" && margin >= 14;
            return (
              <div
                key={`${g.week}-${kind}`}
                className={`flex flex-col gap-2 border-2 p-4 font-display tabular ${
                  kind === "W"
                    ? "border-[var(--lions-blue)] bg-[var(--lions-blue)]/[0.04]"
                    : "border-zinc-300 bg-zinc-50"
                }`}
              >
                <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--lions-silver-dark)]">
                  <span>Week {g.week}</span>
                  {isRout ? (
                    <span className="dub-badge text-[10px]">ROUT</span>
                  ) : (
                    <span
                      className={`px-1.5 ${
                        kind === "W"
                          ? "bg-[var(--lions-blue)] text-white"
                          : "border border-zinc-400 text-zinc-600"
                      }`}
                    >
                      {kind}
                    </span>
                  )}
                </div>
                <div className="text-3xl font-black">
                  <span className="text-[var(--lions-blue)]">DET {g.scored}</span>
                  <span className="text-zinc-400"> · </span>
                  <span className="text-[var(--lions-charcoal)]">
                    {g.opp} {g.allowed}
                  </span>
                </div>
                <div className="font-mono text-[10px] tracking-wider text-[var(--lions-silver-dark)]">
                  MARGIN{" "}
                  <span
                    className={
                      kind === "W"
                        ? "font-bold text-[var(--lions-blue)]"
                        : "font-bold text-zinc-700"
                    }
                  >
                    {kind === "W" ? "+" : "−"}
                    {margin}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── GO-FOR-IT IDENTITY ────────────────────────────────────────────────────

function GoForIt({ decisions }: { decisions: FourthDownDecision[] }) {
  if (!decisions.length) {
    return null;
  }
  const total = decisions.reduce((s, d) => s + d.plays, 0);
  const go = decisions
    .filter((d) => d.play_type === "pass" || d.play_type === "run")
    .reduce((s, d) => s + d.plays, 0);
  const kick = total - go;
  const goPct = total ? Math.round((go / total) * 100) : 0;
  const goEpa = decisions
    .filter((d) => d.play_type === "pass" || d.play_type === "run")
    .reduce((s, d) => s + d.plays * Number(d.avg_epa), 0) / Math.max(go, 1);

  return (
    <section className="bg-[var(--lions-charcoal)] py-14 text-white">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-[#ffcb05]">
            <span className="inline-block h-1.5 w-6 bg-[#ffcb05]" />
            Identity · 4th Down
          </div>
          <h2 className="font-display text-5xl font-black uppercase leading-none tracking-tight sm:text-6xl">
            Go.
            <br />
            <span className="text-[#ffcb05]">For.</span>
            <br />
            It.
          </h2>
          <p className="mt-4 max-w-md text-sm text-zinc-300">
            The Campbell-era Lions go for it on 4th down at one of the highest
            rates in football. Across 4 seasons of play-by-play, the data shows
            the same thing the press conferences do: this team does not punt
            its way to a coin flip.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <DarkStat label="Go-for-it" value={go} suffix={`/${total}`} />
          <DarkStat label="Go Rate" value={`${goPct}%`} />
          <DarkStat
            label="EPA / Go"
            value={(goEpa >= 0 ? "+" : "") + goEpa.toFixed(2)}
            highlight
          />
          <DarkStat label="Kicker IOU" value={kick} />
        </div>
      </div>
    </section>
  );
}

function DarkStat({
  label,
  value,
  suffix,
  highlight,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  highlight?: boolean;
}) {
  return (
    <div className="border-l-4 border-[#ffcb05]/60 bg-white/[0.04] p-4">
      <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[#ffcb05]/80">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-4xl font-black tabular ${
          highlight ? "text-[#ffcb05]" : "text-white"
        }`}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-base text-zinc-400">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── STAT LEADERS ──────────────────────────────────────────────────────────

function StatLeaders({
  season,
  receivers,
}: {
  season: number;
  receivers: Receiver[];
}) {
  if (!receivers.length) {
    return (
      <section className="border-y border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow={`${season} · The Pass-Catchers`}
            title="Who Ate"
          />
          <p className="text-sm text-zinc-500">
            API offline — start the FastAPI service to see live leaders.
          </p>
        </div>
      </section>
    );
  }

  const leader = receivers[0];
  return (
    <section className="border-y border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow={`${season} · The Pass-Catchers`}
          title="Who Ate"
          sub="Receiving leaders, sorted by yards. Hover a row for the long version."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-[var(--lions-charcoal)] font-display text-xs font-bold uppercase tracking-wider text-[var(--lions-silver-dark)]">
              <tr>
                <th className="py-2">#</th>
                <th className="py-2">Player</th>
                <th className="py-2">Pos</th>
                <th className="py-2 text-right">G</th>
                <th className="py-2 text-right">Tgt</th>
                <th className="py-2 text-right">Rec</th>
                <th className="py-2 text-right">Yards</th>
                <th className="py-2 text-right">TD</th>
              </tr>
            </thead>
            <tbody className="font-display text-base tabular">
              {receivers.map((r, i) => (
                <tr
                  key={r.name}
                  className={
                    i === 0
                      ? "border-b border-zinc-200 bg-[var(--lions-blue)]/5"
                      : "border-b border-zinc-100 hover:bg-zinc-50"
                  }
                >
                  <td className="py-2 font-mono text-xs text-[var(--lions-silver-dark)]">
                    {String(i + 1).padStart(2, "0")}
                  </td>
                  <td className="py-2 font-semibold">{r.name}</td>
                  <td className="py-2 text-[var(--lions-silver-dark)]">
                    {r.position}
                  </td>
                  <td className="py-2 text-right">{r.games}</td>
                  <td className="py-2 text-right">{r.targets}</td>
                  <td className="py-2 text-right">{r.catches}</td>
                  <td className="py-2 text-right font-bold">{r.yards}</td>
                  <td className="py-2 text-right">{r.tds ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          {leader.name} ate first —{" "}
          <span className="font-semibold text-[var(--lions-blue)]">
            {leader.yards} yards
          </span>{" "}
          on {leader.targets} targets in {leader.games} games.
        </p>
      </div>
    </section>
  );
}

// ─── CAMPBELL ERA ──────────────────────────────────────────────────────────

function CampbellEra() {
  const years = [
    { y: 2021, rec: "3–13–1", note: "Year one. Kneecap declaration." },
    { y: 2022, rec: "9–8", note: "Late surge. Foundation laid." },
    { y: 2023, rec: "12–5", note: "Division. One game from the Bowl." },
    { y: 2024, rec: "15–2", note: "Best regular season in 91 years." },
    { y: 2025, rec: "9–8", note: "Regression. Still scary." },
  ];
  return (
    <section className="bg-[var(--lions-blue-deep)] py-14 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-[#ffcb05]">
          <span className="inline-block h-1.5 w-6 bg-[#ffcb05]" />
          {ERA_START}–Present
        </div>
        <h2 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
          These Dudes
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-zinc-300">
          Five years. From 3-win laughingstock to 15-2 best-regular-season-in-
          franchise-history. Every chart and lesson in 1PRIDE is built on this
          tenure — and every play-by-play row in the database is the
          kneecap-bite, quantified.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {years.map((y) => (
            <div
              key={y.y}
              className="border-l-4 border-[#ffcb05] bg-[var(--lions-blue-deep)]/40 p-4 ring-1 ring-white/10"
            >
              <div className="font-display text-3xl font-black tabular">
                {y.y}
              </div>
              <div className="font-display text-2xl font-bold uppercase text-[var(--lions-silver)] tabular">
                {y.rec}
              </div>
              <div className="mt-2 text-xs text-zinc-400">{y.note}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── CHARTS PREVIEW ────────────────────────────────────────────────────────

function ChartsPreview() {
  return (
    <section className="bg-white py-14">
      <div className="mx-auto max-w-6xl px-6">
        <div className="flex items-end justify-between">
          <SectionHeader
            eyebrow="Explore"
            title="The Chart Room"
            sub="Open the dossier. Real plays. Real decisions."
          />
          <Link
            href="/charts"
            className="hidden font-display text-sm font-bold uppercase tracking-wider text-[var(--lions-blue)] hover:underline sm:block"
          >
            See All →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ChartCard
            label="Weekly"
            title="Scoring Margin"
            body="Points scored vs allowed, week by week. Cumulative differential across the season."
          />
          <ChartCard
            label="Position"
            title="WR Room"
            body="Targets, catches, yards, TDs across the Detroit pass-catchers."
          />
          <ChartCard
            label="Decision"
            title="4th Down"
            body="Every Lions 4th down 2022-onward. EPA per decision type."
          />
        </div>
      </div>
    </section>
  );
}

function ChartCard({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <Link
      href="/charts"
      className="group flex flex-col gap-2 border border-zinc-200 bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[var(--lions-blue)] hover:shadow-md"
    >
      <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[var(--lions-blue)]">
        {label}
      </div>
      <div className="font-display text-3xl font-black uppercase tracking-tight">
        {title}
      </div>
      <p className="text-sm text-zinc-600">{body}</p>
      <div className="mt-2 font-display text-xs font-bold uppercase tracking-wider text-[var(--lions-silver-dark)] group-hover:text-[var(--lions-blue)]">
        View →
      </div>
    </Link>
  );
}

// ─── PRIMITIVES ────────────────────────────────────────────────────────────

function SectionHeader({
  eyebrow,
  title,
  sub,
}: {
  eyebrow: string;
  title: string;
  sub?: string;
}) {
  return (
    <div className="mb-6">
      <div className="font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-blue)]">
        <span className="chevron" />
        {eyebrow}
      </div>
      <h2 className="font-display text-4xl font-black uppercase tracking-tight text-[var(--lions-charcoal)]">
        {title}
      </h2>
      {sub && <p className="mt-1 text-sm text-zinc-500">{sub}</p>}
    </div>
  );
}

function Footer({
  pointsFor,
  pointsAgainst,
}: {
  pointsFor: number;
  pointsAgainst: number;
}) {
  return (
    <footer className="border-t-2 border-[#ffcb05] bg-[var(--lions-charcoal)] text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-6 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-display font-bold text-white">1PRIDE</span> ·
          Lions analytics built on{" "}
          <a
            href="https://github.com/nflverse"
            className="text-[var(--lions-blue)] hover:underline"
          >
            nflverse
          </a>
          . Quotes are public press-conference statements. Not affiliated with
          the Detroit Lions or the NFL.
        </div>
        <div className="flex items-center gap-4 font-mono text-[10px] tabular tracking-wider text-zinc-500">
          <span>
            PF <span className="text-white">{pointsFor || "—"}</span>
          </span>
          <span>
            PA <span className="text-white">{pointsAgainst || "—"}</span>
          </span>
          <span>L5 CAPSTONE · v0.2</span>
        </div>
      </div>
    </footer>
  );
}
