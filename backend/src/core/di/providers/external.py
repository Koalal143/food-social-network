from collections.abc import AsyncIterator

from dishka import Provider, Scope, provide
from elasticsearch import AsyncElasticsearch
from redis.asyncio import Redis

from src.adapters.storage import S3Storage, S3StorageClientManager
from src.core.config import ElasticSearchConfig, S3Config
from src.core.redis import redis_manager
from src.typings.external.aiobotocore_s3.client import S3Client


class ExternalProvider(Provider):
    scope = Scope.APP

    @provide
    async def get_redis_client(self) -> AsyncIterator[Redis]:
        async with redis_manager as redis:
            yield redis

    @provide
    def get_elasticsearch_client(self, config: ElasticSearchConfig) -> AsyncElasticsearch:
        return AsyncElasticsearch(
            hosts=[f"{config.host}:{config.port}"],
            basic_auth=(config.user, config.password),
            verify_certs=False,
        )

    @provide
    async def get_s3_client(self, config: S3Config) -> AsyncIterator[S3Client]:
        async with S3StorageClientManager(
            config.endpoint_url,
            config.access_key,
            config.secret_key,
        ).get_client() as client:
            yield client

    @provide
    def get_s3_storage(self, client: S3Client, config: S3Config) -> S3Storage:
        return S3Storage(
            client=client,
            endpoint_url=config.endpoint_url,
        )
