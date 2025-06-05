from collections.abc import Sequence

from sqlalchemy import delete, func, select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.disliked_recipes import DislikedRecipe
from src.models.recipe import Recipe
from src.repositories.interfaces.disliked_recipe import DislikedRecipeRepositoryProtocol


class DislikedRecipeRepository(DislikedRecipeRepositoryProtocol):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_all_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[int, Sequence[DislikedRecipe]]:
        stmt = (
            select(DislikedRecipe)
            .where(DislikedRecipe.user_id == user_id)
            .options(
                joinedload(DislikedRecipe.recipe).load_only(
                    Recipe.id,
                    Recipe.title,
                    Recipe.short_description,
                    Recipe.image_path,
                    Recipe.difficulty,
                    Recipe.cook_time_minutes,
                    Recipe.slug,
                )
            )
            .order_by(DislikedRecipe.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.scalars(stmt)
        count = await self.get_count(user_id=user_id)
        return count, result.all()

    async def get_count(self, user_id: int) -> int:
        stmt = select(func.count()).select_from(DislikedRecipe).where(DislikedRecipe.user_id == user_id)
        return await self.session.scalar(stmt) or 0

    async def create(self, user_id: int, recipe_id: int) -> DislikedRecipe:
        disliked_recipe = DislikedRecipe(user_id=user_id, recipe_id=recipe_id)
        self.session.add(disliked_recipe)
        await self.session.flush()
        await self.session.refresh(disliked_recipe)
        return disliked_recipe

    async def delete(self, user_id: int, recipe_id: int) -> None:
        stmt = delete(DislikedRecipe).where(DislikedRecipe.user_id == user_id, DislikedRecipe.recipe_id == recipe_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def exists(self, user_id: int, recipe_id: int) -> bool:
        stmt = (
            select(DislikedRecipe)
            .where(DislikedRecipe.user_id == user_id, DislikedRecipe.recipe_id == recipe_id)
            .exists()
        )
        final_stmt = select(stmt)
        result = await self.session.scalar(final_stmt)
        return bool(result)
