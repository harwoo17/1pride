import Link from "next/link";

export const metadata = {
  title: "Charts — 1PRIDE",
};

export default function ChartsPage() {
  return (
    <div className="flex flex-1 flex-col bg-white text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100">
      <header className="border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-2 font-semibold">
            <span className="inline-block h-3 w-3 rounded-sm bg-[#0076B6]" />
            1PRIDE
          </Link>
          <nav className="text-sm text-zinc-600">Charts</nav>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-8 px-6 py-12">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Charts</h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Placeholder cards for the charts that ship with Level 5. Each one
            will be powered by the FastAPI service reading from the local
            Postgres.
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <Placeholder
            title="Weekly scoring margin"
            body="Lions points scored vs allowed, by week. Cumulative differential line on top."
          />
          <Placeholder
            title="WR room comparison"
            body="Targets, catches, yards, and TDs per game across DET WRs vs NFC North peers."
          />
          <Placeholder
            title="4th-down decisions"
            body="Every Lions 4th down with the model's recommendation vs the actual call."
          />
          <Placeholder
            title="Draft pick value"
            body="Predicted vs realized career AV for Lions draft picks, 2020-2025."
          />
        </div>
      </main>
    </div>
  );
}

function Placeholder({ title, body }: { title: string; body: string }) {
  return (
    <div className="flex flex-col gap-3 rounded-lg border border-dashed border-zinc-300 p-6 dark:border-zinc-700">
      <div className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
        Coming with L5
      </div>
      <div className="text-lg font-medium">{title}</div>
      <p className="text-sm text-zinc-600 dark:text-zinc-400">{body}</p>
      <div className="mt-2 flex h-32 items-center justify-center rounded border border-zinc-200 bg-zinc-50 text-xs text-zinc-400 dark:border-zinc-800 dark:bg-zinc-900">
        chart goes here
      </div>
    </div>
  );
}
