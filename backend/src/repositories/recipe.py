from collections.abc import Sequence
from typing import Any

from sqlalchemy import Select, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from src.models.recipe import Recipe
from src.models.user import User
from src.models.user_profile import UserProfile


class RecipeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _main_query(self, recipe_id: int) -> Select[tuple[Recipe]]:
        return (
            select(Recipe)
            .where(Recipe.id == recipe_id)
            .options(
                selectinload(Recipe.ingredients),
                selectinload(Recipe.instructions),
                selectinload(Recipe.tags),
            )
        )

    def _get_with_author_short(self, recipe_id: int) -> Select[tuple[Recipe]]:
        return self._main_query(recipe_id=recipe_id).options(
            joinedload(Recipe.author)
            .load_only(User.id, User.username)
            .joinedload(User.profile)
            .load_only(UserProfile.avatar_url)
        )

    async def get_by_id(self, recipe_id: int) -> Recipe | None:
        stmt = self._get_with_author_short(recipe_id=recipe_id)
        result = await self.session.scalars(stmt)
        return result.first()

    async def get_all(self, skip: int = 0, limit: int = 100, **filters: Any) -> tuple[int, Sequence[Recipe]]:
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
        if filters:
            stmt = stmt.filter_by(**filters)
        result = await self.session.scalars(stmt)
        count = await self.session.scalar(select(func.count(Recipe.id)).filter_by(**filters))
        return count or 0, result.all()

    async def create(self, **fields: Any) -> Recipe:
        db_recipe = Recipe(**fields)
        self.session.add(db_recipe)
        await self.session.flush()
        await self.session.refresh(db_recipe)
        return db_recipe

    async def update(self, recipe_id: int, **fields: Any) -> Recipe | None:
        stmt = update(Recipe).where(Recipe.id == recipe_id).values(**fields)
        await self.session.execute(stmt)
        return await self.get_by_id(recipe_id=recipe_id)

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
        return result.first()
