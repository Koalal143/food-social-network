from collections.abc import Sequence

from src.adapters.storage import S3Storage
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.recipe import AttachInstructionStepError
from src.schemas.recipe import RecipeInstructionsUploadUrls


class RecipeInstructionsService:
    def __init__(self, uow: SQLAlchemyUnitOfWork, s3_storage: S3Storage) -> None:
        self.uow = uow
        self.s3_storage = s3_storage
        self._bucket_name = "images"

    async def generate_instructions_post_urls(
        self, recipe_id: int, steps: Sequence[int]
    ) -> list[RecipeInstructionsUploadUrls]:
        instructions_total_count = await self.uow.recipe_instructions.get_instructions_count_by_recipe_id(
            recipe_id=recipe_id,
        )

        if any(elem > instructions_total_count for elem in steps):
            msg = "Can't attach image to one of steps, because it's greater than the last instruction step"
            raise AttachInstructionStepError(msg)

        if len(steps) > instructions_total_count:
            msg = "Can't attach image to more steps than total instructions count"
            raise AttachInstructionStepError(msg)

        if len(set(steps)) < len(steps):
            msg = "Can't attach image to duplicate steps"
            raise AttachInstructionStepError(msg)

        urls = [f"recipes/{recipe_id}/instructions/{step}/step.png" for step in steps]
        presigned_urls = []
        conditions = [
            {"acl": "private"},
            ["starts-with", "$Content-Type", "image/"],
            ["content-length-range", 1, 5 * 1024 * 1024],
        ]
        for index, url in enumerate(urls):
            presigned_url = await self.s3_storage.generate_presigned_post(
                bucket_name=self._bucket_name,
                key=url,
                conditions=conditions,
                expires_in=300,
            )
            presigned_urls.append(RecipeInstructionsUploadUrls(step_number=steps[index], **presigned_url))
        return presigned_urls
