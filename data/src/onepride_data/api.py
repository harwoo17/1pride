"""FastAPI service for the 1PRIDE L5 app.

Run:
    uv run --python 3.11 --extra api uvicorn onepride_data.api:app --reload

Endpoints expose pre-aggregated Lions analytics over the local Postgres.
Designed to be the backend for app.1pride.dev — keep responses small,
cacheable, and JSON-shaped for the Next.js frontend.
"""
from __future__ import annotations

from contextlib import contextmanager
from typing import Iterator

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.engine import Connection

from .db import engine

app = FastAPI(
    title="1PRIDE API",
    description="Lions analytics over nflverse data. Backs app.1pride.dev.",
    version="0.1.0",
)

# CORS for local Next.js dev (3000) and production app domain.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "https://app.1pride.dev",
    ],
    allow_methods=["GET"],
    allow_headers=["*"],
)


@contextmanager
def conn() -> Iterator[Connection]:
    with engine().connect() as c:
        yield c


@app.get("/health")
def health() -> dict:
    """Liveness check. Verifies the DB is reachable."""
    try:
        with conn() as c:
            c.execute(text("SELECT 1"))
        return {"status": "ok", "db": "connected"}
    except Exception as e:
        raise HTTPException(503, detail=f"DB unreachable: {e}") from e


@app.get("/api/lions/seasons")
def seasons() -> dict:
    """Available Lions seasons in the database."""
    with conn() as c:
        rows = c.execute(text("""
            SELECT season, COUNT(DISTINCT week) AS weeks_played
            FROM weekly_stats
            WHERE recent_team = 'DET'
            GROUP BY season
            ORDER BY season
        """)).mappings().all()
    return {"seasons": [dict(r) for r in rows]}


@app.get("/api/lions/weekly-scoring")
def weekly_scoring(season: int = Query(2024, ge=2000, le=2030)) -> dict:
    """Lions points scored and allowed by week for a given season."""
    with conn() as c:
        rows = c.execute(
            text("""
                SELECT
                    week,
                    CASE WHEN home_team = 'DET' THEN away_team ELSE home_team END AS opp,
                    CASE WHEN home_team = 'DET' THEN home_score ELSE away_score END AS scored,
                    CASE WHEN home_team = 'DET' THEN away_score ELSE home_score END AS allowed,
                    gameday
                FROM schedules
                WHERE season = :season
                  AND game_type = 'REG'
                  AND (home_team = 'DET' OR away_team = 'DET')
                ORDER BY week
            """),
            {"season": season},
        ).mappings().all()
    return {"season": season, "games": [dict(r) for r in rows]}


@app.get("/api/lions/top-receivers")
def top_receivers(
    season: int = Query(2024, ge=2000, le=2030),
    limit: int = Query(8, ge=1, le=50),
) -> dict:
    """Lions receiving leaders for a given season."""
    with conn() as c:
        rows = c.execute(
            text("""
                SELECT
                    player_display_name AS name,
                    position_group AS position,
                    COUNT(*)              AS games,
                    SUM(targets)          AS targets,
                    SUM(receptions)       AS catches,
                    SUM(receiving_yards)  AS yards,
                    SUM(receiving_tds)    AS tds
                FROM weekly_stats
                WHERE recent_team = 'DET'
                  AND season = :season
                  AND season_type = 'REG'
                  AND position_group IN ('WR', 'TE', 'RB')
                  AND targets > 0
                GROUP BY player_display_name, position_group
                ORDER BY yards DESC
                LIMIT :limit
            """),
            {"season": season, "limit": limit},
        ).mappings().all()
    return {"season": season, "receivers": [dict(r) for r in rows]}


@app.get("/api/lions/receiver-weeks")
def receiver_weeks(
    season: int = Query(2024, ge=2000, le=2030),
    limit: int = Query(8, ge=1, le=20),
) -> dict:
    """Per-week receiving yards for the top N Lions receivers of a season.

    Returns one row per (player, week) so the frontend can render
    sparklines next to the season totals.
    """
    with conn() as c:
        rows = c.execute(
            text("""
                WITH top_recv AS (
                    SELECT player_display_name
                    FROM weekly_stats
                    WHERE recent_team = 'DET'
                      AND season = :season
                      AND season_type = 'REG'
                      AND position_group IN ('WR', 'TE', 'RB')
                      AND targets > 0
                    GROUP BY player_display_name
                    ORDER BY SUM(receiving_yards) DESC
                    LIMIT :limit
                )
                SELECT ws.player_display_name AS name,
                       ws.week,
                       COALESCE(ws.receiving_yards, 0) AS yards
                FROM weekly_stats ws
                JOIN top_recv USING (player_display_name)
                WHERE ws.recent_team = 'DET'
                  AND ws.season = :season
                  AND ws.season_type = 'REG'
                ORDER BY ws.player_display_name, ws.week
            """),
            {"season": season, "limit": limit},
        ).mappings().all()
    return {"season": season, "rows": [dict(r) for r in rows]}


@app.get("/api/standings/nfc-north")
def nfc_north(season: int = Query(2024, ge=2000, le=2030)) -> dict:
    """NFC North regular-season standings for a given season."""
    teams = ["DET", "GB", "MIN", "CHI"]
    with conn() as c:
        rows = c.execute(
            text("""
                WITH games AS (
                    SELECT season, week, home_team, away_team, home_score, away_score
                    FROM schedules
                    WHERE season = :season
                      AND game_type = 'REG'
                      AND (home_team = ANY(:teams) OR away_team = ANY(:teams))
                ),
                per_team AS (
                    SELECT team, scored, allowed,
                        CASE WHEN scored > allowed THEN 1 ELSE 0 END AS w,
                        CASE WHEN scored < allowed THEN 1 ELSE 0 END AS l,
                        CASE WHEN scored = allowed THEN 1 ELSE 0 END AS t
                    FROM (
                        SELECT home_team AS team, home_score AS scored, away_score AS allowed FROM games
                        UNION ALL
                        SELECT away_team AS team, away_score AS scored, home_score AS allowed FROM games
                    ) sides
                    WHERE team = ANY(:teams)
                )
                SELECT team,
                       SUM(w) AS wins,
                       SUM(l) AS losses,
                       SUM(t) AS ties,
                       SUM(scored) AS points_for,
                       SUM(allowed) AS points_against,
                       SUM(scored) - SUM(allowed) AS diff
                FROM per_team
                GROUP BY team
                ORDER BY wins DESC, diff DESC
            """),
            {"season": season, "teams": teams},
        ).mappings().all()
    return {"season": season, "standings": [dict(r) for r in rows]}


@app.get("/api/lions/4th-down-decisions")
def fourth_down_decisions(
    season_min: int = Query(2022, ge=2000, le=2030),
    season_max: int = Query(2024, ge=2000, le=2030),
) -> dict:
    """Lions 4th-down decision breakdown."""
    with conn() as c:
        rows = c.execute(
            text("""
                SELECT
                    play_type,
                    COUNT(*)        AS plays,
                    ROUND(AVG(ydstogo)::numeric, 2) AS avg_ydstogo,
                    ROUND(AVG(yardline_100)::numeric, 1) AS avg_yardline,
                    ROUND(AVG(epa)::numeric, 3) AS avg_epa
                FROM pbp
                WHERE posteam = 'DET'
                  AND down = 4
                  AND season BETWEEN :smin AND :smax
                  AND play_type IN ('pass', 'run', 'field_goal', 'punt')
                GROUP BY play_type
                ORDER BY plays DESC
            """),
            {"smin": season_min, "smax": season_max},
        ).mappings().all()
    return {
        "season_range": [season_min, season_max],
        "decisions": [dict(r) for r in rows],
    }
