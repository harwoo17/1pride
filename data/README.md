# 1PRIDE — local data layer

Postgres in Docker, nflverse data via `nfl_data_py`, loaded with a Click CLI.

## What gets loaded

| Table | Source | Notes |
|---|---|---|
| `weekly_stats` | `nfl.import_weekly_data` | One row per player-week-season |
| `schedules`    | `nfl.import_schedules`    | One row per game |
| `pbp`          | `nfl.import_pbp_data`     | One row per play. Needed for Level 3+. |

Schema lives in [`schema.sql`](./schema.sql) and is loaded automatically by Docker
the first time the Postgres container boots.

## Setup

```bash
# 1. Start Postgres (also runs schema.sql)
docker compose up -d
docker compose ps   # postgres should be "healthy"

# 2. Python env
uv sync

# 3. Load default years (2020-2024) into both tables
uv run python -m onepride_data.load --years 2020-2024
```

That's enough for every Level 1 lesson and challenge.

## CLI

```bash
# Single year, L1/L2 tables (default)
uv run python -m onepride_data.load --years 2024

# Just one table
uv run python -m onepride_data.load --years 2024 --tables weekly
uv run python -m onepride_data.load --years 2024 --tables schedules

# Add play-by-play (slow — ~50k rows per season, several hundred MB total)
uv run python -m onepride_data.load --years 2024 --tables pbp

# Everything
uv run python -m onepride_data.load --years 2020-2024 --tables all

# Comma list (non-contiguous years)
uv run python -m onepride_data.load --years 2019,2021,2023

# Wipe target tables before insert (vs. default which deletes-by-year)
uv run python -m onepride_data.load --years 2020-2024 --truncate
```

## Connecting from a notebook

```python
from sqlalchemy import create_engine
import pandas as pd

eng = create_engine("postgresql+psycopg://onepride:lions@localhost:5432/onepride")
df = pd.read_sql("SELECT player_display_name, rushing_yards "
                 "FROM weekly_stats "
                 "WHERE recent_team = 'DET' AND season = 2024 AND week = 1 "
                 "ORDER BY rushing_yards DESC", eng)
print(df)
```

Or run raw SQL with `psql`:

```bash
docker compose exec postgres \
    psql -U onepride -d onepride \
    -c "SELECT COUNT(*) FROM weekly_stats;"
```

## Troubleshooting

- **Port 5432 already in use.** You have another Postgres running. Either stop it
  (`brew services stop postgresql@16`) or change the host port in
  `docker-compose.yml` to e.g. `"5433:5432"` and update `DATABASE_URL`.
- **`nfl_data_py` fails to fetch a season.** nflverse occasionally re-publishes
  data. Re-run with `--years <year>` to refresh that season.
- **`pg_dump` for a clean reset.** `docker compose down -v` wipes the volume.
  The schema reloads on the next `up`.
