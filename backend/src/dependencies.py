from collections.abc import AsyncGenerator, AsyncIterator
from typing import Annotated

from fastapi import Depends
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from src.adapters.storage import S3Storage
from src.core.redis import RedisManager
from src.core.security import get_current_user
from src.db.manager import database_session_function
from src.models.user import User
from src.types.external.aiobotocore_s3.client import S3Client

SessionDependency = Annotated[AsyncSession, Depends(database_session_function)]


def get_s3_storage() -> S3Storage:
    return S3Storage()


async def get_s3_client(
    s3_storage: Annotated[S3Storage, Depends(get_s3_storage)],
) -> AsyncIterator[S3Client]:
    async with s3_storage.get_client() as client:
        yield client


S3ClientDependency = Annotated[S3Client, Depends(get_s3_client)]


async def get_redis() -> AsyncGenerator[Redis, None]:
    async with RedisManager() as redis:
        yield redis


RedisDependency = Annotated[Redis, Depends(get_redis)]

CurrentUserDependency = Annotated[User, Depends(get_current_user)]
