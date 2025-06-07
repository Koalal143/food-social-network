from dishka.integrations.faststream import inject
from faststream.nats import NatsRouter

from src.core.stream import recommendations_stream
from src.schemas.tasks import AddImpressionRequest
from src.services.recs_service import RecommendationServiceDependency

router = NatsRouter()


@router.subscriber("recsys_events.add_impression", stream=recommendations_stream)
@inject
async def add_impression_task(
    request: AddImpressionRequest,
    service: RecommendationServiceDependency,
) -> None:
    await service.add_impression(
        user_id=request.user_id,
        recipe_id=request.recipe_id,
        source=request.source,
    )


@router.subscriber("recsys_events.add_impressions_bulk", stream=recommendations_stream)
@inject
async def add_impressions_bulk_task(
    request: list[AddImpressionRequest],
    service: RecommendationServiceDependency,
) -> None:
    await service.add_impressions_bulk(impressions=request)
