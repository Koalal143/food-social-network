from typing import Annotated

from fastapi import APIRouter, Path, Query, Response, status

from src.core.security import CurrentUserDependency
from src.dependencies import S3StorageDependency, UnitOfWorkDependency
from src.exceptions import AppHTTPException, RecipeNotFoundError
from src.exceptions.disliked_recipe import RecipeAlreadyDislikedError, RecipeNotDislikedError
from src.schemas.disliked_recipe import DislikedRecipeCreate
from src.schemas.recipe import RecipeReadFull, RecipeReadShort
from src.services.disliked_recipe import DislikedRecipeService
from src.services.recipe import RecipeService
from src.utils.examples_factory import json_example_factory

router = APIRouter(prefix="/disliked-recipes", tags=["Disliked Recipes"])


_disliked_recipe_example = {
    "id": 1,
    "user_id": 1,
    "created_at": "2025-05-10T12:00:00Z",
    "updated_at": "2025-05-10T12:00:00Z",
    "recipe": {
        "id": 2,
        "title": "Паста Карбонара",
        "short_description": "Классическая итальянская паста с беконом и сыром",
        "image_url": "https://example.com/images/recipes/2/main.png",
        "difficulty": "MEDIUM",
        "cook_time_minutes": 30,
    },
}


@router.get(
    "",
    summary="Get user's disliked recipes",
    description="Returns a list of user's disliked recipes with pagination. "
    "The total count of recipes is returned in the X-Total-Count header. "
    "Authentication required.",
)
async def get_disliked_recipes(  # noqa: PLR0913
    current_user: CurrentUserDependency,
    uow: UnitOfWorkDependency,
    s3_storage: S3StorageDependency,
    response: Response,
    offset: Annotated[int, Query(ge=0, description="Смещение для пагинации")] = 0,
    limit: Annotated[int, Query(ge=1, le=50, description="Количество рецептов на странице")] = 10,
) -> list[RecipeReadShort]:
    disliked_service = DislikedRecipeService(uow=uow, s3_storage=s3_storage)
    total, dislikes = await disliked_service.get_user_dislikes(user_id=current_user.id, skip=offset, limit=limit)
    response.headers["X-Total-Count"] = str(total)
    return dislikes


@router.post(
    "",
    status_code=status.HTTP_200_OK,
    summary="Add recipe to dislikes",
    description="Adds a recipe to user's dislikes. If the recipe is already in favorites, "
    "it will be automatically removed from there. Authentication required.",
    responses={
        status.HTTP_200_OK: {
            "description": "Recipe added to dislikes successfully",
            "content": json_example_factory(_disliked_recipe_example),
        },
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
    uow: UnitOfWorkDependency,
    s3_storage: S3StorageDependency,
) -> RecipeReadFull:
    disliked_service = DislikedRecipeService(uow=uow, s3_storage=s3_storage)
    recipe_service = RecipeService(uow=uow, s3_storage=s3_storage)
    try:
        await disliked_service.add_to_dislikes(user=current_user, dislike_data=dislike_data)
        return await recipe_service.get_by_id(recipe_id=dislike_data.recipe_id, user_id=current_user.id)
    except RecipeNotFoundError as e:
        raise AppHTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key) from None
    except RecipeAlreadyDislikedError as e:
        raise AppHTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e), error_key=e.error_key) from None


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
    uow: UnitOfWorkDependency,
    s3_storage: S3StorageDependency,
) -> None:
    disliked_service = DislikedRecipeService(uow=uow, s3_storage=s3_storage)
    try:
        await disliked_service.remove_from_dislikes(user=current_user, recipe_id=recipe_id)
    except RecipeNotFoundError as e:
        raise AppHTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key) from None
    except RecipeNotDislikedError as e:
        raise AppHTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e), error_key=e.error_key) from None
