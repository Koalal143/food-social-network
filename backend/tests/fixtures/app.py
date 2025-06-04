import logging
from collections.abc import AsyncGenerator
from typing import Any

import pytest_asyncio
from asgi_lifespan import LifespanManager
from dishka.integrations.fastapi import setup_dishka
from httpx import ASGITransport, AsyncClient

from src.core.lifespan import lifespan
from src.main import create_app

logger = logging.getLogger(__name__)


@pytest_asyncio.fixture(loop_scope="session")
async def test_container(test_dishka_container):
    return test_dishka_container


@pytest_asyncio.fixture(loop_scope="session")
async def test_app(test_container, test_settings) -> AsyncGenerator[Any, None]:
    app = create_app(app_settings=test_settings, app_lifespan=lifespan)

    setup_dishka(container=test_container, app=app)

    async with LifespanManager(app=app) as ac:
        yield ac.app


@pytest_asyncio.fixture(loop_scope="session")
async def api_client(test_app: Any) -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient(transport=ASGITransport(app=test_app), base_url="http://test-backend") as ac:
        yield ac
