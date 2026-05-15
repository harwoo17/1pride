# 1PRIDE

> **Run your reps. Climb the depth chart.**

A self-paced data curriculum that takes you from `SELECT *` to a deployed
analytics app — using the entire Dan Campbell-era Detroit Lions dataset
(2021-present) as the substrate, and a football-org hierarchy as the
level progression.

![1PRIDE banner](https://app.1pride.app/opengraph-image)

**Live:**
- 📚 Curriculum → [1pride.app](https://1pride.app)
- 📊 Analytics app → [app.1pride.app](https://app.1pride.app)
- 🔌 API → [api.1pride.app/health](https://api.1pride.app/health)

[![Next.js 16](https://img.shields.io/badge/Next.js-16-000?logo=next.js)](https://nextjs.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110-009688?logo=fastapi)](https://fastapi.tiangolo.com/)
[![Postgres 16](https://img.shields.io/badge/Postgres-16-336791?logo=postgresql)](https://www.postgresql.org/)
[![Astro Starlight](https://img.shields.io/badge/Astro-Starlight-bc52ee?logo=astro)](https://starlight.astro.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-0076B6.svg)](#license)

---

## The 30-second pitch

Most data curricula teach SQL on toy datasets — Iris, NYC taxis, sample
sales tables. The retention drops because nobody cares about the data.

1PRIDE flips that. **The substrate is the entire Dan Campbell era of the
Detroit Lions** — 22,579 player-weeks, 1,400+ games, 248,000+ play-by-play
rows, 2021 through 2025. Five levels take you from your first `SELECT`
to a deployed Next.js + FastAPI analytics app. The capstone is a live
URL someone can land on and learn something from.

This is a **portfolio project**. The end state is something a hiring
manager opens, scrolls for two minutes, and concludes "this person can
ship the whole stack."

## What's in here

| Path | What it is | Deployed to |
|---|---|---|
| [`site/`](./site) | Curriculum site — Astro + Starlight | `1pride.app` |
| [`app/`](./app) | Level 5 capstone — Next.js 16 + React 19 + Tailwind 4 | `app.1pride.app` |
| [`data/`](./data) | Postgres schema, nflverse loader, FastAPI service | `api.1pride.app` (Fly.io) |
| [`DEPLOY.md`](./DEPLOY.md) | End-to-end deploy runbook |  |

## The depth chart

| Level | Role | SQL focus | Python focus | Capstone |
|---|---|---|---|---|
| **1** | Analyst | `SELECT`, `WHERE`, `ORDER BY`, aggregates | pandas, matplotlib | [Lions 2024 season recap notebook](./data/notebooks/01-capstone-lions-2024-recap.ipynb) |
| **2** | Position coach | `JOIN`, `GROUP BY`, `HAVING` | merge, groupby, pivot | [WR efficiency scouting card](./data/notebooks/02-capstone-wr-scouting-card.ipynb) |
| **3** | Head coach | Window functions, CTEs, `CASE` | plotly, scipy.stats, PBP | [4th-down decision analyzer](./data/notebooks/03-capstone-4th-down-analyzer.ipynb) |
| **4** | General manager | Schema design, indexes, dbt | scikit-learn, pipelines, CV | [Draft pick value model](./data/notebooks/04-capstone-draft-pick-value.ipynb) |
| **5** | Owner | Prod DB admin, performance tuning | FastAPI, deployment, ETL orchestration | [`app.1pride.app`](https://app.1pride.app) — this very project |

**33 lessons · 42 challenges · 5 capstones**, all on real Lions data.

## What I actually built

This is the breadth + depth showcase. Each piece is wired to the others.

### Data layer — `data/`
- **Postgres 16 schema** with three tables (`weekly_stats`, `schedules`, `pbp`) totaling ~270k rows for the 2021-25 Lions data
- **Idempotent nflverse loader** in Python (Click CLI, SQLAlchemy 2.x, psycopg)
  delete-by-year strategy; handles partial-season backfills, weekly refreshes,
  and "nflverse hasn't published this aggregate yet" fallback via PBP-derived
  `weekly_stats`
- **`--neon-url` convenience flag** that auto-prefixes the `postgresql+psycopg://`
  scheme SQLAlchemy needs

### API — `data/src/onepride_data/api.py`
- **FastAPI service** with 7 typed endpoints (seasons, weekly scoring, top
  receivers, receiver-week trends, NFC North standings, 4th-down decisions,
  health probe)
- **Bound query parameters** via `Query(..., ge=, le=)` — no string-formatted SQL
- **CORS** locked to localhost dev + production app domain
- **Two-stage Dockerfile** for Fly.io deployment, scale-to-zero for free tier

### Curriculum site — `site/`
- **Astro + Starlight** static site (78 pages)
- Custom **`<Lesson>` + `<LessonSection>`** components giving every lesson the
  same shape: Hook → Concept → Lions example → Try it → Common mistakes → Quick check
- **`<Challenge>`** component with difficulty tiers (Rookie / Starter / All-Pro),
  collapsible hints and solutions
- 1PRIDE branding (Honolulu Blue palette, Inter + JetBrains Mono) layered onto
  Starlight defaults

### L5 app — `app/`
- **Next.js 16 (App Router) + React 19 + Tailwind 4**
- **Server components** fetch from the FastAPI; client components handle
  interactivity (CountUp, FadeIn, Sparkline tooltips, intro animation)
- **Animated intro overlay** with pixel-art mascots, scripted sound design,
  and a real lion roar (royalty-free Pixabay sample)
- **Charts page** with bar-pair hover tooltips, summary stat strips, and
  per-section fade-in cadence
- **Reduced-motion respect** — every animation has an opt-out path
- **Dynamic Open Graph image** via `next/og` rendered at the edge
- **Mobile-tuned typography** with step-down sizes at small breakpoints

### Notable engineering decisions

- **Two-domain deploy**: the curriculum and the app are separate Vercel projects.
  The brief envisioned one repo splitting into `1pride` + `1pride-app` eventually;
  the monorepo lets me iterate on both with shared config and a single deploy
  workflow.
- **Server-component-safe primitives**: `<CountUp>` takes only primitive props
  (numbers + strings) because Next.js's server→client serialization rejects
  function props. Discovered that the hard way.
- **React 19 metadata hoisting** broke a first sparkline tooltip attempt that
  used native `<title>` elements (React 19 auto-hoists them to `<head>`).
  Rebuilt as a state-based positioned tooltip — better UX anyway.
- **PBP-derived weekly stats** for 2025: nflverse hadn't published the season's
  aggregate when I shipped, but PBP was live. The loader rebuilds `weekly_stats`
  from PBP + `import_seasonal_rosters`, with team-aware name matching and
  PK-collision collapsing for mid-season trades.

## Quick start (local dev)

You need **Node 20+**, **Python 3.11**, **Postgres 16**, and **uv**.
Setup is `~10 min` once these are installed; **~15 min** if you also want
the full play-by-play loaded.

```bash
# 1. Curriculum site
cd site
npm install
npm run dev                                    # → http://localhost:4321

# 2. Postgres (via Homebrew or Docker)
brew services start postgresql@16
createuser -s onepride
createdb -O onepride onepride
psql -U onepride -d onepride -f data/schema.sql

# 3. Load Lions data
cd ../data
uv sync --extra api --extra notebooks
uv run --python 3.11 python -m onepride_data.load \
    --years 2021-2024 --tables all              # ~10-15 min (PBP is the slow part)

# 4. FastAPI service
uv run --python 3.11 uvicorn onepride_data.api:app \
    --host 0.0.0.0 --port 8000 --app-dir src    # → http://localhost:8000/health

# 5. L5 analytics app
cd ../app
npm install
npm run dev                                    # → http://localhost:3000
```

For the production deploy path (Vercel + Neon + Fly.io with custom DNS),
see [`DEPLOY.md`](./DEPLOY.md).

## Architecture

```
                ┌────────────────────────────────────┐
                │             nflverse               │
                │  (weekly stats, schedules, PBP)    │
                └─────────────────┬──────────────────┘
                                  │
                          nfl_data_py
                                  │
                                  ▼
        ┌─────────────────────────────────────────────────┐
        │      onepride_data.load  (uv-managed CLI)       │
        │  • delete-by-year idempotency                   │
        │  • PBP-derive fallback for in-progress seasons  │
        │  • --neon-url helper for the prefix gotcha      │
        └─────────────────────┬───────────────────────────┘
                              │
                              ▼
                ┌────────────────────────────┐
                │     Postgres 16            │
                │  weekly_stats · schedules  │
                │  pbp                       │
                └─────────────┬──────────────┘
                              │
                       sqlalchemy + psycopg
                              │
                              ▼
                ┌───────────────────────────┐
                │     FastAPI service       │
                │  7 typed endpoints        │
                │  CORS · bound params      │
                └─────────────┬─────────────┘
                              │
                          fetch + cache
                              │
                              ▼
        ┌───────────────────────────────────────────┐
        │   Next.js 16 · React 19 · Tailwind 4      │
        │   • Server components fetch on the server │
        │   • Client components animate + interact  │
        │   • Edge-rendered Open Graph image        │
        └───────────────────────────────────────────┘
                              │
                              ▼
                ┌───────────────────────────┐
                │  app.1pride.app · Vercel  │
                └───────────────────────────┘
```

## Branding & legal

1PRIDE uses Lions stats and a Honolulu-Blue-ish palette because they're
descriptive and not trademarkable. The official Detroit Lions logo, the
NFL shield, and team-branded broadcast imagery do not appear in this
project, and 1PRIDE is not affiliated with or endorsed by the Detroit
Lions or the NFL.

The data layer is built so any team can be swapped in as the default —
the curriculum's "Lions example" sections are convention, not lock-in.

Dan Campbell quotes in the L5 app are from public press conferences
(2021–present) and are credited as such.

## License

- **Code**: MIT.
- **Curriculum content**: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- **Data**: via [nflverse](https://github.com/nflverse), under their
  educational-use license.
- **Sound effects**: the lion roar is from
  [Pixabay (Soundzee)](https://pixabay.com/sound-effects/) under the
  Pixabay Content License (commercial use OK).

## Acknowledgments

Built on the shoulders of [nflverse](https://github.com/nflverse) — without their
data pipeline, this project doesn't exist.

Curriculum structure inspired by the depth-chart progression of NFL
front offices. Visual language inspired by NFL.com lower-thirds, The
Athletic long-form articles, and Murakami × Virgil ×
Supreme × Lions if you squint.
