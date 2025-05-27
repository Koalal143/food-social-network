from typing import Any, Protocol


class RecipeImageRepositoryProtocol(Protocol):
    async def get_image_url(self, image_path: str, expires_in: int = 3600) -> str: ...

    async def generate_recipe_image_upload_url(self, recipe_id: int) -> dict[str, Any]: ...

    async def generate_instruction_image_upload_urls(
        self, recipe_id: int, steps: list[int]
    ) -> list[dict[str, Any]]: ...
