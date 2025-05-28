from collections.abc import Sequence

from src.exceptions.recipe import (
    AttachInstructionStepError,
)
from src.repositories.interfaces import (
    RecipeImageRepositoryProtocol,
)
from src.schemas.recipe import (
    MAX_RECIPE_INSTRUCTIONS_COUNT,
    RecipeInstructionsUploadUrls,
)


class RecipeInstructionsService:
    def __init__(
        self,
        recipe_image_repository: RecipeImageRepositoryProtocol,
    ) -> None:
        self.recipe_image_repository = recipe_image_repository

    async def generate_instructions_post_urls(
        self, recipe_id: int, steps: Sequence[int]
    ) -> list[RecipeInstructionsUploadUrls]:
        if any(elem > MAX_RECIPE_INSTRUCTIONS_COUNT for elem in steps):
            msg = f"Can't attach image to one of steps, because it's greater than {MAX_RECIPE_INSTRUCTIONS_COUNT}"
            raise AttachInstructionStepError(msg)

        if len(steps) > MAX_RECIPE_INSTRUCTIONS_COUNT:
            msg = f"Can't attach image to more steps than {MAX_RECIPE_INSTRUCTIONS_COUNT}"
            raise AttachInstructionStepError(msg)

        if len(set(steps)) < len(steps):
            msg = "Can't attach image to duplicate steps"
            raise AttachInstructionStepError(msg)

        presigned_urls_data = await self.recipe_image_repository.generate_instruction_image_upload_urls(
            recipe_id, list(steps)
        )

        return [RecipeInstructionsUploadUrls(**data) for data in presigned_urls_data]
