"""Load nflverse data into the local 1PRIDE Postgres.

Usage:
    uv run python -m onepride_data.load --years 2020-2024
    uv run python -m onepride_data.load --years 2024 --tables weekly
    uv run python -m onepride_data.load --years 2024 --truncate
"""
from __future__ import annotations

import logging
from typing import Iterable

import click
import nfl_data_py as nfl
import pandas as pd
from sqlalchemy import text

from .db import engine

logging.basicConfig(level=logging.INFO, format="%(asctime)s %(levelname)s %(message)s")
log = logging.getLogger("onepride.load")

WEEKLY_COLUMNS = [
    "player_id", "player_display_name", "position", "position_group",
    "recent_team", "season", "week", "season_type", "opponent_team",
    "completions", "attempts", "passing_yards", "passing_tds", "interceptions",
    "sacks", "sack_yards", "passing_epa",
    "carries", "rushing_yards", "rushing_tds", "rushing_fumbles", "rushing_epa",
    "receptions", "targets", "receiving_yards", "receiving_tds",
    "receiving_air_yards", "receiving_epa",
    "fantasy_points", "fantasy_points_ppr",
]

SCHEDULES_COLUMNS = [
    "game_id", "season", "game_type", "week", "gameday", "weekday", "gametime",
    "away_team", "away_score", "home_team", "home_score",
    "result", "total", "overtime",
    "stadium", "roof", "surface", "temp", "wind",
]


def _parse_years(spec: str) -> list[int]:
    """Parse '2020-2024' or '2020,2022,2024' or '2024' into a list of ints."""
    spec = spec.strip()
    if "-" in spec:
        a, b = spec.split("-", 1)
        return list(range(int(a), int(b) + 1))
    return [int(y.strip()) for y in spec.split(",")]


def _select_columns(df: pd.DataFrame, wanted: Iterable[str]) -> pd.DataFrame:
    """Keep only columns we have a schema for; fill missing with None."""
    wanted = list(wanted)
    for col in wanted:
        if col not in df.columns:
            df[col] = None
    return df[wanted]


def load_weekly(years: list[int], truncate: bool) -> int:
    log.info("Pulling weekly stats for %s", years)
    df = nfl.import_weekly_data(years)
    df = _select_columns(df, WEEKLY_COLUMNS)

    eng = engine()
    with eng.begin() as conn:
        if truncate:
            log.info("TRUNCATE weekly_stats")
            conn.execute(text("TRUNCATE TABLE weekly_stats"))
        else:
            log.info("DELETE existing rows for years %s", years)
            conn.execute(
                text("DELETE FROM weekly_stats WHERE season = ANY(:years)"),
                {"years": years},
            )

    df.to_sql("weekly_stats", eng, if_exists="append", index=False, method="multi", chunksize=1000)
    log.info("Inserted %d rows into weekly_stats", len(df))
    return len(df)


def load_schedules(years: list[int], truncate: bool) -> int:
    log.info("Pulling schedules for %s", years)
    df = nfl.import_schedules(years)
    df = _select_columns(df, SCHEDULES_COLUMNS)

    eng = engine()
    with eng.begin() as conn:
        if truncate:
            log.info("TRUNCATE schedules")
            conn.execute(text("TRUNCATE TABLE schedules"))
        else:
            conn.execute(
                text("DELETE FROM schedules WHERE season = ANY(:years)"),
                {"years": years},
            )

    df.to_sql("schedules", eng, if_exists="append", index=False, method="multi", chunksize=1000)
    log.info("Inserted %d rows into schedules", len(df))
    return len(df)


@click.command()
@click.option(
    "--years", default="2024",
    help="Years to load. Accepts '2024', '2020-2024', or '2020,2022,2024'.",
)
@click.option(
    "--tables", default="all",
    type=click.Choice(["all", "weekly", "schedules"]),
    help="Which tables to load.",
)
@click.option(
    "--truncate/--no-truncate", default=False,
    help="TRUNCATE before insert (vs delete-by-year, the default).",
)
def main(years: str, tables: str, truncate: bool) -> None:
    """Load nflverse data into the local 1PRIDE Postgres."""
    year_list = _parse_years(years)
    log.info("Target years: %s", year_list)

    if tables in ("all", "weekly"):
        load_weekly(year_list, truncate)
    if tables in ("all", "schedules"):
        load_schedules(year_list, truncate)

    log.info("Done.")


if __name__ == "__main__":
    main()
