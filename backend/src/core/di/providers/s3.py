from __future__ import annotations

from typing import TYPE_CHECKING

from dishka import Provider, Scope, provide

from src.adapters.storage import S3Storage, S3StorageClientManager
from src.core.config import S3Config  # noqa: TC001

if TYPE_CHECKING:
    from collections.abc import AsyncIterator

    from types_aiobotocore_s3 import S3Client


class S3Provider(Provider):
    scope = Scope.REQUEST

    @provide
    async def get_s3_client(self, config: S3Config) -> AsyncIterator[S3Client]:
        async with S3StorageClientManager(
            f"{config.host}:{config.port}",
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
