from src.adapters.storage import S3Storage
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.favorite_recipe import RecipeAlreadyInFavoritesError, RecipeNotInFavoritesError
from src.exceptions.recipe import RecipeNotFoundError
from src.models.recipe import Recipe
from src.models.user import User
from src.schemas.favorite_recipe import FavoriteRecipeCreate, FavoriteRecipeRead
from src.schemas.recipe import RecipeReadShort


class FavoriteRecipeService:
    def __init__(self, uow: SQLAlchemyUnitOfWork, s3_storage: S3Storage) -> None:
        self.uow = uow
        self.s3_storage = s3_storage
        self._recipe_bucket_name = "images"

    async def _to_recipe_schema(self, favorite_recipe: Recipe) -> FavoriteRecipeRead:
        recipe = RecipeReadShort.model_validate(favorite_recipe)
        if recipe.image_url:
            recipe.image_url = await self.s3_storage.get_file_url(
                self._recipe_bucket_name, recipe.image_url, expires_in=3600
            )

        return recipe

    async def get_user_favorites(
        self, user_id: int, skip: int = 0, limit: int = 10
    ) -> tuple[int, list[RecipeReadShort]]:
        count, favorites = await self.uow.favorite_recipes.get_all_by_user(user_id=user_id, skip=skip, limit=limit)

        favorite_recipes = [await self._to_recipe_schema(favorite.recipe) for favorite in favorites]

        return count, favorite_recipes

    async def add_to_favorites(self, user: User, favorite_data: FavoriteRecipeCreate) -> FavoriteRecipeRead:
        recipe_id = favorite_data.recipe_id

        recipe = await self.uow.recipes.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if await self.uow.favorite_recipes.exists(user_id=user.id, recipe_id=recipe_id):
            msg = f"Recipe with id {recipe_id} is already in favorites"
            raise RecipeAlreadyInFavoritesError(msg)

        favorite = await self.uow.favorite_recipes.create(user_id=user.id, recipe_id=recipe_id)
        await self.uow.commit()

        return favorite

    async def remove_from_favorites(self, user: User, recipe_id: int) -> None:
        recipe = await self.uow.recipes.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if not await self.uow.favorite_recipes.exists(user_id=user.id, recipe_id=recipe_id):
            msg = f"Recipe with id {recipe_id} is not in favorites"
            raise RecipeNotInFavoritesError(msg)

        await self.uow.favorite_recipes.delete(user_id=user.id, recipe_id=recipe_id)
        await self.uow.commit()

    async def is_favorite(self, user_id: int, recipe_id: int) -> bool:
        return await self.uow.favorite_recipes.exists(user_id=user_id, recipe_id=recipe_id)
