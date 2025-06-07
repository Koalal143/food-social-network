import logging

import pytest
from elasticsearch import AsyncElasticsearch

logger = logging.getLogger(__name__)


pytest_plugins = [
    "tests.fixtures.config",
    "tests.fixtures.database",
    "tests.fixtures.dishka_config",
    "tests.fixtures.auth",
    "tests.fixtures.recipes",
    "tests.fixtures.app",
    "tests.fixtures.http_client",
]


@pytest.fixture(autouse=True)
async def cleanup_elasticsearch_indices(test_dishka_container):
    yield

    try:
        async with test_dishka_container() as request_container:
            es_client: AsyncElasticsearch = await request_container.get(AsyncElasticsearch)

            indices_to_clean = ["recipes", "recipe_*"]

            for index_pattern in indices_to_clean:
                try:
                    if await es_client.indices.exists(index=index_pattern):
                        await es_client.delete_by_query(
                            index=index_pattern, body={"query": {"match_all": {}}}, refresh=True, conflicts="proceed"
                        )
                except Exception:
                    logger.exception("Failed to clean Elasticsearch index %s", index_pattern)
    except Exception:
        logger.exception("Failed to get Elasticsearch client for cleanup")
