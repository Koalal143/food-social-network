import logging

from dishka.integrations.faststream import inject
from faststream.nats import NatsRouter

from src.schemas.recommendations import RecommendationItem
from src.schemas.tasks import GetRecommendationsRequest
from src.services.recs_service import RecommendationServiceDependency

logger = logging.getLogger(__name__)

router = NatsRouter()


@router.subscriber("recsys_rpc.get_recommendations")
@inject
async def get_user_recommendations_rpc(
    message: GetRecommendationsRequest,
    service: RecommendationServiceDependency,
) -> list[RecommendationItem]:
    try:
        request = GetRecommendationsRequest.model_validate(message)
    except Exception:
        logger.exception("Invalid request format")
        raise

    recommendations = await service.get_vector_based_recommendations(
        user_id=request.user_id,
        limit=request.limit,
        fetch_k=request.fetch_k,
        lambda_mult=request.lambda_mult,
        exclude_viewed=request.exclude_viewed,
    )

    return [RecommendationItem(recipe_id=item["recipe_id"], score=item["score"]) for item in recommendations]
