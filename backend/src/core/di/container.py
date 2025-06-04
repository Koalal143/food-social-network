from dishka import make_async_container
from dishka.integrations.fastapi import FastapiProvider

from src.core.di.providers import (
    ConfigProvider,
    DatabaseProvider,
    ExternalProvider,
    FastStreamProvider,
    RepositoryProvider,
    S3Provider,
    ServiceProvider,
)

container = make_async_container(
    ConfigProvider(),
    DatabaseProvider(),
    ExternalProvider(),
    FastStreamProvider(),
    RepositoryProvider(),
    ServiceProvider(),
    S3Provider(),
    FastapiProvider(),
)
