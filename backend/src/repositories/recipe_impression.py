from collections.abc import Sequence
from datetime import UTC, datetime, timedelta

from sqlalchemy import delete, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.enums.recipe_get_source import RecipeGetSourceEnum
from src.models.recipe import Recipe
from src.models.recipe_impression import RecipeImpression
from src.models.user import User


class RecipeImpressionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_all_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[int, Sequence[RecipeImpression]]:
        stmt = (
            select(RecipeImpression)
            .where(RecipeImpression.user_id == user_id)
            .options(
                joinedload(RecipeImpression.recipe).load_only(
                    Recipe.id,
                    Recipe.title,
                    Recipe.short_description,
                    Recipe.image_path,
                    Recipe.difficulty,
                    Recipe.cook_time_minutes,
                )
            )
            .order_by(RecipeImpression.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.scalars(stmt)
        count = await self.get_count_by_user(user_id=user_id)
        return count, result.all()

    async def get_all_by_recipe(
        self,
        recipe_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[int, Sequence[RecipeImpression]]:
        stmt = (
            select(RecipeImpression)
            .where(RecipeImpression.recipe_id == recipe_id)
            .options(
                joinedload(RecipeImpression.user).load_only(
                    User.id,
                    User.username,
                )
            )
            .order_by(RecipeImpression.created_at.desc())
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.scalars(stmt)
        count = await self.get_count_by_recipe(recipe_id=recipe_id)
        return count, result.all()

    async def get_count_by_user(self, user_id: int) -> int:
        stmt = select(func.count()).select_from(RecipeImpression).where(RecipeImpression.user_id == user_id)
        return await self.session.scalar(stmt) or 0

    async def get_count_by_recipe(self, recipe_id: int) -> int:
        stmt = (
            select(func.count(RecipeImpression.user_id.distinct()).label("views_count"))
            .where(RecipeImpression.recipe_id == recipe_id)
            .group_by(Recipe.id)
        )
        return await self.session.scalar(stmt) or 0

    async def create(self, user_id: int, recipe_id: int, source: RecipeGetSourceEnum | None = None) -> RecipeImpression:
        stmt = (
            insert(RecipeImpression)
            .values(user_id=user_id, recipe_id=recipe_id, source=source)
            .on_conflict_do_update(
                index_elements=[RecipeImpression.user_id, RecipeImpression.recipe_id],
                set_={RecipeImpression.updated_at: func.now()},
            )
        )
        result = await self.session.scalars(stmt.returning(RecipeImpression))
        await self.session.flush()
        return result.first()

    async def create_for_anonymous(
        self, anonymous_user_id: int, recipe_id: int, source: RecipeGetSourceEnum | None = None
    ) -> RecipeImpression:
        stmt = (
            insert(RecipeImpression)
            .values(anonymous_user_id=anonymous_user_id, recipe_id=recipe_id, source=source)
            .on_conflict_do_update(
                index_elements=[RecipeImpression.anonymous_user_id, RecipeImpression.recipe_id],
                set_={RecipeImpression.updated_at: func.now()},
            )
        )
        result = await self.session.scalars(stmt.returning(RecipeImpression))
        await self.session.flush()
        return result.first()

    async def delete(self, user_id: int, recipe_id: int) -> None:
        stmt = delete(RecipeImpression).where(
            RecipeImpression.user_id == user_id, RecipeImpression.recipe_id == recipe_id
        )
        await self.session.execute(stmt)
        await self.session.flush()

    async def merge_impressions(self, anonymous_user_id: int, user_id: int) -> None:
        user_seen_recipe_ids_subq = (
            select(RecipeImpression.recipe_id).where(RecipeImpression.user_id == user_id).scalar_subquery()
        )
        stmt = (
            update(RecipeImpression)
            .where(
                RecipeImpression.anonymous_user_id == anonymous_user_id,
                RecipeImpression.recipe_id.not_in(user_seen_recipe_ids_subq),
            )
            .values(user_id=user_id, anonymous_user_id=None)
        )
        await self.session.execute(stmt)
        await self.session.flush()

    async def exists(self, user_id: int, recipe_id: int) -> bool:
        stmt = (
            select(RecipeImpression)
            .where(RecipeImpression.user_id == user_id, RecipeImpression.recipe_id == recipe_id)
            .exists()
        )
        final_stmt = select(stmt)
        result = await self.session.scalar(final_stmt)
        return bool(result)

    async def exists_recent(
        self, user_id: int, recipe_id: int, source: RecipeGetSourceEnum | None, hours: int = 24
    ) -> bool:
        """Check if the recipe was shown to the user in the last given hours."""
        time_threshold = datetime.now(UTC) - timedelta(hours=hours)
        stmt = (
            select(RecipeImpression)
            .where(
                RecipeImpression.user_id == user_id,
                RecipeImpression.recipe_id == recipe_id,
                RecipeImpression.created_at >= time_threshold,
                RecipeImpression.source == source,
            )
            .exists()
        )
        final_stmt = select(stmt)
        result = await self.session.scalar(final_stmt)
        return bool(result)

    async def exists_recent_for_anonymous(
        self, anonymous_user_id: int, recipe_id: int, source: RecipeGetSourceEnum | None, hours: int = 24
    ) -> bool:
        """Check if the recipe was shown to the anonymous user in the last given hours."""
        time_threshold = datetime.now(UTC) - timedelta(hours=hours)
        stmt = (
            select(RecipeImpression)
            .where(
                RecipeImpression.anonymous_user_id == anonymous_user_id,
                RecipeImpression.recipe_id == recipe_id,
                RecipeImpression.created_at >= time_threshold,
                RecipeImpression.source == source,
            )
            .exists()
        )
        final_stmt = select(stmt)
        result = await self.session.scalar(final_stmt)
        return bool(result)

    async def get_user_viewed_recipes_count(self, user_id: int) -> int:
        stmt = select(func.count(RecipeImpression.recipe_id.distinct())).where(RecipeImpression.user_id == user_id)
        return await self.session.scalar(stmt) or 0
