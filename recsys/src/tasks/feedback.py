from dishka.integrations.faststream import inject
from faststream.nats import NatsRouter

from src.schemas.tasks import AddFeedbackRequest
from src.services.recs_service import RecommendationServiceDependency

router = NatsRouter()


@router.subscriber("tasks.add_feedback")
@inject
async def add_feedback_task(
    request: AddFeedbackRequest,
    service: RecommendationServiceDependency,
) -> None:
    await service.add_feedback(
        user_id=request.user_id,
        recipe_id=request.recipe_id,
        feedback_type=request.feedback_type,
    )


@router.subscriber("tasks.delete_feedback")
@inject
async def delete_feedback_task(
    request: AddFeedbackRequest,
    service: RecommendationServiceDependency,
) -> None:
    await service.delete_feedback(
        user_id=request.user_id,
        recipe_id=request.recipe_id,
        feedback_type=request.feedback_type,
    )
