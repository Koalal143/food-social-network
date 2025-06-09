from __future__ import annotations

from typing import TYPE_CHECKING, Any, Protocol

if TYPE_CHECKING:
    from src.enums.feedback_type import FeedbackTypeEnum
    from src.schemas.recsys_messages import RecommendationItem


class RecsysRepositoryProtocol(Protocol):
    async def get_recommendations(
        self,
        user_id: int,
        limit: int = 10,
        fetch_k: int = 20,
        lambda_mult: float = 0.5,
        *,
        exclude_viewed: bool = True,
    ) -> list[RecommendationItem]: ...

    async def add_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None: ...

    async def delete_recipe(self, recipe_id: int) -> None: ...

    async def update_recipe(
        self, author_id: int, recipe_id: int, title: str, tags: str, *, is_published: bool
    ) -> None: ...

    async def add_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None: ...

    async def delete_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None: ...

    async def add_impression(self, user_id: int, recipe_id: int, source: str) -> None: ...

    async def add_impressions_bulk(self, impressions: list[Any]) -> None: ...
