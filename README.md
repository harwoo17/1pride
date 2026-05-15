# 1PRIDE

**Run your reps. Climb the depth chart.**

A self-paced data curriculum that takes you from `SELECT *` to a deployed analytics
app, using Detroit Lions data as the substrate and a football-org hierarchy as the
level progression.

This repo holds both the curriculum site and the local data layer. The Level 5
capstone app will live in a sibling repo (`1pride-app`).

## What's in here

| Path | What it is |
|---|---|
| [`site/`](./site) | Curriculum site — Astro + Starlight, deploys to `1pride.dev` |
| [`data/`](./data) | Local Postgres + Python loader for nflverse data |
| [`1pride_brief.md`](./1pride_brief.md) | The project brief |

## The depth chart

| Level | Role | Capstone |
|---|---|---|
| 1 | Analyst | Lions 2024 season recap notebook |
| 2 | Position coach | WR efficiency scouting card |
| 3 | Head coach | 4th-down decision EV analyzer |
| 4 | General manager | Draft pick value model |
| 5 | Owner | Deployed analytics app at `app.1pride.dev` |

## Quick start

```bash
# 1. Curriculum site
cd site
npm install
npm run dev        # → http://localhost:4321

# 2. Local data layer (Postgres + nflverse)
cd ../data
docker compose up -d
uv sync
uv run python -m onepride_data.load --years 2020-2024

# 3. Verify
uv run python -c "import psycopg; \
  c = psycopg.connect('postgresql://onepride:lions@localhost:5432/onepride'); \
  print(c.execute('SELECT COUNT(*) FROM weekly_stats').fetchone())"
```

## Branding

1PRIDE uses Lions stats and a Honolulu-Blue-ish palette because they're descriptive
and not trademarkable. The official Detroit Lions logo, the NFL shield, and team-
branded broadcast imagery don't appear here, and 1PRIDE is not affiliated with or
endorsed by the Detroit Lions or the NFL.

The data layer is built so any team can be swapped in as the default.

## License

MIT for the code. Curriculum content released CC BY-SA 4.0.
