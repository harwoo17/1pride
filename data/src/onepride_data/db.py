"""Database connection helpers."""
from __future__ import annotations

import os
from pathlib import Path

from dotenv import load_dotenv
from sqlalchemy import Engine, create_engine

ENV_PATH = Path(__file__).resolve().parents[2] / ".env"
if ENV_PATH.exists():
    load_dotenv(ENV_PATH)


def database_url() -> str:
    """Postgres connection string. Override with DATABASE_URL env var."""
    return os.environ.get(
        "DATABASE_URL",
        "postgresql+psycopg://onepride:lions@localhost:5432/onepride",
    )


def engine() -> Engine:
    return create_engine(database_url(), future=True)
