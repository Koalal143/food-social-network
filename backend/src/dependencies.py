from collections.abc import AsyncGenerator, AsyncIterator
from typing import Annotated

from fastapi import Depends
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from src.adapters.storage import S3Storage, S3StorageClientManager
from src.core.config import settings
from src.core.redis import redis_manager
from src.core.security import get_current_user
from src.db.manager import database_session_function
from src.models.user import User
from src.types.external.aiobotocore_s3.client import S3Client

SessionDependency = Annotated[AsyncSession, Depends(database_session_function)]


async def get_s3_client() -> AsyncIterator[S3Client]:
    async with S3StorageClientManager(
        settings.s3_storage.endpoint_url,
        settings.s3_storage.access_key,
        settings.s3_storage.secret_key,
        ).get_client() as client:
        yield client


async def get_s3_storage(client: Annotated[S3Client, Depends(get_s3_client)]) -> AsyncIterator[S3Storage]:
    async with S3Storage(
        client=client,
        endpoint_url=settings.s3_storage.endpoint_url,
    ) as storage:
        yield storage


S3StorageDependency = Annotated[S3Client, Depends(get_s3_storage)]

async def get_redis() -> AsyncGenerator[Redis, None]:
    async with redis_manager as redis:
        yield redis


RedisDependency = Annotated[Redis, Depends(get_redis)]

CurrentUserDependency = Annotated[User, Depends(get_current_user)]
