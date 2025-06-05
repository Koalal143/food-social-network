from dishka.integrations.faststream import inject
from faststream.nats import NatsRouter

from src.schemas.tasks import (
    AddRecipeRequest,
    DeleteRecipeRequest,
    UpdateRecipeRequest,
)
from src.services.recs_service import RecommendationServiceDependency

router = NatsRouter()


@router.subscriber("tasks.add_recipe")
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

@router.subscriber("tasks.update_recipe")
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


@router.subscriber("tasks.delete_recipe")
async def delete_recipe_task(
    request: DeleteRecipeRequest,
    service: RecommendationServiceDependency,
) -> None:
    await service.delete_recipe(request.recipe_id)
