from typing import Any, Protocol

from src.schemas.recsys_messages import RecommendationItem


class RecsysRepositoryProtocol(Protocol):
    """Protocol for recommendations service repository."""

    async def get_recommendations(
        self,
        user_id: int,
        limit: int = 10,
        fetch_k: int = 20,
        lambda_mult: float = 0.5,
        *,
        exclude_viewed: bool = True,
    ) -> list[RecommendationItem]:
        """Get recommendations from recommendations service."""
        ...

    async def add_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None:
        """Add recipe to recommendations service."""
        ...

    async def update_recipe(self, recipe_id: int, title: str, tags: str) -> None:
        """Update recipe in recommendations service."""
        ...

    async def add_feedback(self, user_id: int, recipe_id: int, feedback_type: str) -> None:
        """Add user feedback."""
        ...

    async def delete_feedback(self, user_id: int, recipe_id: int, feedback_type: str) -> None:
        """Delete user feedback."""
        ...

    async def add_impression(self, user_id: int, recipe_id: int, source: str) -> None:
        """Add recipe impression for user."""
        ...

    async def add_impressions_bulk(self, impressions: list[Any]) -> None:
        """Add multiple recipe impressions."""
        ...
