from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from aiobotocore.session import get_session

from src.core.config import settings
from src.types.external.aiobotocore_s3.client import S3Client


class S3StorageClientManager:
    def __init__(self, endpoint_url: str, access_key: str, secret_key: str) -> None:
        self.session = get_session()
        self.endpoint_url = endpoint_url
        self.access_key = access_key
        self.secret_key = secret_key

    @asynccontextmanager
    async def get_client(self) -> AsyncIterator[S3Client]:
        async with self.session.create_client(
            "s3",
            endpoint_url=self.endpoint_url,
            aws_access_key_id=self.access_key,
            aws_secret_access_key=self.secret_key,
            use_ssl=False,
        ) as client:
            yield client


class S3Storage:
    def __init__(self, client: S3Client, endpoint_url: str) -> None:
        self.client = client
        self.endpoint_url = endpoint_url

    async def upload_file(
        self,
        bucket_name: str,
        file_name: str,
        content_type: str,
        content: Any,
    ) -> None:
        await self.client.put_object(Bucket=bucket_name, Key=file_name, Body=content, ContentType=content_type)

    async def delete_file(self, bucket_name: str, file_name: str) -> None:
        await self.client.delete_object(Bucket=bucket_name, Key=file_name)

    def _get_valid_url(self, url: str) -> str:
        return url.replace(self.endpoint_url, settings.server.url + "/static")

    async def get_file_url(self, bucket_name: str, file_name: str, expires_in: int = 3600) -> str:
        unprepared_url = await self.client.generate_presigned_url(
            "get_object",
            Params={"Bucket": bucket_name, "Key": file_name},
            ExpiresIn=expires_in,
        )
        return self._get_valid_url(unprepared_url)

    async def generate_presigned_post(
        self,
        bucket_name: str,
        key: str,
        fields: dict[str, Any] | None = None,
        conditions: list[Any] | None = None,
        expires_in: int = 3600,
    ) -> dict:
        presigned_post = await self.client.generate_presigned_post(
            Bucket=bucket_name,
            Key=key,
            Fields=fields,
            Conditions=conditions,
            ExpiresIn=expires_in,
        )
        presigned_post["url"] = self._get_valid_url(presigned_post["url"])
        return presigned_post
