from collections.abc import Sequence
from typing import Any

from sqlalchemy import delete, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.recipe_ingredient import RecipeIngredient


class RecipeIngredientRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, ingredient_id: int) -> RecipeIngredient | None:
        stmt = select(RecipeIngredient).where(RecipeIngredient.id == ingredient_id)
        result = await self.session.scalars(stmt)
        return result.first()

    async def get_all_for_recipe(self, recipe_id: int, skip: int = 0, limit: int = 100) -> Sequence[RecipeIngredient]:
        stmt = select(RecipeIngredient).where(RecipeIngredient.recipe_id == recipe_id).offset(skip).limit(limit)
        result = await self.session.execute(stmt)
        return result.scalars().all()

    async def create(self, recipe_id: int, name: str, quantity: str | None = None) -> RecipeIngredient:
        db_ingredient = RecipeIngredient(name=name, quantity=quantity, recipe_id=recipe_id)
        self.session.add(db_ingredient)
        await self.session.flush()
        await self.session.refresh(db_ingredient)
        return db_ingredient

    async def bulk_create(self, ingredients: list[dict[str, Any]]) -> Sequence[RecipeIngredient]:
        stmt = insert(RecipeIngredient).values(ingredients).returning(RecipeIngredient)
        result = await self.session.scalars(stmt)
        await self.session.flush()
        return result.all()

    async def delete_by_recipe_id(self, recipe_id: int) -> None:
        stmt = delete(RecipeIngredient).where(RecipeIngredient.recipe_id == recipe_id)
        await self.session.execute(stmt)

    async def delete_by_id(self, ingredient_id: int) -> None:
        stmt = delete(RecipeIngredient).where(RecipeIngredient.id == ingredient_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def exists(self, ingredient_id: int) -> bool:
        stmt = select(RecipeIngredient.id).where(RecipeIngredient.id == ingredient_id).exists()
        final_stmt = select(stmt)
        return bool(await self.session.scalar(final_stmt))
