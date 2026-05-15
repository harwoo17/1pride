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

PBP_COLUMNS = [
    "play_id", "game_id", "season", "week", "season_type",
    "posteam", "defteam", "qtr", "down", "ydstogo", "yardline_100",
    "game_seconds_remaining", "quarter_seconds_remaining", "half_seconds_remaining",
    "score_differential", "posteam_score", "defteam_score",
    "play_type", "yards_gained", "epa", "wpa", "wp", "success",
    "passer_player_name", "rusher_player_name", "receiver_player_name",
    "desc",
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


def load_pbp(years: list[int], truncate: bool) -> int:
    log.info("Pulling play-by-play for %s (this is the slow one)", years)
    df = nfl.import_pbp_data(years, columns=PBP_COLUMNS, downcast=True)

    # The CSV field is named `desc`; our DB column is `description` (avoiding
    # the SQL keyword collision).
    if "desc" in df.columns:
        df = df.rename(columns={"desc": "description"})

    wanted = [c if c != "desc" else "description" for c in PBP_COLUMNS]
    df = _select_columns(df, wanted)

    eng = engine()
    with eng.begin() as conn:
        if truncate:
            log.info("TRUNCATE pbp")
            conn.execute(text("TRUNCATE TABLE pbp"))
        else:
            log.info("DELETE existing pbp rows for years %s", years)
            conn.execute(
                text("DELETE FROM pbp WHERE season = ANY(:years)"),
                {"years": years},
            )

    df.to_sql("pbp", eng, if_exists="append", index=False,
              method="multi", chunksize=2000)
    log.info("Inserted %d rows into pbp", len(df))
    return len(df)


def load_schedules(years: list[int], truncate: bool) -> int:
    log.info("Pulling schedules for %s", years)
    df = nfl.import_schedules(years)
    df = _select_columns(df, SCHEDULES_COLUMNS)
    df["gameday"] = pd.to_datetime(df["gameday"], errors="coerce").dt.date

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
    "--tables", default="weekly+schedules",
    type=click.Choice(["all", "weekly", "schedules", "pbp", "weekly+schedules"]),
    help=(
        "Which tables to load. 'weekly+schedules' is the L1/L2 default; "
        "'pbp' is the slow L3+ play-by-play; 'all' includes everything."
    ),
)
@click.option(
    "--truncate/--no-truncate", default=False,
    help="TRUNCATE before insert (vs delete-by-year, the default).",
)
def main(years: str, tables: str, truncate: bool) -> None:
    """Load nflverse data into the local 1PRIDE Postgres."""
    year_list = _parse_years(years)
    log.info("Target years: %s", year_list)

    if tables in ("all", "weekly", "weekly+schedules"):
        load_weekly(year_list, truncate)
    if tables in ("all", "schedules", "weekly+schedules"):
        load_schedules(year_list, truncate)
    if tables in ("all", "pbp"):
        load_pbp(year_list, truncate)

    log.info("Done.")


if __name__ == "__main__":
    main()
