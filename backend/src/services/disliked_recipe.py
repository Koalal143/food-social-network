from src.enums.feedback_type import FeedbackTypeEnum
from src.exceptions.disliked_recipe import RecipeAlreadyDislikedError, RecipeNotDislikedError
from src.exceptions.recipe import RecipeNotFoundError
from src.models.recipe import Recipe
from src.models.user import User
from src.repositories.interfaces import (
    DislikedRecipeRepositoryProtocol,
    FavoriteRecipeRepositoryProtocol,
    RecipeImageRepositoryProtocol,
    RecipeRepositoryProtocol,
    RecsysRepositoryProtocol,
)
from src.schemas.disliked_recipe import DislikedRecipeCreate
from src.schemas.recipe import RecipeReadShort


class DislikedRecipeService:
    def __init__(
        self,
        disliked_recipe_repository: DislikedRecipeRepositoryProtocol,
        recipe_repository: RecipeRepositoryProtocol,
        favorite_recipe_repository: FavoriteRecipeRepositoryProtocol,
        recipe_image_repository: RecipeImageRepositoryProtocol,
        recsys_repository: RecsysRepositoryProtocol,
    ) -> None:
        self.disliked_recipe_repository = disliked_recipe_repository
        self.recipe_repository = recipe_repository
        self.favorite_recipe_repository = favorite_recipe_repository
        self.recipe_image_repository = recipe_image_repository
        self.recsys_repository = recsys_repository

    async def _to_recipe_with_dislike_schema(self, disliked_recipe: Recipe) -> RecipeReadShort:
        recipe = RecipeReadShort.model_validate(disliked_recipe)
        if disliked_recipe.image_path:
            recipe.image_url = await self.recipe_image_repository.get_image_url(disliked_recipe.image_path)

        return recipe

    async def get_user_dislikes(
        self, user_id: int, skip: int = 0, limit: int = 10
    ) -> tuple[int, list[RecipeReadShort]]:
        count, dislikes = await self.disliked_recipe_repository.get_all_by_user(user_id=user_id, skip=skip, limit=limit)

        disliked_recipes = [await self._to_recipe_with_dislike_schema(dislike.recipe) for dislike in dislikes]

        return count, disliked_recipes

    async def add_to_dislikes(self, user: User, dislike_data: DislikedRecipeCreate) -> RecipeReadShort:
        recipe_id = dislike_data.recipe_id

        recipe = await self.recipe_repository.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if await self.disliked_recipe_repository.exists(user_id=user.id, recipe_id=recipe_id):
            msg = f"Recipe with id {recipe_id} is already disliked"
            raise RecipeAlreadyDislikedError(msg)

        if await self.favorite_recipe_repository.exists(user_id=user.id, recipe_id=recipe_id):
            await self.favorite_recipe_repository.delete(user_id=user.id, recipe_id=recipe_id)

        await self.disliked_recipe_repository.create(user_id=user.id, recipe_id=recipe_id)
        await self.recsys_repository.add_feedback(user.id, recipe_id, FeedbackTypeEnum.DISLIKE)
        return await self._to_recipe_with_dislike_schema(recipe)

    async def remove_from_dislikes(self, user: User, recipe_id: int) -> None:
        recipe = await self.recipe_repository.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if not await self.disliked_recipe_repository.exists(user_id=user.id, recipe_id=recipe_id):
            msg = f"Recipe with id {recipe_id} is not disliked"
            raise RecipeNotDislikedError(msg)

        await self.disliked_recipe_repository.delete(user_id=user.id, recipe_id=recipe_id)
        await self.recsys_repository.delete_feedback(user.id, recipe_id, FeedbackTypeEnum.DISLIKE)

    async def is_disliked(self, user_id: int, recipe_id: int) -> bool:
        return await self.disliked_recipe_repository.exists(user_id=user_id, recipe_id=recipe_id)
