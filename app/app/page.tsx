import Link from "next/link";
import {
  getFourthDownDecisions,
  getNfcNorth,
  getReceiverWeeks,
  getTopReceivers,
  getWeeklyScoring,
  type FourthDownDecision,
  type Receiver,
  type ReceiverWeek,
  type StandingsRow,
  type WeeklyGame,
} from "@/lib/api";
import { CountUp } from "@/components/CountUp";
import { FadeIn } from "@/components/FadeIn";
import { SkeletonRow } from "@/components/Skeleton";
import { Sparkline } from "@/components/Sparkline";

export const revalidate = 3600;

const ERA_START = 2021;
const LATEST_SEASON = 2025;

// Public Lions jersey numbers (2024 roster) — used to render a small
// jersey chip next to player names in StatLeaders. Facts, not branding.
const JERSEY_NUMBERS: Record<string, number> = {
  "Jared Goff": 16,
  "Amon-Ra St. Brown": 14,
  "Jameson Williams": 9,
  "Sam LaPorta": 87,
  "David Montgomery": 5,
  "Jahmyr Gibbs": 26,
  "Penei Sewell": 58,
  "Aidan Hutchinson": 97,
  "Tim Patrick": 12,
  "Brock Wright": 89,
  "Kalif Raymond": 11,
  "Craig Reynolds": 13,
};

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

const TEAM_NAMES: Record<string, string> = {
  DET: "Lions",
  GB: "Packers",
  MIN: "Vikings",
  CHI: "Bears",
};

export default async function Home() {
  const [scoring, receivers, fourth, weeks, standings] = await Promise.all([
    getWeeklyScoring(LATEST_SEASON),
    getTopReceivers(LATEST_SEASON, 8),
    getFourthDownDecisions(2022, LATEST_SEASON),
    getReceiverWeeks(LATEST_SEASON, 8),
    getNfcNorth(LATEST_SEASON),
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
  const lastUpdated = new Date().toUTCString();

  return (
    <>
      <Ticker games={games} lastUpdated={lastUpdated} />
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
        <FadeIn>
          <DefiningMoments games={games} />
        </FadeIn>
        <Hardhat />
        <FadeIn>
          <GoForIt decisions={fourth?.decisions ?? []} />
        </FadeIn>
        <FadeIn>
          <FromTheData
            games={games}
            receivers={receivers?.receivers ?? []}
            decisions={fourth?.decisions ?? []}
          />
        </FadeIn>
        <FadeIn>
          <PullQuote />
        </FadeIn>
        <FadeIn>
          <StatLeaders
            season={LATEST_SEASON}
            receivers={receivers?.receivers ?? []}
            weeks={weeks?.rows ?? []}
          />
        </FadeIn>
        <FadeIn>
          <DivisionStandings
            season={LATEST_SEASON}
            standings={standings?.standings ?? []}
          />
        </FadeIn>
        <FadeIn>
          <CampbellEra />
        </FadeIn>
        <FadeIn>
          <ChartsPreview />
        </FadeIn>
      </main>

      <Footer
        pointsFor={pointsFor}
        pointsAgainst={pointsAgainst}
        lastUpdated={lastUpdated}
      />
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
  if (!decisions.length) return 0;
  const total = decisions.reduce((s, d) => s + d.plays, 0);
  const go = decisions
    .filter((d) => d.play_type === "pass" || d.play_type === "run")
    .reduce((s, d) => s + d.plays, 0);
  const share = total ? go / total : 0;
  return Math.max(0, Math.min(100, Math.round((share / 0.24) * 100)));
}

function recapHeadline(g: WeeklyGame): string {
  const margin = g.scored - g.allowed;
  const team = TEAM_NAMES[g.opp] ?? g.opp;
  if (margin >= 28) return `${team} flattened. Mercy rule.`;
  if (margin >= 14) return `${team} dispatched. Three phases, full throttle.`;
  if (margin >= 1) return `${team} edged. Lions hold serve.`;
  if (margin >= -14) return `Lost late to the ${team}. Stings.`;
  return `Run over by the ${team}. Tape goes in the bin.`;
}

// ─── SCORE TICKER ──────────────────────────────────────────────────────────

function Ticker({
  games,
  lastUpdated,
}: {
  games: WeeklyGame[];
  lastUpdated: string;
}) {
  if (!games.length) return null;
  const entries = games.flatMap((g) => [g, g]);
  const updTag = lastUpdated.split(" ").slice(1, 4).join(" ");

  return (
    <div className="relative border-b-2 border-[var(--lions-accent)] bg-[var(--lions-blue-deep)]">
      <div className="overflow-hidden">
        <div className="ticker-track flex w-max gap-10 py-2 whitespace-nowrap font-display text-base font-semibold tracking-wider text-[var(--lions-ink-inverse)] uppercase">
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
      <div className="absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-2 bg-[var(--lions-blue-deep)] pl-3 font-mono text-[9px] tracking-[0.2em] text-[var(--lions-silver-dark)] md:flex">
        <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--lions-accent)]" />
        LIVE · UPD {updTag}
      </div>
    </div>
  );
}

// ─── QUOTE TICKER ──────────────────────────────────────────────────────────

function QuoteTicker({ quotes }: { quotes: string[] }) {
  const entries = [...quotes, ...quotes];
  return (
    <div className="border-b-2 border-[var(--lions-blue-deep)] bg-[var(--lions-silver)] overflow-hidden">
      <div className="ticker-track-slow flex w-max items-center gap-10 py-2 whitespace-nowrap font-display text-sm font-bold tracking-wider text-[var(--lions-blue-deep)] uppercase">
        {entries.map((q, i) => (
          <span key={i} className="flex items-center gap-4 px-3">
            <span className="font-mono text-[10px] tracking-[0.2em] text-[var(--lions-blue-deep)]/60">
              {String((i % quotes.length) + 1).padStart(2, "0")}
            </span>
            <span className="text-base">&ldquo;{q}&rdquo;</span>
            <span className="text-xs text-[var(--lions-blue-deep)]/60">
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
            Detroit · Est. {ERA_START} · Kneecap Division
          </div>
        </div>
        <nav className="flex items-center gap-1 font-display text-sm font-semibold uppercase tracking-wider">
          <a
            href="#leaders"
            className="hidden border-b-2 border-transparent px-2 py-1 hover:border-[var(--lions-blue)] sm:inline"
          >
            Leaders
          </a>
          <a
            href="#standings"
            className="hidden border-b-2 border-transparent px-2 py-1 hover:border-[var(--lions-blue)] sm:inline"
          >
            Standings
          </a>
          <Link
            href="/charts"
            className="border-b-2 border-transparent px-2 py-1 hover:border-[var(--lions-blue)]"
          >
            Charts
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
  );
}

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
    <section className="stripes yard-lines relative overflow-hidden border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50">
      {/* Faded football mark — decorative, sits behind content */}
      <svg
        viewBox="0 0 280 140"
        className="pointer-events-none absolute right-6 top-12 hidden w-80 opacity-[0.10] md:block"
        aria-hidden="true"
      >
        <ellipse cx="140" cy="70" rx="120" ry="55" fill="none" stroke="var(--lions-blue)" strokeWidth="6" />
        <line x1="68" y1="70" x2="212" y2="70" stroke="var(--lions-blue)" strokeWidth="4" />
        <line x1="100" y1="58" x2="100" y2="82" stroke="var(--lions-blue)" strokeWidth="3" />
        <line x1="120" y1="58" x2="120" y2="82" stroke="var(--lions-blue)" strokeWidth="3" />
        <line x1="140" y1="58" x2="140" y2="82" stroke="var(--lions-blue)" strokeWidth="3" />
        <line x1="160" y1="58" x2="160" y2="82" stroke="var(--lions-blue)" strokeWidth="3" />
        <line x1="180" y1="58" x2="180" y2="82" stroke="var(--lions-blue)" strokeWidth="3" />
      </svg>
      <div className="relative mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-blue)]">
            <span className="inline-block h-1.5 w-6 bg-[var(--lions-blue)]" />
            Season {season} · Regular Season
            <span className="text-[var(--lions-silver-dark)]">·</span>
            <span className="text-[var(--lions-silver-dark)]">17 of 17</span>
          </div>
          <h1 className="font-display text-7xl font-black uppercase leading-[0.92] tracking-tight text-[var(--lions-charcoal)] sm:text-8xl md:text-9xl lg:text-[9.5rem]">
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
              href="https://1pride.app"
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
                  <ResultPill label="Biggest Win" accent="win" game={biggestWin} />
                )}
                {worstLoss && (
                  <ResultPill label="Worst Loss" accent="loss" game={worstLoss} />
                )}
              </div>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Numeric stats animate up on scroll-in; the qualitative
              "Kneecap Status" pill stays static text. */}
          <StatBox
            label="Record"
            value={`${wins}–${losses}`}
            countTo={wins}
            countSuffix={`–${losses}`}
          />
          <StatBox
            label="PPG"
            value={ppg}
            countTo={parseFloat(ppg)}
            countDecimals={1}
          />
          <StatBox
            label="Grit Index"
            value={grit}
            suffix="/100"
            emphasize
            countTo={grit}
          />
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
  /** When set, animate the number from 0 to this value on first scroll-in. */
  countTo,
  /** Decimal places for the animated value. */
  countDecimals,
  /** Static text appended inside the count, e.g. "–2" for a record. */
  countSuffix,
}: {
  label: string;
  value: string | number;
  suffix?: string;
  emphasize?: boolean;
  small?: boolean;
  countTo?: number;
  countDecimals?: number;
  countSuffix?: string;
}) {
  return (
    <div
      className={`card-lift relative flex flex-col justify-between border-2 ${
        emphasize
          ? "border-[var(--lions-blue)] bg-[var(--lions-blue)] text-white"
          : "border-[var(--lions-blue)] bg-white"
      } p-5 shadow-md ring-2 ring-inset ${
        emphasize ? "ring-white/30" : "ring-[var(--lions-silver-light)]"
      }`}
    >
      <div
        className={`flex items-center gap-2 font-display text-[10px] font-bold uppercase tracking-[0.22em] ${
          emphasize ? "text-white" : "text-[var(--lions-silver-dark)]"
        }`}
      >
        <span
          className={`scoreboard-pulse inline-block h-1.5 w-1.5 rounded-full ${
            emphasize ? "bg-white" : "bg-[var(--lions-blue)]"
          }`}
        />
        {label}
      </div>
      <div
        className={`font-display font-black tabular leading-none ${
          small ? "text-4xl" : "text-6xl"
        } ${emphasize ? "text-white" : "text-[var(--lions-charcoal)]"}`}
      >
        {countTo !== undefined ? (
          <CountUp
            to={countTo}
            decimals={countDecimals}
            suffix={countSuffix}
          />
        ) : (
          value
        )}
        {suffix && (
          <span
            className={`ml-1 text-xl ${
              emphasize ? "text-white/70" : "text-[var(--lions-silver-dark)]"
            }`}
          >
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
        isWin ? "border-[var(--lions-blue)] bg-white" : "border-zinc-300 bg-white"
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
              <article
                key={`${g.week}-${kind}`}
                className={`card-lift flex flex-col gap-2 border-2 p-4 font-display tabular ${
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
                  <span className="text-[var(--lions-silver-light)]/85"> · </span>
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
                <p className="mt-1 font-sans text-xs leading-snug text-zinc-600 normal-case tracking-normal">
                  {recapHeadline(g)}
                </p>
              </article>
            );
          })}
        </div>
      </div>
    </section>
  );
}

// ─── GO-FOR-IT ─────────────────────────────────────────────────────────────

function GoForIt({ decisions }: { decisions: FourthDownDecision[] }) {
  if (!decisions.length) return null;
  const total = decisions.reduce((s, d) => s + d.plays, 0);
  const go = decisions
    .filter((d) => d.play_type === "pass" || d.play_type === "run")
    .reduce((s, d) => s + d.plays, 0);
  const kick = total - go;
  const goPct = total ? Math.round((go / total) * 100) : 0;
  const goEpa =
    decisions
      .filter((d) => d.play_type === "pass" || d.play_type === "run")
      .reduce((s, d) => s + d.plays * Number(d.avg_epa), 0) / Math.max(go, 1);

  return (
    <section className="bg-[var(--lions-blue-deep)] py-14 text-[var(--lions-ink-inverse)]">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 lg:grid-cols-[1fr_1.2fr] lg:items-end">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-accent)]">
            <span className="inline-block h-1.5 w-6 bg-[var(--lions-accent)]" />
            Identity · 4th Down
          </div>
          <h2 className="font-display text-4xl font-black uppercase leading-none tracking-tight sm:text-5xl md:text-6xl">
            Go.
            <br />
            <span className="text-[var(--lions-blue)]">For.</span>
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
    <div className="border-l-4 border-[var(--lions-accent)]/60 bg-white/[0.04] p-4">
      <div className="font-display text-[10px] font-bold uppercase tracking-[0.18em] text-[var(--lions-accent)]/85">
        {label}
      </div>
      <div
        className={`mt-1 font-display text-4xl font-black tabular ${
          highlight ? "text-white" : "text-[var(--lions-silver)]"
        }`}
      >
        {value}
        {suffix && (
          <span className="ml-1 text-base text-[var(--lions-silver-light)]/85">{suffix}</span>
        )}
      </div>
    </div>
  );
}

// ─── FROM THE DATA ─────────────────────────────────────────────────────────

function FromTheData({
  games,
  receivers,
  decisions,
}: {
  games: WeeklyGame[];
  receivers: Receiver[];
  decisions: FourthDownDecision[];
}) {
  const insights: { stat: string; headline: string; sub: string }[] = [];

  if (games.length) {
    const pf = games.reduce((s, g) => s + g.scored, 0);
    const ppg = pf / games.length;
    insights.push({
      stat: ppg.toFixed(1),
      headline: "Points per game",
      sub: `Across ${games.length} regular-season starts. ${
        ppg >= 28
          ? "Elite scoring tier."
          : ppg >= 22
            ? "Solidly above average."
            : "Mid-pack output."
      }`,
    });
  }

  if (receivers.length) {
    const top = receivers[0];
    const totalYards = receivers.reduce((s, r) => s + (r.yards ?? 0), 0);
    const share = totalYards ? (top.yards / totalYards) * 100 : 0;
    insights.push({
      stat: `${share.toFixed(0)}%`,
      headline: `${top.name.split(" ").slice(-1)[0]}'s share of the room`,
      sub: `${top.yards.toFixed(0)} of ${totalYards.toFixed(
        0,
      )} top-8 yards. Engine of the passing game.`,
    });
  }

  if (decisions.length) {
    const go = decisions
      .filter((d) => d.play_type === "pass" || d.play_type === "run")
      .reduce((s, d) => s + d.plays * Number(d.avg_epa), 0);
    const goPlays = decisions
      .filter((d) => d.play_type === "pass" || d.play_type === "run")
      .reduce((s, d) => s + d.plays, 0);
    const epaPerGo = goPlays ? go / goPlays : 0;
    insights.push({
      stat: `${epaPerGo >= 0 ? "+" : ""}${epaPerGo.toFixed(2)}`,
      headline: "EPA per go-for-it",
      sub: `${goPlays} pass/run 4th-down attempts across the Campbell era. ${
        epaPerGo >= 0.2
          ? "League-best aggression."
          : "Productive when they go."
      }`,
    });
  }

  if (!insights.length) return null;

  return (
    <section className="bg-zinc-50 py-14">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow="Three takeaways"
          title="From The Data"
          sub="What the numbers say if you only have 30 seconds."
        />
        <div className="grid gap-4 sm:grid-cols-3">
          {insights.map((it, i) => (
            <div
              key={i}
              className="card-lift flex flex-col gap-2 border-l-4 border-[var(--lions-blue)] bg-white p-6 shadow-sm"
            >
              <div className="font-display text-[10px] font-bold uppercase tracking-[0.25em] text-[var(--lions-silver-dark)]">
                Insight {String(i + 1).padStart(2, "0")}
              </div>
              <div className="font-display text-6xl font-black tabular text-[var(--lions-blue)]">
                {it.stat}
              </div>
              <div className="font-display text-lg font-bold uppercase tracking-tight text-[var(--lions-charcoal)]">
                {it.headline}
              </div>
              <p className="text-sm text-zinc-600">{it.sub}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── PULL QUOTE ────────────────────────────────────────────────────────────

function PullQuote() {
  return (
    <section className="bg-[var(--lions-blue)] py-20 text-[var(--lions-ink-inverse)]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="mb-6 flex items-center gap-3 font-display text-xs font-bold uppercase tracking-[0.3em] text-white/80">
          <span className="inline-block h-1.5 w-10 bg-white" />
          The Quote
        </div>
        <blockquote className="font-display text-4xl font-black uppercase leading-[0.95] tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span className="text-white/40">&ldquo;</span>
          We're gonna kick you in the teeth
          <span className="text-white/40"> · </span>
          <span className="italic">and</span> when you punch us back,
          <span className="text-white/40"> · </span>
          we're gonna smile at you.
          <span className="text-white/40">&rdquo;</span>
        </blockquote>
        <div className="mt-6 font-display text-sm font-bold uppercase tracking-[0.25em] text-white/80">
          — Dan Campbell · Introductory Press Conference · Jan 2021
        </div>
      </div>
    </section>
  );
}

// ─── STAT LEADERS (with sparklines) ────────────────────────────────────────

function StatLeaders({
  season,
  receivers,
  weeks,
}: {
  season: number;
  receivers: Receiver[];
  weeks: ReceiverWeek[];
}) {
  if (!receivers.length) {
    return (
      <section id="leaders" className="border-y border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader
            eyebrow={`${season} · The Pass-Catchers`}
            title="Who Ate"
            sub="Loading receiving leaders…"
          />
          <div className="divide-y divide-zinc-100 border-y border-zinc-200">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonRow key={i} />
            ))}
          </div>
          <p className="mt-4 font-mono text-[10px] tracking-wider text-[var(--lions-silver-dark)]">
            If this hangs, the FastAPI service may be offline. Start it
            with: <code>uv run --python 3.11 uvicorn onepride_data.api:app</code>
          </p>
        </div>
      </section>
    );
  }

  const byPlayer: Record<string, number[]> = {};
  const weekLabelsByPlayer: Record<string, string[]> = {};
  for (const w of weeks) {
    (byPlayer[w.name] ??= []).push(w.yards);
    (weekLabelsByPlayer[w.name] ??= []).push(`W${w.week}`);
  }

  const leader = receivers[0];
  return (
    <section id="leaders" className="border-y border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow={`${season} · The Pass-Catchers`}
          title="Who Ate"
          sub="Receiving leaders, sorted by yards. Sparklines = per-week receiving yards."
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-[var(--lions-blue-deep)] font-display text-xs font-bold uppercase tracking-wider text-[var(--lions-silver-dark)]">
              <tr>
                <th className="py-2">#</th>
                <th className="py-2">Player</th>
                <th className="py-2">Pos</th>
                <th className="py-2 text-right">G</th>
                <th className="py-2 text-right">Tgt</th>
                <th className="py-2 text-right">Rec</th>
                <th className="py-2 text-right">Yards</th>
                <th className="py-2 text-right">TD</th>
                <th className="py-2 pl-4">Trend</th>
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
                  <td className="py-2 font-semibold">
                    <span className="inline-flex items-center gap-2">
                      {JERSEY_NUMBERS[r.name] !== undefined && (
                        <span
                          className="inline-flex h-5 min-w-[1.75rem] items-center justify-center rounded-sm bg-[var(--lions-blue)] px-1 font-mono text-[10px] font-bold text-white"
                          aria-label={`Jersey number ${JERSEY_NUMBERS[r.name]}`}
                        >
                          {JERSEY_NUMBERS[r.name]}
                        </span>
                      )}
                      {r.name}
                    </span>
                  </td>
                  <td className="py-2 text-[var(--lions-silver-dark)]">
                    {r.position}
                  </td>
                  <td className="py-2 text-right">{r.games}</td>
                  <td className="py-2 text-right">{r.targets}</td>
                  <td className="py-2 text-right">{r.catches}</td>
                  <td className="py-2 text-right font-bold">{r.yards}</td>
                  <td className="py-2 text-right">{r.tds ?? "—"}</td>
                  <td className="py-2 pl-4">
                    <Sparkline
                      values={byPlayer[r.name] ?? []}
                      labels={weekLabelsByPlayer[r.name] ?? []}
                      unitSuffix="yds"
                    />
                  </td>
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
          on {leader.targets} targets in {leader.games} games. Per-week
          receiving yards rendered in-row.
        </p>
      </div>
    </section>
  );
}

// ─── DIVISION STANDINGS ────────────────────────────────────────────────────

function DivisionStandings({
  season,
  standings,
}: {
  season: number;
  standings: StandingsRow[];
}) {
  if (!standings.length) return null;
  return (
    <section id="standings" className="bg-zinc-50 py-12">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow={`${season} · NFC North`}
          title="Division"
          sub="Final regular-season standings."
        />
        <div className="border-2 border-[var(--lions-blue-deep)] bg-white">
          <table className="w-full text-left font-display">
            <thead className="border-b-2 border-[var(--lions-blue-deep)] text-xs font-bold uppercase tracking-wider text-[var(--lions-silver-dark)]">
              <tr>
                <th className="py-2 px-4">Team</th>
                <th className="py-2 px-4 text-right">W</th>
                <th className="py-2 px-4 text-right">L</th>
                <th className="py-2 px-4 text-right">T</th>
                <th className="py-2 px-4 text-right">PF</th>
                <th className="py-2 px-4 text-right">PA</th>
                <th className="py-2 px-4 text-right">Diff</th>
              </tr>
            </thead>
            <tbody className="text-lg tabular">
              {standings.map((s, i) => (
                <tr
                  key={s.team}
                  className={`border-b border-zinc-100 ${
                    s.team === "DET" ? "bg-[var(--lions-blue)]/5 font-bold" : ""
                  }`}
                >
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-3">
                      <span
                        className={`font-mono text-xs ${
                          i === 0
                            ? "text-[var(--lions-silver-light)]"
                            : "text-[var(--lions-silver-dark)]"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={
                          s.team === "DET"
                            ? "text-[var(--lions-blue)]"
                            : "text-[var(--lions-charcoal)]"
                        }
                      >
                        {TEAM_NAMES[s.team] ?? s.team}
                      </span>
                      <span className="font-mono text-[10px] uppercase tracking-wider text-[var(--lions-silver-dark)]">
                        {s.team}
                      </span>
                      {i === 0 && (
                        <span className="dub-badge text-[9px]">DIV</span>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right">{s.wins}</td>
                  <td className="py-3 px-4 text-right">{s.losses}</td>
                  <td className="py-3 px-4 text-right text-[var(--lions-silver-dark)]">
                    {s.ties}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--lions-silver-dark)]">
                    {s.points_for}
                  </td>
                  <td className="py-3 px-4 text-right text-[var(--lions-silver-dark)]">
                    {s.points_against}
                  </td>
                  <td
                    className={`py-3 px-4 text-right ${
                      s.diff >= 0
                        ? "text-[var(--lions-blue)]"
                        : "text-zinc-500"
                    }`}
                  >
                    {s.diff >= 0 ? "+" : ""}
                    {s.diff}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
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
    <section className="bg-[var(--lions-blue-deep)] py-14 text-[var(--lions-ink-inverse)]">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-accent)]">
          <span className="inline-block h-1.5 w-6 bg-[var(--lions-accent)]" />
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
              className="border-l-4 border-[var(--lions-accent)] bg-[var(--lions-blue-deep)]/40 p-4 ring-1 ring-white/10"
            >
              <div className="font-display text-3xl font-black tabular">
                {y.y}
              </div>
              <div className="font-display text-2xl font-bold uppercase text-[var(--lions-silver)] tabular">
                {y.rec}
              </div>
              <div className="mt-2 text-xs text-[var(--lions-silver-light)]/85">{y.note}</div>
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
  lastUpdated,
}: {
  pointsFor: number;
  pointsAgainst: number;
  lastUpdated: string;
}) {
  return (
    <footer className="border-t-2 border-[var(--lions-accent)] bg-[var(--lions-blue-deep)] text-[var(--lions-silver-light)]/85">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <div className="mb-3 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-accent)]">
              About
            </div>
            <p className="text-sm text-[var(--lions-silver-light)]/85">
              1PRIDE is a 5-level self-paced data curriculum, with a Lions
              analytics app as the Level 5 capstone. Built on real nflverse
              data going back to 2021.
            </p>
            <div className="mt-3 font-mono text-[10px] tracking-wider">
              <span className="text-[var(--lions-silver-light)]">PF</span>{" "}
              <span className="text-white">{pointsFor || "—"}</span>{" "}
              <span className="text-[var(--lions-silver-light)]">PA</span>{" "}
              <span className="text-white">{pointsAgainst || "—"}</span>
            </div>
          </div>

          <div>
            <div className="mb-3 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-accent)]">
              Data
            </div>
            <ul className="space-y-1 text-sm">
              <li>
                <a
                  href="https://github.com/nflverse/nflverse-data"
                  className="hover:text-[var(--lions-silver)]"
                >
                  nflverse-data
                </a>
              </li>
              <li>Postgres 16 (local Docker / Neon prod)</li>
              <li>Updated weekly via GitHub Actions cron</li>
              <li className="font-mono text-[10px] tracking-wider text-zinc-500">
                Last UPD · {lastUpdated.split(" ").slice(1, 5).join(" ")}
              </li>
            </ul>
          </div>

          <div>
            <div className="mb-3 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-accent)]">
              Stack
            </div>
            <ul className="space-y-1 text-sm">
              <li>Next.js 16 · React 19</li>
              <li>FastAPI · uvicorn</li>
              <li>Tailwind 4</li>
              <li>Astro Starlight (curriculum)</li>
            </ul>
          </div>

          <div>
            <div className="mb-3 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-accent)]">
              Links
            </div>
            <ul className="space-y-1 text-sm">
              <li>
                <a href="https://1pride.app" className="hover:text-[var(--lions-silver)]">
                  Curriculum →
                </a>
              </li>
              <li>
                <Link href="/charts" className="hover:text-[var(--lions-silver)]">
                  The Chart Room →
                </Link>
              </li>
              <li>
                <a href="/api/health" className="hover:text-[var(--lions-silver)]">
                  Health
                </a>
              </li>
              <li>
                <a
                  href="https://github.com/harwoo17/1pride"
                  className="hover:text-[var(--lions-silver)]"
                >
                  GitHub →
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-zinc-800 pt-6 text-xs text-zinc-500 sm:flex sm:items-center sm:justify-between">
          <div>
            <span className="font-display font-bold text-white">1PRIDE</span> ·
            Lions analytics. Quotes are public press-conference statements. Not
            affiliated with the Detroit Lions or the NFL.
          </div>
          <div className="mt-2 font-mono text-[10px] tracking-wider sm:mt-0">
            L5 CAPSTONE · v0.3
          </div>
        </div>
      </div>
    </footer>
  );
}
