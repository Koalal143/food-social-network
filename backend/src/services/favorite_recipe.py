from src.exceptions.favorite_recipe import RecipeAlreadyInFavoritesError, RecipeNotInFavoritesError
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
from src.schemas.favorite_recipe import FavoriteRecipeCreate, FavoriteRecipeRead
from src.schemas.recipe import RecipeReadShort


class FavoriteRecipeService:
    def __init__(
        self,
        favorite_recipe_repository: FavoriteRecipeRepositoryProtocol,
        recipe_repository: RecipeRepositoryProtocol,
        disliked_recipe_repository: DislikedRecipeRepositoryProtocol,
        recipe_image_repository: RecipeImageRepositoryProtocol,
        recsys_repository: RecsysRepositoryProtocol,
    ) -> None:
        self.favorite_recipe_repository = favorite_recipe_repository
        self.recipe_repository = recipe_repository
        self.disliked_recipe_repository = disliked_recipe_repository
        self.recipe_image_repository = recipe_image_repository
        self.recsys_repository = recsys_repository

    async def _to_recipe_with_like_schema(self, favorite_recipe: Recipe) -> FavoriteRecipeRead:
        recipe = RecipeReadShort.model_validate(favorite_recipe)
        if favorite_recipe.image_path:
            recipe.image_url = await self.recipe_image_repository.get_image_url(favorite_recipe.image_path)

        recipe.is_on_favorites = True
        return recipe

    async def get_user_favorites(
        self, user_id: int, skip: int = 0, limit: int = 10
    ) -> tuple[int, list[RecipeReadShort]]:
        count, favorites = await self.favorite_recipe_repository.get_all_by_user(
            user_id=user_id, skip=skip, limit=limit
        )

        favorite_recipes = [await self._to_recipe_with_like_schema(favorite.recipe) for favorite in favorites]

        return count, favorite_recipes

    async def add_to_favorites(self, user: User, favorite_data: FavoriteRecipeCreate) -> FavoriteRecipeRead:
        recipe_id = favorite_data.recipe_id

        recipe = await self.recipe_repository.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if await self.favorite_recipe_repository.exists(user_id=user.id, recipe_id=recipe_id):
            msg = f"Recipe with id {recipe_id} is already in favorites"
            raise RecipeAlreadyInFavoritesError(msg)

        if await self.disliked_recipe_repository.exists(user_id=user.id, recipe_id=recipe_id):
            await self.disliked_recipe_repository.delete(user_id=user.id, recipe_id=recipe_id)

        await self.favorite_recipe_repository.create(user_id=user.id, recipe_id=recipe_id)
        recipe = await self.recipe_repository.get_by_id(recipe_id)
        return await self._to_recipe_with_like_schema(recipe)

    async def remove_from_favorites(self, user: User, recipe_id: int) -> None:
        recipe = await self.recipe_repository.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if not await self.favorite_recipe_repository.exists(user_id=user.id, recipe_id=recipe_id):
            msg = f"Recipe with id {recipe_id} is not in favorites"
            raise RecipeNotInFavoritesError(msg)

        await self.favorite_recipe_repository.delete(user_id=user.id, recipe_id=recipe_id)

    async def is_favorite(self, user_id: int, recipe_id: int) -> bool:
        return await self.favorite_recipe_repository.exists(user_id=user_id, recipe_id=recipe_id)
