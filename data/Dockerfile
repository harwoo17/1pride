# 1PRIDE FastAPI service. Deploys to Fly.io (and works on any container
# host). Explicit and small — paketo buildpacks were finicky with uv,
# and an explicit Dockerfile gives us a deterministic deploy.

# ─── Builder ───────────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm AS builder

# uv = fast Python package manager; --frozen ensures we install exactly
# what's in uv.lock (no surprise drift in prod).
COPY --from=ghcr.io/astral-sh/uv:0.5.0 /uv /uvx /bin/

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/opt/venv

WORKDIR /app

# Install deps first (cache-friendly): only the lockfiles, not source.
COPY pyproject.toml uv.lock README.md ./
RUN uv sync --frozen --no-install-project --extra api

# Now bring in source and install the project package itself
COPY src ./src
RUN uv sync --frozen --extra api

# ─── Runtime ───────────────────────────────────────────────────────────────
FROM python:3.11-slim-bookworm

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    PATH="/opt/venv/bin:$PATH" \
    PYTHONPATH=/app/src

# psycopg needs libpq + a couple of runtime libs
RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY --from=builder /opt/venv /opt/venv
COPY src ./src

# Fly sets PORT (default 8080 per fly.toml). Bind 0.0.0.0 so the
# external proxy can reach us.
EXPOSE 8080
CMD ["sh", "-c", "uvicorn onepride_data.api:app --host 0.0.0.0 --port ${PORT:-8080}"]
