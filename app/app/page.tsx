import Link from "next/link";
import {
  getWeeklyScoring,
  getTopReceivers,
  type Receiver,
  type WeeklyGame,
} from "@/lib/api";

export const revalidate = 3600;

const ERA_START = 2021;
const LATEST_SEASON = 2025;

export default async function Home() {
  const [scoring, receivers] = await Promise.all([
    getWeeklyScoring(LATEST_SEASON),
    getTopReceivers(LATEST_SEASON, 6),
  ]);

  const games = scoring?.games ?? [];
  const wins = games.filter((g) => g.scored > g.allowed).length;
  const losses = games.filter((g) => g.scored < g.allowed).length;
  const pointsFor = games.reduce((s, g) => s + g.scored, 0);
  const pointsAgainst = games.reduce((s, g) => s + g.allowed, 0);
  const ppg = games.length ? (pointsFor / games.length).toFixed(1) : "—";

  return (
    <>
      <Ticker games={games} />
      <Header />

      <main className="flex-1">
        <Hero
          season={LATEST_SEASON}
          wins={wins}
          losses={losses}
          ppg={ppg}
          pointsFor={pointsFor}
          pointsAgainst={pointsAgainst}
        />
        <StatLeaders
          season={LATEST_SEASON}
          receivers={receivers?.receivers ?? []}
        />
        <CampbellEra />
        <ChartsPreview />
      </main>

      <Footer />
    </>
  );
}

// ─── TICKER ────────────────────────────────────────────────────────────────

function Ticker({ games }: { games: WeeklyGame[] }) {
  if (!games.length) return null;
  const entries = games.flatMap((g) => [g, g]); // double for seamless loop

  return (
    <div className="border-y-2 border-[var(--lions-blue)] bg-[var(--lions-blue-deep)] overflow-hidden">
      <div className="ticker-track flex w-max gap-12 py-2 whitespace-nowrap font-display text-base font-semibold tracking-wider text-white uppercase">
        {entries.map((g, i) => {
          const result =
            g.scored > g.allowed
              ? "W"
              : g.scored < g.allowed
                ? "L"
                : "T";
          return (
            <span key={i} className="flex items-center gap-3 px-4 tabular">
              <span className="text-[var(--lions-blue)]">WK {g.week}</span>
              <span>DET</span>
              <span className="text-[var(--lions-silver)]">{g.scored}</span>
              <span>{g.opp}</span>
              <span className="text-[var(--lions-silver)]">{g.allowed}</span>
              <span
                className={
                  result === "W"
                    ? "rounded bg-[var(--lions-blue)] px-2 text-white"
                    : result === "L"
                      ? "rounded border border-[var(--lions-silver-dark)] px-2 text-[var(--lions-silver)]"
                      : "rounded bg-[var(--lions-silver)] px-2 text-[var(--lions-blue-deep)]"
                }
              >
                {result}
              </span>
            </span>
          );
        })}
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
            Lions Analytics · Campbell Era
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

// ─── HERO ──────────────────────────────────────────────────────────────────

function Hero({
  season,
  wins,
  losses,
  ppg,
  pointsFor,
  pointsAgainst,
}: {
  season: number;
  wins: number;
  losses: number;
  ppg: string;
  pointsFor: number;
  pointsAgainst: number;
}) {
  return (
    <section className="stripes border-b border-zinc-200 bg-gradient-to-b from-white to-zinc-50">
      <div className="mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[1.4fr_1fr]">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-blue)]">
            <span className="inline-block h-1.5 w-6 bg-[var(--lions-blue)]" />
            Season {season} · Regular Season
          </div>
          <h1 className="font-display text-6xl font-black uppercase leading-none tracking-tight text-[var(--lions-charcoal)] sm:text-7xl lg:text-8xl">
            Run your reps.
            <br />
            <span className="text-[var(--lions-blue)]">Climb the depth chart.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-zinc-600">
            Lions analytics built on real nflverse data. Five levels of curriculum
            shipped into a deployable app at app.1pride.dev — the Level 5 capstone
            of the{" "}
            <a
              href="https://1pride.dev"
              className="font-semibold text-[var(--lions-blue)] hover:underline"
            >
              1PRIDE
            </a>{" "}
            project.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <StatBox label="Record" value={`${wins}–${losses}`} />
          <StatBox label="PPG" value={ppg} />
          <StatBox label="Points For" value={pointsFor || "—"} />
          <StatBox label="Points Against" value={pointsAgainst || "—"} />
        </div>
      </div>
    </section>
  );
}

function StatBox({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="flex flex-col justify-between border-l-4 border-[var(--lions-blue)] bg-white p-4 shadow-sm">
      <div className="font-display text-xs font-bold uppercase tracking-[0.18em] text-[var(--lions-silver-dark)]">
        {label}
      </div>
      <div className="font-display text-5xl font-black tabular text-[var(--lions-charcoal)]">
        {value}
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
      <section className="border-b border-zinc-200 bg-white py-12">
        <div className="mx-auto max-w-6xl px-6">
          <SectionHeader eyebrow={`${season} · Receiving Leaders`} title="Stat Leaders" />
          <p className="text-sm text-zinc-500">
            API offline — start the FastAPI service to see live leaders.
          </p>
        </div>
      </section>
    );
  }

  const leader = receivers[0];
  return (
    <section className="border-b border-zinc-200 bg-white py-12">
      <div className="mx-auto max-w-6xl px-6">
        <SectionHeader
          eyebrow={`${season} · Receiving Leaders`}
          title="Stat Leaders"
        />

        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="border-b-2 border-[var(--lions-charcoal)] font-display text-xs font-bold uppercase tracking-wider text-[var(--lions-silver-dark)]">
              <tr>
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
                      : "border-b border-zinc-100"
                  }
                >
                  <td className="py-2 font-semibold">{r.name}</td>
                  <td className="py-2 text-[var(--lions-silver-dark)]">
                    {r.position}
                  </td>
                  <td className="py-2 text-right">{r.games}</td>
                  <td className="py-2 text-right">{r.targets}</td>
                  <td className="py-2 text-right">{r.catches}</td>
                  <td className="py-2 text-right font-bold">{r.yards}</td>
                  <td className="py-2 text-right">{r.tds}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-4 text-xs text-zinc-500">
          {leader.name} led the room with{" "}
          <span className="font-semibold text-[var(--lions-blue)]">
            {leader.yards} yards
          </span>{" "}
          and {leader.tds} TDs over {leader.games} games.
        </p>
      </div>
    </section>
  );
}

// ─── CAMPBELL ERA ──────────────────────────────────────────────────────────

function CampbellEra() {
  const years = [
    { y: 2021, rec: "3–13–1", note: "Year one. The 'kneecaps' era begins." },
    { y: 2022, rec: "9–8", note: "Late-season surge. Foundation set." },
    { y: 2023, rec: "12–5", note: "NFC North title. NFC Championship loss." },
    { y: 2024, rec: "15–2", note: "Best regular season in franchise history." },
    { y: 2025, rec: "9–8", note: "Regression year. Still in the playoff mix." },
  ];
  return (
    <section className="bg-[var(--lions-blue-deep)] py-14 text-white">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-3 font-display text-xs font-bold uppercase tracking-[0.25em] text-[var(--lions-blue)]">
          {ERA_START}–Present
        </div>
        <h2 className="font-display text-4xl font-black uppercase tracking-tight sm:text-5xl">
          The Campbell Era
        </h2>
        <p className="mt-3 max-w-2xl text-sm text-zinc-300">
          Every chart and lesson in 1PRIDE is built on Dan Campbell&apos;s
          tenure. Real games, real data, four full seasons in the database.
        </p>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {years.map((y) => (
            <div
              key={y.y}
              className="border-l-4 border-[var(--lions-blue)] bg-[var(--lions-blue-deep)]/40 p-4 ring-1 ring-white/10"
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
            sub="Interactive views of the Campbell-era Lions."
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
            body="Points scored vs allowed. Cumulative differential through the season."
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

function Footer() {
  return (
    <footer className="border-t-2 border-[var(--lions-blue-deep)] bg-[var(--lions-charcoal)] text-zinc-400">
      <div className="mx-auto flex max-w-6xl flex-col gap-2 px-6 py-6 text-xs sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-display font-bold text-white">1PRIDE</span> ·
          Lions analytics built on{" "}
          <a
            href="https://github.com/nflverse"
            className="text-[var(--lions-blue)] hover:underline"
          >
            nflverse
          </a>
          . Not affiliated with the Detroit Lions or the NFL.
        </div>
        <div className="font-mono text-[10px] tracking-wider text-zinc-500">
          L5 CAPSTONE · v0.1
        </div>
      </div>
    </footer>
  );
}
