-- 1PRIDE schema. Loaded into the `onepride` database on first container boot
-- via docker-entrypoint-initdb.d. Idempotent so it's safe to re-run from psql.

CREATE TABLE IF NOT EXISTS weekly_stats (
    player_id              TEXT,
    player_display_name    TEXT,
    position               TEXT,
    position_group         TEXT,
    recent_team            TEXT,
    season                 INT,
    week                   INT,
    season_type            TEXT,
    opponent_team          TEXT,

    -- Passing
    completions            INT,
    attempts               INT,
    passing_yards          REAL,
    passing_tds            INT,
    interceptions          INT,
    sacks                  REAL,
    sack_yards             REAL,
    passing_epa            REAL,

    -- Rushing
    carries                INT,
    rushing_yards          REAL,
    rushing_tds            INT,
    rushing_fumbles        REAL,
    rushing_epa            REAL,

    -- Receiving
    receptions             INT,
    targets                INT,
    receiving_yards        REAL,
    receiving_tds          INT,
    receiving_air_yards    REAL,
    receiving_epa          REAL,

    -- Fantasy
    fantasy_points         REAL,
    fantasy_points_ppr     REAL,

    PRIMARY KEY (player_id, season, week, season_type)
);

CREATE INDEX IF NOT EXISTS idx_weekly_team_season_week
    ON weekly_stats (recent_team, season, week);

CREATE INDEX IF NOT EXISTS idx_weekly_player_season
    ON weekly_stats (player_display_name, season);

CREATE TABLE IF NOT EXISTS schedules (
    game_id         TEXT PRIMARY KEY,
    season          INT,
    game_type       TEXT,
    week            INT,
    gameday         DATE,
    weekday         TEXT,
    gametime        TEXT,
    away_team       TEXT,
    away_score      INT,
    home_team       TEXT,
    home_score      INT,
    result          INT,
    total           INT,
    overtime        INT,
    stadium         TEXT,
    roof            TEXT,
    surface         TEXT,
    temp            INT,
    wind            INT
);

CREATE INDEX IF NOT EXISTS idx_schedules_season_week
    ON schedules (season, week);

CREATE INDEX IF NOT EXISTS idx_schedules_teams
    ON schedules (home_team, away_team, season);
