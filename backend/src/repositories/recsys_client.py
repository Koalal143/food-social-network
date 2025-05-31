import logging
from typing import cast

from faststream.nats import NatsBroker
from nats.errors import TimeoutError as NatsTimeoutError

from src.enums.feedback_type import FeedbackTypeEnum
from src.repositories.interfaces import RecsysRepositoryProtocol
from src.schemas.recsys_messages import (
    AddFeedbackMessage,
    AddImpressionMessage,
    AddRecipeMessage,
    GetRecommendationsRequest,
    RecommendationItem,
    UpdateRecipeMessage,
)

logger = logging.getLogger(__name__)


class RecsysRepository(RecsysRepositoryProtocol):
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
        """Get recommendations from recsys microservice

        Args:
            user_id (int): user of the user to get recommendations for
            limit (int): limit of recommendations to return. Defaults to 10.
            fetch_k (int, optional): number of candidats to fetch from the vector database. Defaults to 20.
            lambda_mult (float, optional): lambda multiplier for balancing relevance and diversity. Defaults to 0.5.
            fail_after (float, optional): timeout for the request in seconds. Defaults to 10.
            exclude_viewed (bool, optional): exclude viewed recipes from the recommendations. Defaults to True.

        Returns:
            list: _description_

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
                subject="recsys.get_recommendations",
                timeout=fail_after,
            )

            response_data = cast("list", await response_msg.decode())
            return [RecommendationItem.model_validate(item) for item in response_data]
        except NatsTimeoutError:
            logger.exception("Timeout getting recommendations for user %s", user_id)
            raise
        except Exception:
            logger.exception("Error getting recommendations for user %s", user_id)
            raise

    async def add_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None:
        message = AddRecipeMessage(
            author_id=author_id,
            recipe_id=recipe_id,
            title=title,
            tags=tags,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="tasks.add_recipe",
            )

        except Exception:
            logger.exception("Error publishing add_recipe task for recipe %s:", recipe_id)

    async def update_recipe(self, recipe_id: int, title: str, tags: str) -> None:
        message = UpdateRecipeMessage(
            recipe_id=recipe_id,
            title=title,
            tags=tags,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="tasks.update_recipe",
            )

        except Exception:
            logger.exception("Error publishing update_recipe task for recipe %s:", recipe_id)
            raise

    async def add_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        message = AddFeedbackMessage(
            user_id=user_id,
            recipe_id=recipe_id,
            feedback_type=feedback_type,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="tasks.add_feedback",
            )

        except Exception:
            logger.exception("Error publishing add_feedback task: user %s, recipe %s:", user_id, recipe_id)
            raise

    async def delete_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        message = AddFeedbackMessage(
            user_id=user_id,
            recipe_id=recipe_id,
            feedback_type=feedback_type,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="tasks.delete_feedback",
            )
        except Exception:
            logger.exception("Error publishing delete_feedback task: user %s, recipe %s:", user_id, recipe_id)
            raise

    async def add_impression(self, user_id: int, recipe_id: int, source: str) -> None:
        message = AddImpressionMessage(
            user_id=user_id,
            recipe_id=recipe_id,
            source=source,
        )

        try:
            await self.broker.publish(
                message=message.model_dump(),
                subject="tasks.add_impression",
            )

        except Exception:
            logger.exception("Error publishing add_impression task: user %s, recipe %s:", user_id, recipe_id)
            raise

    async def add_impressions_bulk(self, impressions: list[AddImpressionMessage]) -> None:
        try:
            await self.broker.publish(
                message=impressions,
                subject="tasks.add_impressions_bulk",
            )

        except Exception:
            logger.exception("Error publishing add_impressions_bulk task")
            raise
