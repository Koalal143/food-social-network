from collections.abc import Sequence
from typing import Any

from sqlalchemy import delete, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from src.models.recipe import Recipe


class RecipeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, recipe_id: int) -> Recipe | None:
        stmt = (
            select(Recipe)
            .where(Recipe.id == recipe_id)
            .options(
                selectinload(Recipe.ingredients),
                selectinload(Recipe.instructions),
                selectinload(Recipe.tags),
            )
        )
        result = await self.session.scalars(stmt)
        return result.first()

    async def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[Recipe]:
        stmt = (
            select(Recipe)
            .options(
                selectinload(Recipe.ingredients),
                selectinload(Recipe.instructions),
                selectinload(Recipe.tags),
            )
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.scalars(stmt)
        return result.all()

    async def create(self, **fields: Any) -> Recipe:
        db_recipe = Recipe(**fields)
        self.session.add(db_recipe)
        await self.session.flush()
        await self.session.refresh(db_recipe)
        return db_recipe

    async def update(self, recipe_id: int, **fields: Any) -> Recipe | None:
        stmt = update(Recipe).where(Recipe.id == recipe_id).values(**fields).returning(Recipe)
        result = await self.session.scalars(stmt)
        return result.first()

    async def delete_by_id(self, recipe_id: int) -> None:
        stmt = delete(Recipe).where(Recipe.id == recipe_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def exists(self, recipe_id: int) -> bool:
        stmt = select(Recipe.id).where(Recipe.id == recipe_id).exists()
        final_stmt = select(stmt)
        result = await self.session.scalar(final_stmt)
        return bool(result)

    async def get_by_title(self, title: str) -> Recipe | None:
        stmt = select(Recipe).where(Recipe.title == title)
        result = await self.session.scalars(stmt)
        return result.first
