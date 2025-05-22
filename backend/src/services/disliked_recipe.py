from src.adapters.storage import S3Storage
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.disliked_recipe import RecipeAlreadyDislikedError, RecipeNotDislikedError
from src.exceptions.recipe import RecipeNotFoundError
from src.models.recipe import Recipe
from src.models.user import User
from src.schemas.disliked_recipe import DislikedRecipeCreate, DislikedRecipeRead
from src.schemas.recipe import RecipeReadShort


class DislikedRecipeService:
    def __init__(self, uow: SQLAlchemyUnitOfWork, s3_storage: S3Storage) -> None:
        self.uow = uow
        self.s3_storage = s3_storage
        self._recipe_bucket_name = "images"

    async def _to_recipe_with_dislike_schema(self, disliked_recipe: Recipe) -> DislikedRecipeRead:
        recipe = RecipeReadShort.model_validate(disliked_recipe)
        if recipe.image_url:
            recipe.image_url = await self.s3_storage.get_file_url(
                self._recipe_bucket_name, recipe.image_url, expires_in=3600
            )

        recipe.is_disliked = True
        return recipe

    async def get_user_dislikes(
        self, user_id: int, skip: int = 0, limit: int = 10
    ) -> tuple[int, list[RecipeReadShort]]:
        count, dislikes = await self.uow.disliked_recipes.get_all_by_user(user_id=user_id, skip=skip, limit=limit)

        disliked_recipes = [await self._to_recipe_with_dislike_schema(dislike.recipe) for dislike in dislikes]

        return count, disliked_recipes

    async def add_to_dislikes(self, user: User, dislike_data: DislikedRecipeCreate) -> DislikedRecipeRead:
        recipe_id = dislike_data.recipe_id

        recipe = await self.uow.recipes.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if await self.uow.disliked_recipes.exists(user_id=user.id, recipe_id=recipe_id):
            msg = f"Recipe with id {recipe_id} is already disliked"
            raise RecipeAlreadyDislikedError(msg)

        if await self.uow.favorite_recipes.exists(user_id=user.id, recipe_id=recipe_id):
            await self.uow.favorite_recipes.delete(user_id=user.id, recipe_id=recipe_id)

        disliked = await self.uow.disliked_recipes.create(user_id=user.id, recipe_id=recipe_id)
        await self.uow.commit()

        return await self._to_recipe_with_dislike_schema(disliked)

    async def remove_from_dislikes(self, user: User, recipe_id: int) -> None:
        recipe = await self.uow.recipes.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if not await self.uow.disliked_recipes.exists(user_id=user.id, recipe_id=recipe_id):
            msg = f"Recipe with id {recipe_id} is not disliked"
            raise RecipeNotDislikedError(msg)

        await self.uow.disliked_recipes.delete(user_id=user.id, recipe_id=recipe_id)
        await self.uow.commit()

    async def is_disliked(self, user_id: int, recipe_id: int) -> bool:
        return await self.uow.disliked_recipes.exists(user_id=user_id, recipe_id=recipe_id)
