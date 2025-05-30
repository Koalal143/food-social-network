from dishka import make_async_container

from src.core.di.providers import (
    DatabaseProvider,
    DatabaseSessionProvider,
    EmbeddingsProvider,
    QdrantProvider,
    RepositoryProvider,
    ServiceProvider,
)

container = make_async_container(
    DatabaseProvider(),
    DatabaseSessionProvider(),
    QdrantProvider(),
    EmbeddingsProvider(),
    RepositoryProvider(),
    ServiceProvider(),
)
