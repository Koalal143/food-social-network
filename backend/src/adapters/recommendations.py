import logging
from typing import cast

from faststream.nats import NatsBroker
from nats.errors import TimeoutError as NatsTimeoutError

from src.adapters.interfaces.recommendations import RecommendationsAdapterProtocol
from src.enums.feedback_type import FeedbackTypeEnum
from src.schemas.recsys_messages import (
    AddFeedbackMessage,
    AddImpressionMessage,
    AddRecipeMessage,
    GetRecommendationsRequest,
    RecommendationItem,
    UpdateRecipeMessage,
)

logger = logging.getLogger(__name__)


class RecommendationsAdapter(RecommendationsAdapterProtocol):
    """Adapter for recommendations service interaction via NATS."""

    def __init__(self, broker: NatsBroker) -> None:
        self.broker = broker

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
        """Get recommendations from recommendations service.

        Args:
            user_id: User ID to get recommendations for
            limit: Limit of recommendations to return
            fetch_k: Number of candidates to fetch from vector database
            lambda_mult: Lambda multiplier for balancing relevance and diversity
            fail_after: Request timeout in seconds
            exclude_viewed: Exclude viewed recipes from recommendations

        Returns:
            List of recommendations

        Raises:
            NatsTimeoutError: When timeout is exceeded
            Exception: For other service interaction errors

        """
        request = GetRecommendationsRequest(
            user_id=user_id,
            limit=limit,
            fetch_k=fetch_k,
            lambda_mult=lambda_mult,
            exclude_viewed=exclude_viewed,
        )

        try:
            response_msg = await self.broker.request(
                message=request.model_dump(),
                subject="recsys_rpc.get_recommendations",
                timeout=fail_after,
            )

            response_data = cast("list", await response_msg.decode())
            return [RecommendationItem.model_validate(item) for item in response_data]
        except NatsTimeoutError:
            msg = f"Timeout getting recommendations for user {user_id}"
            logger.exception(msg)
            raise
        except Exception:
            msg = f"Error getting recommendations for user {user_id}"
            logger.exception(msg)
            raise

    async def add_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None:
        """Add recipe to recommendations service.

        Args:
            author_id: Recipe author ID
            recipe_id: Recipe ID
            title: Recipe title
            tags: Recipe tags

        Raises:
            Exception: When message publishing fails

        """
        message = AddRecipeMessage(
            author_id=author_id,
            recipe_id=recipe_id,
            title=title,
            tags=tags,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="recsys_events.add_recipe",
                stream="recsys_events_stream",
            )
        except Exception:
            msg = f"Error publishing add_recipe task for recipe {recipe_id}"
            logger.exception(msg)
            raise

    async def delete_recipe(self, recipe_id: int) -> None:
        """Delete recipe from recommendations service.

        Args:
            recipe_id: Recipe ID

        Raises:
            Exception: When message publishing fails

        """
        try:
            await self.broker.publish(
                message={"recipe_id": recipe_id},
                subject="recsys_events.delete_recipe",
                stream="recsys_events_stream",
            )
        except Exception:
            msg = f"Error publishing delete_recipe task for recipe {recipe_id}"
            logger.exception(msg)

    async def update_recipe(self, author_id: int, recipe_id: int, title: str, tags: str, *, is_published: bool) -> None:
        """Update recipe in recommendations service.

        Args:
            author_id: ID of the recipe author
            recipe_id: Recipe ID
            title: New recipe title
            tags: New recipe tags
            is_published: Is the recipe published or not

        Raises:
            Exception: When message publishing fails

        """
        message = UpdateRecipeMessage(
            author_id=author_id,
            recipe_id=recipe_id,
            title=title,
            tags=tags,
            is_published=is_published,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="recsys_events.update_recipe",
                stream="recsys_events_stream",
            )
        except Exception:
            msg = f"Error publishing update_recipe task for recipe {recipe_id}"
            logger.exception(msg)
            raise

    async def add_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        """Add user feedback.

        Args:
            user_id: User ID
            recipe_id: Recipe ID
            feedback_type: Feedback type (like/dislike)

        Raises:
            Exception: When message publishing fails

        """
        message = AddFeedbackMessage(
            user_id=user_id,
            recipe_id=recipe_id,
            feedback_type=feedback_type,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="recsys_events.add_feedback",
                stream="recsys_events_stream",
            )
        except Exception:
            msg = f"Error publishing add_feedback task: user {user_id}, recipe {recipe_id}"
            logger.exception(msg)
            raise

    async def delete_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        """Delete user feedback.

        Args:
            user_id: User ID
            recipe_id: Recipe ID
            feedback_type: Feedback type (like/dislike)

        Raises:
            Exception: When message publishing fails

        """
        message = AddFeedbackMessage(
            user_id=user_id,
            recipe_id=recipe_id,
            feedback_type=feedback_type,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="recsys_events.delete_feedback",
                stream="recsys_events_stream",
            )
        except Exception:
            msg = f"Error publishing delete_feedback task: user {user_id}, recipe {recipe_id}"
            logger.exception(msg)
            raise

    async def add_impression(self, user_id: int, recipe_id: int, source: str) -> None:
        """Add recipe impression for user.

        Args:
            user_id: User ID
            recipe_id: Recipe ID
            source: Impression source

        Raises:
            Exception: When message publishing fails

        """
        message = AddImpressionMessage(
            user_id=user_id,
            recipe_id=recipe_id,
            source=source,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="recsys_events.add_impression",
                stream="recsys_events_stream",
            )
        except Exception:
            msg = f"Error publishing add_impression task: user {user_id}, recipe {recipe_id}"
            logger.exception(msg)
            raise

    async def add_impressions_bulk(self, impressions: list[AddImpressionMessage]) -> None:
        """Add multiple recipe impressions.

        Args:
            impressions: List of impression messages

        Raises:
            Exception: When message publishing fails

        """
        try:
            await self.broker.publish(
                message=[impression.model_dump() for impression in impressions],
                subject="recsys_events.add_impressions_bulk",
                stream="recsys_events_stream",
            )
        except Exception:
            msg = "Error publishing add_impressions_bulk task"
            logger.exception(msg)
            raise
