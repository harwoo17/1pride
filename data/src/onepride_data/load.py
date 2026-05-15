"""Load nflverse data into the local 1PRIDE Postgres.

Usage:
    uv run python -m onepride_data.load --years 2020-2024
    uv run python -m onepride_data.load --years 2024 --tables weekly
    uv run python -m onepride_data.load --years 2024 --truncate
"""
from __future__ import annotations

import logging
import os
import urllib.error
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
    available, missing = [], []
    for y in years:
        try:
            nfl.import_weekly_data([y])
            available.append(y)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                missing.append(y)
            else:
                raise
    if missing:
        log.warning("weekly_stats not yet published for %s (skipping)", missing)
    if not available:
        log.warning("No weekly_stats data available for any requested year")
        return 0
    df = nfl.import_weekly_data(available)
    df = _select_columns(df, WEEKLY_COLUMNS)

    eng = engine()
    with eng.begin() as conn:
        if truncate:
            log.info("TRUNCATE weekly_stats")
            conn.execute(text("TRUNCATE TABLE weekly_stats"))
        else:
            log.info("DELETE existing weekly_stats rows for years %s", available)
            conn.execute(
                text("DELETE FROM weekly_stats WHERE season = ANY(:years)"),
                {"years": available},
            )

    df.to_sql("weekly_stats", eng, if_exists="append", index=False, method="multi", chunksize=1000)
    log.info("Inserted %d rows into weekly_stats", len(df))
    return len(df)


def derive_weekly_from_pbp(years: list[int]) -> int:
    """Build a weekly_stats-shaped aggregation from the local PBP + rosters.

    Used for in-progress seasons where nflverse's weekly aggregate file
    hasn't been published yet. Subset of columns vs the official load:
    passing/rushing/receiving counts, yards, TDs. Fantasy points and
    advanced EPA columns are NULL.
    """
    log.info("Deriving weekly_stats for %s from local PBP + nflverse rosters", years)
    eng = engine()

    # Pull rosters for position info.
    rosters = nfl.import_seasonal_rosters(years)[
        ["player_id", "player_name", "position", "team", "season"]
    ].rename(columns={"player_name": "player_display_name"})

    def pos_group(pos: str | None) -> str | None:
        if pos is None or pd.isna(pos):
            return None
        return {
            "QB": "QB", "RB": "RB", "FB": "RB",
            "WR": "WR", "TE": "TE",
            "OL": "OL", "C": "OL", "G": "OL", "T": "OL",
        }.get(pos, pos)

    rosters["position_group"] = rosters["position"].map(pos_group)

    # Per-role aggregations from PBP. nflverse PBP columns we lean on:
    #   passer_player_id / _name, rusher_player_id / _name, receiver_player_id / _name
    with eng.connect() as conn:
        pbp = pd.read_sql(
            text("""
                SELECT season, week, season_type, posteam, defteam,
                       play_type, yards_gained,
                       passer_player_name, rusher_player_name, receiver_player_name
                FROM pbp
                WHERE season = ANY(:years)
                  AND play_type IN ('pass', 'run')
            """),
            conn,
            params={"years": years},
        )

    if pbp.empty:
        log.warning("No PBP rows for %s; nothing to derive", years)
        return 0

    # PBP gives us names, not IDs. Use names as the grouping key, then
    # join to rosters by name to recover player_id + position. Imperfect
    # (name collisions exist) but the same compromise nflverse's official
    # build makes during in-season weeks.
    #
    # Completion proxy: pass plays with yards_gained != 0 are treated as
    # completions. Misses true 0-yard completions and treats all
    # incompletions correctly. Re-load with the real weekly file once
    # nflverse publishes it for this season.

    base_keys = ["posteam", "season", "week", "season_type"]
    is_pass = pbp["play_type"] == "pass"
    is_run = pbp["play_type"] == "run"

    passing = (
        pbp[is_pass & pbp["passer_player_name"].notna()]
        .groupby(base_keys + ["passer_player_name"], as_index=False)
        .agg(
            attempts=("play_type", "size"),
            completions=("yards_gained", lambda s: int((s.fillna(0) != 0).sum())),
            passing_yards=("yards_gained", "sum"),
        )
        .rename(columns={"passer_player_name": "player_display_name"})
    )

    rushing = (
        pbp[is_run & pbp["rusher_player_name"].notna()]
        .groupby(base_keys + ["rusher_player_name"], as_index=False)
        .agg(
            carries=("play_type", "size"),
            rushing_yards=("yards_gained", "sum"),
        )
        .rename(columns={"rusher_player_name": "player_display_name"})
    )

    receiving = (
        pbp[is_pass & pbp["receiver_player_name"].notna()]
        .groupby(base_keys + ["receiver_player_name"], as_index=False)
        .agg(
            targets=("play_type", "size"),
            receptions=("yards_gained", lambda s: int((s.fillna(0) != 0).sum())),
            receiving_yards=("yards_gained", "sum"),
        )
        .rename(columns={"receiver_player_name": "player_display_name"})
    )

    merge_keys = base_keys + ["player_display_name"]
    merged = (
        passing.merge(rushing, on=merge_keys, how="outer")
               .merge(receiving, on=merge_keys, how="outer")
    )
    merged = merged.rename(columns={"posteam": "recent_team"})

    # PBP names look like "J.Goff" or "A.St. Brown" (compound last name).
    # Roster names look like "Jared Goff" or "Amon-Ra St. Brown".
    # Build the PBP-shape name from rosters, handling compound last names
    # by joining everything after the first token.
    def roster_to_pbp(full_name: str) -> str | None:
        if not isinstance(full_name, str) or " " not in full_name:
            return full_name
        parts = full_name.split(" ", 1)
        first_initial = parts[0][:1]
        last_part = parts[1]  # may include "St. Brown", "Van Ginkel", etc.
        return f"{first_initial}.{last_part}"

    def normalize(name: str) -> str:
        # Collapse multiple spaces and trim. Don't insert space after periods —
        # leave "J.Goff" and "A.St. Brown" as-is so they round-trip cleanly.
        if not isinstance(name, str):
            return name
        return " ".join(name.split()).strip()

    rosters_short = rosters.copy()
    rosters_short["pbp_name"] = rosters_short["player_display_name"].apply(
        roster_to_pbp
    ).apply(normalize)

    merged["player_display_name"] = merged["player_display_name"].apply(normalize)

    # Match on (pbp_name, season, team) so per-team duplicates don't fight.
    # A handful of cross-team trades still won't match cleanly; fall back
    # to (pbp_name, season) for those.
    rosters_team = rosters_short[
        ["pbp_name", "season", "team", "player_id", "position",
         "position_group", "player_display_name"]
    ].drop_duplicates(["pbp_name", "season", "team"], keep="last")
    rosters_any = rosters_short[
        ["pbp_name", "season", "player_id", "position",
         "position_group", "player_display_name"]
    ].drop_duplicates(["pbp_name", "season"], keep="last")

    # First pass: team-aware join.
    merged = merged.merge(
        rosters_team,
        left_on=["player_display_name", "season", "recent_team"],
        right_on=["pbp_name", "season", "team"],
        how="left",
    )
    # Second pass: fill unmatched rows with team-agnostic match.
    fallback = (
        merged[merged["player_id"].isna()]
        .drop(columns=["pbp_name", "team", "player_id", "position",
                       "position_group", "player_display_name_y"])
        .rename(columns={"player_display_name_x": "player_display_name"})
        .merge(rosters_any,
               left_on=["player_display_name", "season"],
               right_on=["pbp_name", "season"], how="left")
    )
    # Stitch fallback back into merged
    keep_cols = [c for c in merged.columns if c not in (
        "pbp_name", "team", "player_display_name_y", "player_id",
        "position", "position_group"
    )]
    merged = merged.rename(columns={"player_display_name_x": "player_display_name"})
    matched = merged.dropna(subset=["player_id"])
    matched = matched.drop(columns=["pbp_name", "team"], errors="ignore")
    matched["player_display_name"] = matched["player_display_name_y"].fillna(
        matched["player_display_name"]
    )
    matched = matched.drop(columns=["player_display_name_y"], errors="ignore")

    fallback = fallback.rename(columns={"player_display_name": "player_display_name_x"})
    fallback["player_display_name"] = fallback["player_display_name_y"].fillna(
        fallback["player_display_name_x"]
    )
    fallback = fallback.drop(columns=["player_display_name_x", "player_display_name_y",
                                      "pbp_name"], errors="ignore")

    merged = pd.concat([matched, fallback], ignore_index=True)

    # opponent_team
    opps = (
        pbp[["season", "week", "posteam", "defteam"]]
        .drop_duplicates()
        .rename(columns={"posteam": "recent_team"})
    )
    merged = merged.merge(opps, on=["season", "week", "recent_team"], how="left")

    # Rows without a player_id collide on PK insert. Synthesize one.
    merged["player_id"] = merged["player_id"].fillna(
        "derived_" + merged["player_display_name"].astype(str)
        + "_" + merged["season"].astype(str)
    )

    # TD counts aren't easily derivable from our slim PBP columns; leave NULL
    # but typed so Postgres accepts them as integer/real instead of varchar.
    int_nullable = ("passing_tds", "rushing_tds", "receiving_tds", "interceptions")
    real_nullable = ("sacks", "sack_yards", "passing_epa", "rushing_epa",
                     "receiving_epa", "rushing_fumbles", "receiving_air_yards",
                     "fantasy_points", "fantasy_points_ppr")
    for col in int_nullable:
        if col not in merged.columns:
            merged[col] = pd.array([pd.NA] * len(merged), dtype="Int64")
    for col in real_nullable:
        if col not in merged.columns:
            merged[col] = pd.Series([None] * len(merged), dtype="float64")

    df = _select_columns(merged, WEEKLY_COLUMNS)
    # Coerce remaining counting stats to nullable Int64 so partial-NaN
    # columns from outer merges round-trip through pandas → psycopg cleanly.
    for col in ("completions", "attempts", "carries", "receptions", "targets"):
        if col in df.columns:
            df[col] = df[col].astype("Int64")
    for col in ("passing_yards", "rushing_yards", "receiving_yards"):
        if col in df.columns:
            df[col] = df[col].astype("float64")

    # The (player_id, season, week, season_type) PK can collide when a
    # mid-season trade puts a player on two teams in the same week, or
    # when the roster join produces near-duplicate name matches. Collapse
    # those rows by summing the counting stats and keeping the team that
    # had the larger contribution.
    pk = ["player_id", "season", "week", "season_type"]
    if df.duplicated(pk).any():
        log.info("Collapsing %d duplicate (player_id, season, week) rows",
                 int(df.duplicated(pk).sum()))
        sum_cols = [c for c in ("completions", "attempts", "passing_yards",
                                "carries", "rushing_yards",
                                "receptions", "targets", "receiving_yards")
                    if c in df.columns]
        first_cols = [c for c in df.columns if c not in pk + sum_cols]
        agg_spec: dict = {c: "sum" for c in sum_cols}
        agg_spec.update({c: "first" for c in first_cols})
        df = df.groupby(pk, as_index=False).agg(agg_spec)

    with eng.begin() as conn:
        conn.execute(
            text("DELETE FROM weekly_stats WHERE season = ANY(:years)"),
            {"years": years},
        )
    df.to_sql("weekly_stats", eng, if_exists="append", index=False,
              method="multi", chunksize=1000)
    log.info(
        "Derived and inserted %d weekly_stats rows from PBP for %s",
        len(df), years,
    )
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
    type=click.Choice([
        "all", "weekly", "schedules", "pbp", "weekly+schedules",
        "derive-weekly",
    ]),
    help=(
        "Which tables to load. 'weekly+schedules' is the L1/L2 default; "
        "'pbp' is the slow L3+ play-by-play; 'all' includes everything; "
        "'derive-weekly' rebuilds weekly_stats from local PBP (for "
        "in-progress seasons where nflverse hasn't published the aggregate)."
    ),
)
@click.option(
    "--truncate/--no-truncate", default=False,
    help="TRUNCATE before insert (vs delete-by-year, the default).",
)
@click.option(
    "--neon-url",
    default=None,
    envvar="NEON_URL",
    help=(
        "Convenience: take a raw Neon connection string (the one their UI "
        "hands you, beginning with `postgresql://`) and auto-prefix it with "
        "`postgresql+psycopg://` for SQLAlchemy. Sets DATABASE_URL for this "
        "process only. Easier than remembering the bash parameter expansion."
    ),
)
def main(years: str, tables: str, truncate: bool, neon_url: str | None) -> None:
    """Load nflverse data into the local 1PRIDE Postgres (or a remote one)."""
    if neon_url:
        # Neon UI ships a `postgresql://` URL; SQLAlchemy + psycopg need
        # `postgresql+psycopg://`. Auto-fix and stash in the env.
        if neon_url.startswith("postgresql+psycopg://"):
            fixed = neon_url
        elif neon_url.startswith("postgresql://"):
            fixed = "postgresql+psycopg://" + neon_url[len("postgresql://"):]
        else:
            raise click.BadParameter(
                "Expected a `postgresql://...` connection string from Neon.",
                param_hint="--neon-url",
            )
        os.environ["DATABASE_URL"] = fixed
        # Log without leaking the password
        log.info(
            "Using Neon URL (host: %s)",
            fixed.split("@")[1].split("/")[0] if "@" in fixed else "?",
        )

    year_list = _parse_years(years)
    log.info("Target years: %s", year_list)

    if tables == "derive-weekly":
        derive_weekly_from_pbp(year_list)
        log.info("Done.")
        return

    if tables in ("all", "weekly", "weekly+schedules"):
        load_weekly(year_list, truncate)
    if tables in ("all", "schedules", "weekly+schedules"):
        load_schedules(year_list, truncate)
    if tables in ("all", "pbp"):
        load_pbp(year_list, truncate)

    log.info("Done.")


if __name__ == "__main__":
    main()
