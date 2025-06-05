from collections.abc import AsyncGenerator

import pytest_asyncio
from httpx import AsyncClient


@pytest_asyncio.fixture(loop_scope="session")
async def http_client() -> AsyncGenerator[AsyncClient, None]:
    async with AsyncClient() as ac:
        yield ac
