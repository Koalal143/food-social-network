from collections.abc import AsyncIterator
from contextlib import asynccontextmanager
from typing import Any

from aiobotocore.session import get_session

from src.types.external.aiobotocore_s3.client import S3Client


class S3StorageClientManager(S3Client):
    def __init__(self, endpoint_url: str, access_key: str, secret_key: str) -> None:
        super().__init__()
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
        await self.client.put_object(
            Bucket=bucket_name,
            Key=file_name,
            Body=content,
            ContentType=content_type,
        )

    async def delete_file(self, bucket_name: str, file_name: str) -> None:
        await self.client.delete_object(Bucket=bucket_name, Key=file_name)

    async def get_file_url(self, bucket_name: str, file_name: str) -> str:
        return f"{self.endpoint_url}/{bucket_name}/{file_name}"
