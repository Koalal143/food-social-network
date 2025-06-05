FROM ghcr.io/astral-sh/uv:python3.12-bookworm-slim AS builder

ENV PYTHONPATH="/app" \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PYTHON_DOWNLOADS=0 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY pyproject.toml uv.lock* ./

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=uv.lock,target=uv.lock \
    --mount=type=bind,source=pyproject.toml,target=pyproject.toml \
    if [ "$MODE" = "dev" ]; then \
        uv sync --frozen --no-install-project --group dev; \
    elif [ "$MODE" = "test" ]; then \
        uv sync --frozen --no-install-project --group test; \
    else \
        uv sync --frozen --no-install-project; \
    fi

ADD . /app

FROM python:3.12-slim-bookworm

WORKDIR /app
COPY --from=builder --chown=app:app /app /app

RUN apt-get update && apt-get install -y curl

ENV PATH="/app/.venv/bin:$PATH"

EXPOSE 8000

CMD alembic upgrade head && \
    python -m src.create_qdrant_collection && \
    faststream run src.worker:app --host 0.0.0.0 --port 8001
