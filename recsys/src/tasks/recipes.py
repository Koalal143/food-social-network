from dishka.integrations.faststream import inject
from faststream.nats import NatsRouter

from src.core.stream import recommendations_stream
from src.schemas.tasks import (
    AddRecipeRequest,
    DeleteRecipeRequest,
    UpdateRecipeRequest,
)
from src.services.recs_service import RecommendationServiceDependency

router = NatsRouter()


@router.subscriber("recsys_events.add_recipe", stream=recommendations_stream, queue="recsys-events-recipes-queue")
@inject
async def add_recipe_task(
    request: AddRecipeRequest,
    service: RecommendationServiceDependency,
) -> None:
    await service.add_recipe_with_embedding(
        author_id=request.author_id,
        recipe_id=request.recipe_id,
        title=request.title,
        tags=request.tags,
    )


@router.subscriber("recsys_events.update_recipe", stream=recommendations_stream, queue="recsys-events-recipes-queue")
@inject
async def update_recipe_task(
    request: UpdateRecipeRequest,
    service: RecommendationServiceDependency,
) -> None:
    await service.add_recipe_with_embedding(
        author_id=request.author_id,
        recipe_id=request.recipe_id,
        title=request.title,
        tags=request.tags,
    )


@router.subscriber("recsys_events.delete_recipe", stream=recommendations_stream, queue="recsys-events-recipes-queue")
@inject
async def delete_recipe_task(
    request: DeleteRecipeRequest,
    service: RecommendationServiceDependency,
) -> None:
    await service.delete_recipe(request.recipe_id)
