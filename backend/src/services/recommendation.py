import logging

from src.repositories.interfaces import (
    RecipeImageRepositoryProtocol,
    RecipeRepositoryProtocol,
    RecsysRepositoryProtocol,
)
from src.schemas.recipe import RecipeReadShort

logger = logging.getLogger(__name__)


class RecommendationService:
    def __init__(
        self,
        recsys_repository: RecsysRepositoryProtocol,
        recipe_repository: RecipeRepositoryProtocol,
        recipe_image_repository: RecipeImageRepositoryProtocol,
    ) -> None:
        self.recsys_repository = recsys_repository
        self.recipe_repository = recipe_repository
        self.recipe_image_repository = recipe_image_repository

    async def get_user_recommendations(
        self,
        user_id: int,
        limit: int = 10,
    ) -> list[RecipeReadShort]:
        try:
            recommendations = await self.recsys_repository.get_recommendations(
                user_id=user_id,
                limit=limit,
            )
            if not recommendations:
                return []

            recipe_ids = [rec.recipe_id for rec in recommendations]

            recipes = []
            for recipe_id in recipe_ids:
                try:
                    recipe = await self.recipe_repository.get_by_id(recipe_id)
                    if recipe:
                        recipe_schema = RecipeReadShort.model_validate(recipe)

                        if recipe.image_path:
                            recipe_schema.image_url = await self.recipe_image_repository.get_image_url(
                                recipe.image_path
                            )

                        recipes.append(recipe_schema)

                except Exception:
                    logger.exception("Failed to load recipe %s for user %s", recipe_id, user_id)
                    continue

            return recipes[:limit]

        except Exception:
            logger.exception("Failed to get recommendations for user %s", user_id)
            return []
