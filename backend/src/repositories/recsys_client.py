import logging

from src.adapters.interfaces.recommendations import RecommendationsAdapterProtocol
from src.enums.feedback_type import FeedbackTypeEnum
from src.repositories.interfaces import RecsysRepositoryProtocol
from src.schemas.recsys_messages import AddImpressionMessage, RecommendationItem

logger = logging.getLogger(__name__)


class RecsysRepository(RecsysRepositoryProtocol):
    """Repository for recommendations service interaction.

    Thin wrapper over RecommendationsAdapter, focused on business logic.
    """

    def __init__(self, adapter: RecommendationsAdapterProtocol) -> None:
        self.adapter = adapter

    async def get_recommendations(
        self,
        user_id: int,
        limit: int = 10,
        fetch_k: int = 20,
        lambda_mult: float = 0.5,
        fail_after: float = 10,
        *,
        exclude_viewed: bool = True,
    ) -> list[RecommendationItem]:
        """Get recommendations from recommendations service."""
        return await self.adapter.get_recommendations(
            user_id=user_id,
            limit=limit,
            fetch_k=fetch_k,
            lambda_mult=lambda_mult,
            fail_after=fail_after,
            exclude_viewed=exclude_viewed,
        )

    async def add_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None:
        """Add recipe to recommendations service."""
        await self.adapter.add_recipe(author_id=author_id, recipe_id=recipe_id, title=title, tags=tags)

    async def delete_recipe(self, recipe_id: int) -> None:
        """Delete recipe from recommendations service."""
        await self.adapter.delete_recipe(recipe_id=recipe_id)

    async def update_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None:
        """Update recipe in recommendations service."""
        await self.adapter.update_recipe(author_id=author_id, recipe_id=recipe_id, title=title, tags=tags)

    async def add_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        """Add user feedback."""
        await self.adapter.add_feedback(user_id=user_id, recipe_id=recipe_id, feedback_type=feedback_type)

    async def delete_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        """Delete user feedback."""
        await self.adapter.delete_feedback(user_id=user_id, recipe_id=recipe_id, feedback_type=feedback_type)

    async def add_impression(self, user_id: int, recipe_id: int, source: str) -> None:
        """Add recipe impression for user."""
        await self.adapter.add_impression(user_id=user_id, recipe_id=recipe_id, source=source)

    async def add_impressions_bulk(self, impressions: list[AddImpressionMessage]) -> None:
        """Add multiple recipe impressions."""
        await self.adapter.add_impressions_bulk(impressions=impressions)
