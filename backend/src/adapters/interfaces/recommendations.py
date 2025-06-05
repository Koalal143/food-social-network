from typing import Protocol

from src.enums.feedback_type import FeedbackTypeEnum
from src.schemas.recsys_messages import AddImpressionMessage, RecommendationItem


class RecommendationsAdapterProtocol(Protocol):
    """Protocol for recommendations service adapter via NATS communication."""

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
        ...

    async def add_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None:
        """Add recipe to recommendations service."""
        ...

    async def delete_recipe(self, recipe_id: int) -> None:
        """Delete recipe from recommendations service."""
        ...

    async def update_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None:
        """Update recipe in recommendations service."""
        ...

    async def add_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        """Add user feedback."""
        ...

    async def delete_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        """Delete user feedback."""
        ...

    async def add_impression(self, user_id: int, recipe_id: int, source: str) -> None:
        """Add recipe impression for user."""
        ...

    async def add_impressions_bulk(self, impressions: list[AddImpressionMessage]) -> None:
        """Add multiple recipe impressions."""
        ...
