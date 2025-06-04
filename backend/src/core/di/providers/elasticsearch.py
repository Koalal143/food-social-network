from collections.abc import AsyncIterator

from dishka import Provider, Scope, provide
from elasticsearch import AsyncElasticsearch

from src.core.config import ElasticSearchConfig


class ElasticsearchProvider(Provider):
    scope = Scope.APP

    @provide
    async def get_elasticsearch_client(self, config: ElasticSearchConfig) -> AsyncIterator[AsyncElasticsearch]:
        async with AsyncElasticsearch(
            hosts=[f"{config.host}:{config.port}"],
            basic_auth=(config.user, config.password),
            verify_certs=False,
            retry_on_timeout=True,
            max_retries=10,
        ) as client:
            yield client
