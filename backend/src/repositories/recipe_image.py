from typing import Any

from src.adapters.storage import S3Storage
from src.repositories.interfaces.recipe_image import RecipeImageRepositoryProtocol


class RecipeImageRepository(RecipeImageRepositoryProtocol):
    def __init__(self, s3_storage: S3Storage) -> None:
        self.s3_storage = s3_storage
        self._bucket_name = "images"

    async def get_image_url(self, image_path: str, expires_in: int = 3600) -> str:
        return await self.s3_storage.get_file_url(self._bucket_name, image_path, expires_in=expires_in)

    async def generate_recipe_image_upload_url(self, recipe_id: int) -> dict[str, Any]:
        file_name = f"recipes/{recipe_id}/main.png"
        return await self.s3_storage.generate_presigned_post(
            bucket_name=self._bucket_name,
            key=file_name,
            conditions=[
                {"acl": "private"},
                ["starts-with", "$Content-Type", "image/"],
                ["content-length-range", 1, 5 * 1024 * 1024],
            ],
            expires_in=300,
        )

    async def get_instructions_image_url(self, image_path: str, expires_in: int = 3600) -> str:
        return await self.s3_storage.get_file_url(self._bucket_name, image_path, expires_in=expires_in)

    async def generate_instruction_image_upload_urls(self, recipe_id: int, steps: list[int]) -> list[dict[str, Any]]:
        urls = [f"recipes/{recipe_id}/instructions/{step}/step.png" for step in steps]
        presigned_urls = []
        conditions = [
            {"acl": "private"},
            ["starts-with", "$Content-Type", "image/"],
            ["starts-with", "$key", f"recipes/{recipe_id}/instructions/"],
            ["content-length-range", 1, 5 * 1024 * 1024],
        ]

        for index, url in enumerate(urls):
            presigned_url = await self.s3_storage.generate_presigned_post(
                bucket_name=self._bucket_name,
                key=url,
                conditions=conditions,
                expires_in=300,
            )
            presigned_url["step_number"] = steps[index]
            presigned_urls.append(presigned_url)

        return presigned_urls
