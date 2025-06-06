from typing import TYPE_CHECKING

from src.enums.recipe_get_source import RecipeGetSourceEnum
from src.exceptions.recipe import RecipeNotFoundError
from src.exceptions.recipe_impression import RecipeImpressionAlreadyExistsError
from src.repositories.interfaces import (
    RecipeImageRepositoryProtocol,
    RecipeImpressionRepositoryProtocol,
    RecipeRepositoryProtocol,
    RecsysRepositoryProtocol,
)
from src.schemas.recipe import RecipeReadShort
from src.schemas.recipe_impression import RecipeImpressionRead
from src.schemas.recsys_messages import AddImpressionMessage

if TYPE_CHECKING:
    from src.models.recipe_impression import RecipeImpression


class RecipeImpressionService:
    def __init__(
        self,
        recipe_impression_repository: RecipeImpressionRepositoryProtocol,
        recipe_repository: RecipeRepositoryProtocol,
        recipe_image_repository: RecipeImageRepositoryProtocol,
        recsys_repository: RecsysRepositoryProtocol,
    ) -> None:
        self.recipe_impression_repository = recipe_impression_repository
        self.recipe_repository = recipe_repository
        self.recipe_image_repository = recipe_image_repository
        self.recsys_repository = recsys_repository

    async def _to_recipe_impression_schema(self, impression: "RecipeImpression") -> RecipeImpressionRead:
        recipe = RecipeReadShort.model_validate(impression.recipe)
        if impression.recipe.image_path:
            recipe.image_url = await self.recipe_image_repository.get_image_url(impression.recipe.image_path)
        schema = RecipeImpressionRead.model_validate(impression)
        schema.recipe = recipe
        return schema

    async def get_user_impressions(
        self, user_id: int, skip: int = 0, limit: int = 10
    ) -> tuple[int, list[RecipeImpressionRead]]:
        count, impressions = await self.recipe_impression_repository.get_all_by_user(
            user_id=user_id, skip=skip, limit=limit
        )

        impression_schemas = [await self._to_recipe_impression_schema(impression) for impression in impressions]

        return count, impression_schemas

    async def record_impression(self, user_id: int, recipe_id: int, source: RecipeGetSourceEnum | None = None) -> None:
        recipe = await self.recipe_repository.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)
        if await self.recipe_impression_repository.exists_recent(
            user_id=user_id, source=source, recipe_id=recipe_id, hours=24
        ):
            msg = f"Recipe with id {recipe_id} was already shown to user within last 24 hours"
            raise RecipeImpressionAlreadyExistsError(msg)

        await self.recipe_impression_repository.create(user_id=user_id, recipe_id=recipe_id, source=source)

        recsys_source = source.value if source else "feed"
        await self.recsys_repository.add_impression(user_id, recipe_id, recsys_source)

    async def merge_impressions(self, anonymous_user_id: int, user_id: int) -> None:
        impressions = await self.recipe_impression_repository.merge_impressions(
            anonymous_user_id=anonymous_user_id, user_id=user_id
        )
        impressions_list = [AddImpressionMessage.model_validate(impression) for impression in impressions]
        if impressions_list:
            await self.recsys_repository.add_impressions_bulk(impressions_list)

    async def record_impression_for_anonymous(
        self, recipe_id: int, anonymous_user_id: int, source: RecipeGetSourceEnum | None = None
    ) -> None:
        recipe = await self.recipe_repository.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if await self.recipe_impression_repository.exists_recent_for_anonymous(
            anonymous_user_id=anonymous_user_id, recipe_id=recipe_id, source=source, hours=24
        ):
            msg = f"Recipe with id {recipe_id} was already shown to anonymous user within last 24 hours"
            raise RecipeImpressionAlreadyExistsError(msg)

        await self.recipe_impression_repository.create_for_anonymous(
            anonymous_user_id=anonymous_user_id, recipe_id=recipe_id, source=source
        )

    async def get_user_viewed_recipes_count(self, user_id: int) -> int:
        return await self.recipe_impression_repository.get_user_viewed_recipes_count(user_id=user_id)
