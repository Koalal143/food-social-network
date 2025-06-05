from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Path, Query, Response, status

from src.core.security import CurrentUserDependency
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions import AppHTTPException, RecipeNotFoundError
from src.exceptions.disliked_recipe import RecipeAlreadyDislikedError, RecipeNotDislikedError
from src.schemas.disliked_recipe import DislikedRecipeCreate
from src.schemas.recipe import RecipeReadFull, RecipeReadShort
from src.services.disliked_recipe import DislikedRecipeService
from src.services.recipe import RecipeService
from src.utils.examples_factory import json_example_factory

router = APIRouter(route_class=DishkaRoute, prefix="/disliked-recipes", tags=["Disliked Recipes"])


@router.get(
    "",
    summary="Get user's disliked recipes",
    description="Returns a list of user's disliked recipes with pagination. "
    "The total count of recipes is returned in the X-Total-Count header. "
    "Authentication required.",
)
async def get_disliked_recipes(
    current_user: CurrentUserDependency,
    disliked_service: FromDishka[DislikedRecipeService],
    response: Response,
    offset: Annotated[int, Query(ge=0, description="Смещение для пагинации")] = 0,
    limit: Annotated[int, Query(ge=1, le=50, description="Количество рецептов на странице")] = 10,
) -> list[RecipeReadShort]:
    total, dislikes = await disliked_service.get_user_dislikes(user_id=current_user.id, skip=offset, limit=limit)
    response.headers["X-Total-Count"] = str(total)
    return dislikes


@router.post(
    "",
    summary="Add recipe to dislikes",
    description="Adds a recipe to user's dislikes. If the recipe is already in favorites, "
    "it will be automatically removed from there. Authentication required.",
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Recipe already disliked",
            "content": json_example_factory(
                {"detail": "Recipe with id 2 is already disliked", "error_key": "recipe_already_disliked"}
            ),
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Recipe not found",
            "content": json_example_factory(
                {"detail": "Recipe with id 999 not found", "error_key": "recipe_not_found"}
            ),
        },
    },
)
async def add_to_dislikes(
    dislike_data: DislikedRecipeCreate,
    current_user: CurrentUserDependency,
    disliked_service: FromDishka[DislikedRecipeService],
    recipe_service: FromDishka[RecipeService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> RecipeReadFull:
    async with uow:
        try:
            await disliked_service.add_to_dislikes(user=current_user, dislike_data=dislike_data)
            result = await recipe_service.get_by_id(recipe_id=dislike_data.recipe_id, user_id=current_user.id)
            await uow.commit()
        except RecipeNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        except RecipeAlreadyDislikedError as e:
            raise AppHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(e), error_key=e.error_key
            ) from None
        else:
            return result


@router.delete(
    "/{recipe_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Remove recipe from dislikes",
    description="Removes a recipe from user's dislikes. Authentication required.",
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Recipe not disliked",
            "content": json_example_factory(
                {"detail": "Recipe with id 2 is not disliked", "error_key": "recipe_not_disliked"}
            ),
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Recipe not found",
            "content": json_example_factory(
                {"detail": "Recipe with id 999 not found", "error_key": "recipe_not_found"}
            ),
        },
    },
)
async def remove_from_dislikes(
    recipe_id: Annotated[int, Path(title="Recipe ID", ge=1)],
    current_user: CurrentUserDependency,
    disliked_service: FromDishka[DislikedRecipeService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> None:
    async with uow:
        try:
            await disliked_service.remove_from_dislikes(user=current_user, recipe_id=recipe_id)
            await uow.commit()
        except RecipeNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        except RecipeNotDislikedError as e:
            raise AppHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(e), error_key=e.error_key
            ) from None
