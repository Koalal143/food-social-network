from collections.abc import Sequence
from typing import Any

from sqlalchemy import delete, insert, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.recipe_tag import RecipeTag


class RecipeTagRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_id(self, tag_id: int) -> RecipeTag | None:
        stmt = select(RecipeTag).where(RecipeTag.id == tag_id)
        stmt = select(RecipeTag).where(RecipeTag.id == tag_id)
        result = await self.session.execute(stmt)
        return result.scalar_one_or_none()

    async def get_all(self, skip: int = 0, limit: int = 100) -> Sequence[RecipeTag]:
        stmt = select(RecipeTag).offset(skip).limit(limit)
        result = await self.session.scalars(stmt)
        return result.all()

    async def create(self, **fields: Any) -> RecipeTag:
        db_tag = RecipeTag(**fields)
        self.session.add(db_tag)
        await self.session.flush()
        await self.session.refresh(db_tag)
        return db_tag

    async def bulk_create(self, tags_list: list[dict[str, Any]]) -> Sequence[RecipeTag]:
        stmt = insert(RecipeTag).values(tags_list).returning(RecipeTag)
        result = await self.session.scalars(stmt)
        await self.session.flush()
        return result.all()

    async def delete_by_recipe_id(self, recipe_id: int) -> None:
        stmt = delete(RecipeTag).where(RecipeTag.recipe_id == recipe_id)
        await self.session.execute(stmt)
