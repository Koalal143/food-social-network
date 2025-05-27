from dishka import make_async_container
from dishka.integrations.fastapi import FastapiProvider

from src.core.di.providers import (
    ConfigProvider,
    DatabaseProvider,
    ExternalProvider,
    RepositoryProvider,
    ServiceProvider,
)

container = make_async_container(
    ConfigProvider(),
    DatabaseProvider(),
    ExternalProvider(),
    RepositoryProvider(),
    ServiceProvider(),
    FastapiProvider(),
)
