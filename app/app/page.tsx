import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2 font-semibold tracking-tight">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#0076B6]" />
            1PRIDE
          </div>
          <nav className="text-sm text-zinc-600 dark:text-zinc-400">
            <Link
              href="/charts"
              className="hover:text-zinc-900 dark:hover:text-zinc-100"
            >
              Charts
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-6 py-16">
        <section className="flex flex-col gap-4">
          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-[#0076B6]/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-[#0076B6]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#0076B6]" />
            Level 5 capstone · work in progress
          </span>
          <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
            Lions analytics, end to end.
          </h1>
          <p className="max-w-2xl text-lg text-zinc-600 dark:text-zinc-400">
            Raw nflverse data → ETL → Postgres → FastAPI → this Next.js UI. Built
            as the Level 5 capstone of the{" "}
            <a
              href="https://1pride.dev"
              className="font-medium text-[#0076B6] hover:underline"
            >
              1PRIDE
            </a>{" "}
            data curriculum.
          </p>
        </section>

        <section className="grid gap-4 sm:grid-cols-3">
          <Card
            label="Data"
            title="nflverse + Postgres"
            body="Weekly stats, schedules, and play-by-play loaded from nflverse via a scheduled ETL job."
          />
          <Card
            label="API"
            title="FastAPI"
            body="A typed Python API serving aggregations for the charts on this site. Coming online with Level 5."
          />
          <Card
            label="UI"
            title="Next.js + Observable Plot"
            body="This site. Interactive Lions analytics, deployed at app.1pride.dev."
          />
        </section>

        <section className="rounded-lg border border-zinc-200 bg-zinc-50 p-6 text-sm dark:border-zinc-800 dark:bg-zinc-900">
          <p className="font-medium">Status</p>
          <p className="mt-1 text-zinc-600 dark:text-zinc-400">
            Scaffold only. No real data is wired up yet — the L5 build comes
            after L1-L4 capstones ship. See{" "}
            <a
              href="https://1pride.dev/levels/5-owner/"
              className="text-[#0076B6] hover:underline"
            >
              the Level 5 brief
            </a>{" "}
            on the curriculum site for what lands here next.
          </p>
        </section>
      </main>

      <footer className="border-t border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-5xl px-6 py-6 text-xs text-zinc-500">
          Data via{" "}
          <a
            href="https://github.com/nflverse"
            className="hover:text-zinc-900 dark:hover:text-zinc-100"
          >
            nflverse
          </a>
          . Not affiliated with the Detroit Lions or the NFL.
        </div>
      </footer>
    </div>
  );
}

function Card({
  label,
  title,
  body,
}: {
  label: string;
  title: string;
  body: string;
}) {
  return (
    <div className="rounded-lg border border-zinc-200 p-5 dark:border-zinc-800">
      <div className="text-xs font-semibold uppercase tracking-wider text-[#0076B6]">
        {label}
      </div>
      <div className="mt-2 text-lg font-medium">{title}</div>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
    </div>
  );
}
