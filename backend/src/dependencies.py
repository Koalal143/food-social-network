from collections.abc import AsyncGenerator
from typing import Annotated

from fastapi import Depends
from redis import Redis
from sqlalchemy.ext.asyncio import AsyncSession

from src.adapters.storage import S3Storage, S3StorageClientManager
from src.core.config import settings
from src.core.redis import redis_manager
from src.db.manager import database_session_function
from src.db.uow import SQLAlchemyUnitOfWork
from src.types.external.aiobotocore_s3.client import S3Client

SessionDependency = Annotated[AsyncSession, Depends(database_session_function)]


async def get_s3_client() -> AsyncGenerator[S3Client, None]:
    async with S3StorageClientManager(
        settings.s3_storage.endpoint_url,
        settings.s3_storage.access_key,
        settings.s3_storage.secret_key,
    ).get_client() as client:
        yield client


async def get_s3_storage(client: Annotated[S3Client, Depends(get_s3_client)]) -> AsyncGenerator[S3Storage, None]:
    return S3Storage(
        client=client,
        endpoint_url=settings.s3_storage.endpoint_url,
    )


S3StorageDependency = Annotated[S3Storage, Depends(get_s3_storage)]


async def get_redis() -> AsyncGenerator[Redis, None]:
    async with redis_manager as redis:
        yield redis


RedisDependency = Annotated[Redis, Depends(get_redis)]


async def get_uow(session: SessionDependency) -> SQLAlchemyUnitOfWork:
    return SQLAlchemyUnitOfWork(session=session)


UnitOfWorkDependency = Annotated[SQLAlchemyUnitOfWork, Depends(get_uow)]
