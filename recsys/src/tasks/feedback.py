from dishka.integrations.faststream import inject
from faststream.nats import NatsRouter

from src.core.stream import recommendations_stream
from src.schemas.tasks import AddFeedbackRequest
from src.services.recs_service import RecommendationServiceDependency

router = NatsRouter()


@router.subscriber("recsys_events.add_feedback", stream=recommendations_stream, queue="recsys-events-feedback-queue")
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


@router.subscriber("recsys_events.delete_feedback", stream=recommendations_stream, queue="recsys-events-feedback-queue")
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
