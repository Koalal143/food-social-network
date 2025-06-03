from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Query

from src.core.security import CurrentUserDependency
from src.schemas.recipe import RecipeReadShort
from src.services.recommendation import RecommendationService

router = APIRouter(route_class=DishkaRoute, prefix="/recommendations", tags=["Recommendations"])


@router.get(
    "",
    summary="Get personalized recommendations",
    description="Get personalized recipe recommendations for the current user",
)
async def get_recommendations(
    current_user: CurrentUserDependency,
    service: FromDishka[RecommendationService],
    limit: Annotated[int, Query(ge=1, le=50, description="Number of recommendations")] = 10,
) -> list[RecipeReadShort]:
    return await service.get_user_recommendations(
        user_id=current_user.id,
        limit=limit,
    )
