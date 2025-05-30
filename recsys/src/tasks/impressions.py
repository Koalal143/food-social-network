from dishka.integrations.faststream import inject
from faststream.nats import NatsRouter

from src.schemas.tasks import AddImpressionRequest
from src.services.recs_service import RecommendationServiceDependency

router = NatsRouter()


@router.subscriber("tasks.add_impression")
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


@router.subscriber("tasks.add_impressions_bulk")
@inject
async def add_impressions_bulk_task(
    request: list[AddImpressionRequest],
    service: RecommendationServiceDependency,
) -> None:
    await service.add_impressions_bulk(impressions=request)
