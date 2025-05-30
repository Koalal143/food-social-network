from collections.abc import Sequence
from typing import Any

from sqlalchemy import delete, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.recipe import Recipe
from src.models.user_feedback import FeedbackType, UserFeedback
from src.models.user_impression import ImpressionSource, UserImpression


class UserFeedbackRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackType) -> UserFeedback:
        feedback = UserFeedback(user_id=user_id, recipe_id=recipe_id, feedback_type=feedback_type)
        self.session.add(feedback)
        await self.session.commit()
        await self.session.refresh(feedback)
        return feedback

    async def delete_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackType) -> None:
        stmt = delete(UserFeedback).where(
            UserFeedback.user_id == user_id,
            UserFeedback.recipe_id == recipe_id,
            UserFeedback.feedback_type == feedback_type,
        )
        await self.session.execute(stmt)
        await self.session.commit()

    async def get_feedback(self, user_id: int, recipe_id: int) -> UserFeedback | None:
        stmt = select(UserFeedback).where(UserFeedback.user_id == user_id, UserFeedback.recipe_id == recipe_id)
        result = await self.session.scalars(stmt)
        return result.first()

    async def list_feedbacks(self, user_id: int) -> Sequence[UserFeedback]:
        stmt = select(UserFeedback).where(UserFeedback.user_id == user_id)
        result = await self.session.scalars(stmt)
        return result.all()

    async def get_liked_recipe_ids(self, user_id: int) -> Sequence[int]:
        stmt = select(UserFeedback.recipe_id).where(
            UserFeedback.user_id == user_id, UserFeedback.feedback_type == FeedbackType.like
        )
        result = await self.session.scalars(stmt)
        return result.all()

    async def get_disliked_recipe_ids(self, user_id: int) -> Sequence[int]:
        stmt = select(UserFeedback.recipe_id).where(
            UserFeedback.user_id == user_id, UserFeedback.feedback_type == FeedbackType.dislike
        )
        result = await self.session.scalars(stmt)
        return result.all()


class UserImpressionRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add_impression(self, user_id: int, recipe_id: int, source: ImpressionSource) -> UserImpression:
        impression = UserImpression(user_id=user_id, recipe_id=recipe_id, source=source)
        self.session.add(impression)
        await self.session.commit()
        await self.session.refresh(impression)
        return impression

    async def add_impressions_bulk(self, impressions: list[dict[str, Any]]) -> Sequence[UserImpression]:
        stmt = insert(UserImpression).values(impressions).returning(UserImpression)
        result = await self.session.scalars(stmt)
        await self.session.commit()
        return result.all()

    async def list_impressions(self, user_id: int) -> Sequence[UserImpression]:
        stmt = select(UserImpression).where(UserImpression.user_id == user_id)
        result = await self.session.scalars(stmt)
        return result.all()

    async def get_viewed_recipe_ids(self, user_id: int) -> Sequence[int]:
        stmt = select(UserImpression.recipe_id).where(UserImpression.user_id == user_id)
        result = await self.session.scalars(stmt)
        return result.all()

    async def get_recs_detail_recipe_ids(self, user_id: int) -> Sequence[int]:
        stmt = select(UserImpression.recipe_id).where(
            UserImpression.user_id == user_id, UserImpression.source == ImpressionSource.recs_detail
        )
        result = await self.session.scalars(stmt)
        return result.all()


class RecipeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def add_recipe(self, recipe_id: int, author_id: int) -> Recipe:
        stmt = insert(Recipe).values(id=recipe_id, author_id=author_id).on_conflict_do_nothing().returning(Recipe)
        result = await self.session.scalars(stmt)
        await self.session.commit()
        return result.first()

    async def publish_recipe(self, recipe_id: int) -> Recipe:
        stmt = update(Recipe).where(Recipe.id == recipe_id).values(is_published=True).returning(Recipe)
        result = await self.session.scalars(stmt)
        await self.session.commit()
        return result.first()

    async def delete_recipe(self, recipe_id: int) -> None:
        stmt = delete(Recipe).where(Recipe.id == recipe_id)
        await self.session.execute(stmt)
        await self.session.commit()

    async def get_recipe_ids_by_author(self, author_id: int) -> Sequence[int]:
        stmt = select(Recipe.id).where(Recipe.author_id == author_id)
        result = await self.session.scalars(stmt)
        return result.all()
