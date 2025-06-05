from dishka import make_async_container
from dishka.integrations.fastapi import FastapiProvider

from src.core.di.providers import (
    ConfigProvider,
    DatabaseProvider,
    ElasticsearchProvider,
    FastStreamProvider,
    RecommendationsAdapterProvider,
    RedisProvider,
    RepositoryProvider,
    S3Provider,
    ServiceProvider,
)

container = make_async_container(
    ConfigProvider(),
    DatabaseProvider(),
    ElasticsearchProvider(),
    FastStreamProvider(),
    RecommendationsAdapterProvider(),
    RedisProvider(),
    RepositoryProvider(),
    ServiceProvider(),
    S3Provider(),
    FastapiProvider(),
)
