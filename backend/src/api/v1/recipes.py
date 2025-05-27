from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Path, Query, Response, status
from pydantic import PositiveInt

from src.core.security import (
    AnonymousUserOrNoneDependency,
    ConsentDependency,
    CurrentUserDependency,
    CurrentUserOrNoneDependency,
)
from src.db.uow import SQLAlchemyUnitOfWork
from src.enums.recipe_get_source import RecipeGetSourceEnum
from src.exceptions import (
    AppHTTPException,
    AttachInstructionStepError,
    NoRecipeImageError,
    NoRecipeInstructionsError,
    RecipeNotFoundError,
    RecipeOwnershipError,
)
from src.exceptions.recipe_impression import RecipeImpressionAlreadyExistsError
from src.schemas.direct_upload import DirectUpload
from src.schemas.recipe import (
    MAX_RECIPE_INSTRUCTIONS_COUNT,
    RecipeCreate,
    RecipeInstructionsUploadUrls,
    RecipeRead,
    RecipeReadFull,
    RecipeReadShort,
    RecipeSearchQuery,
    RecipeUpdate,
)
from src.services.recipe import RecipeService
from src.services.recipe_impression import RecipeImpressionService
from src.services.recipe_instructions import RecipeInstructionsService
from src.utils.examples_factory import json_example_factory, json_examples_factory

router = APIRouter(route_class=DishkaRoute, prefix="/recipes", tags=["Recipes"])


_recipe_example = {  # TODO: remove hard-coded example
    "id": 1,
    "title": "Паста Карбонара",
    "slug": "pasta-karbonara-1",
    "short_description": "Классическая итальянская паста с беконом и сыром",
    "image_url": "https://example.com/images/recipes/1/main.png",
    "difficulty": "MEDIUM",
    "cook_time_minutes": 30,
    "is_published": True,
    "created_at": "2025-05-10T12:00:00Z",
    "updated_at": "2025-05-10T14:30:00Z",
    "ingredients": [
        {"name": "Спагетти", "quantity": "200 г"},
        {"name": "Бекон", "quantity": "150 г"},
        {"name": "Яйца", "quantity": "2 шт"},
    ],
    "instructions": [
        {"step_number": 1, "description": "Отварите спагетти", "image_url": None},
        {
            "step_number": 2,
            "description": "Обжарьте бекон",
            "image_url": "https://example.com/images/recipes/1/instructions/2/step.png",
        },
    ],
    "tags": [{"name": "Итальянская кухня"}, {"name": "Ужин"}],
}

_recipe_full_example = {
    **_recipe_example,
    "author": {
        "id": 1,
        "username": "john_doe",
        "profile": {"avatar_url": "https://example.com/images/avatars/1.jpg"},
    },
}


@router.get(
    "/search",
    summary="Search recipes",
    description="Search recipes by different criteria using Elasticsearch",
    responses={
        200: {"headers": {"X-Total-Count": {"description": "Total number of found recipes", "type": "integer"}}}
    },
)
async def search_recipes(
    query: Annotated[RecipeSearchQuery, Query()],
    recipe_service: FromDishka[RecipeService],
    response: Response,
) -> list[RecipeReadShort]:
    total, recipes = await recipe_service.search(query)
    response.headers["X-Total-Count"] = str(total)
    return recipes


@router.get(
    "/{recipe_id}",
    summary="Get recipe by ID",
    description="Returns detailed information about a recipe, including ingredients, instructions, and tags.",
    responses={
        status.HTTP_200_OK: {
            "description": "Successful response with recipe details",
            "content": json_example_factory(_recipe_full_example),
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Recipe not found",
            "content": json_example_factory(
                {"detail": "Recipe with id 999 not found", "error_key": "recipe_not_found"}
            ),
        },
    },
)
async def get_recipe(
    recipe_id: Annotated[int, Path(title="Recipe ID", ge=1)],
    recipe_service: FromDishka[RecipeService],
    recipe_impression: FromDishka[RecipeImpressionService],
    anonymous_user: AnonymousUserOrNoneDependency,
    is_allowed_analytics: ConsentDependency,
    current_user: CurrentUserOrNoneDependency,
    uow: FromDishka[SQLAlchemyUnitOfWork],
    source: Annotated[RecipeGetSourceEnum | None, Query(description="Source of the request")] = None,
) -> RecipeReadFull:
    try:
        user_id = current_user.id if current_user else None
        recipe = await recipe_service.get_by_id(recipe_id=recipe_id, user_id=user_id)
    except RecipeNotFoundError as e:
        raise AppHTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key) from None
    else:
        async with uow:
            try:
                if current_user:
                    await recipe_impression.record_impression(recipe_id=recipe_id, source=source)
                elif anonymous_user and is_allowed_analytics:
                    await recipe_impression.record_impression_for_anonymous(
                        recipe_id=recipe_id,
                        anonymous_user_id=anonymous_user.id,
                        source=source,
                    )
                await uow.commit()
            except RecipeImpressionAlreadyExistsError:
                pass
        return recipe


@router.get(
    "/by-slug/{slug}",
    summary="Get recipe by slug",
    description="Returns detailed information about a recipe using its URL-friendly slug identifier.",
    responses={
        status.HTTP_200_OK: {
            "description": "Successful response with recipe details",
            "content": json_example_factory({**_recipe_full_example, "slug": "pasta-karbonara-1"}),
        },
        status.HTTP_404_NOT_FOUND: {
            "description": "Recipe not found",
            "content": json_example_factory(
                {"detail": "Recipe with slug 'non-existent-recipe-999' not found", "error_key": "recipe_not_found"}
            ),
        },
    },
)
async def get_recipe_by_slug(
    slug: Annotated[str, Path(title="Recipe slug", description="URL-friendly recipe identifier")],
    recipe_service: FromDishka[RecipeService],
    current_user: CurrentUserOrNoneDependency,
    uow: FromDishka[SQLAlchemyUnitOfWork],
    recipe_impression: FromDishka[RecipeImpressionService],
    anonymous_user: AnonymousUserOrNoneDependency,
    is_allowed_analytics: ConsentDependency,
    source: Annotated[RecipeGetSourceEnum | None, Query(description="Source of the request")] = None,
) -> RecipeReadFull:
    try:
        user_id = current_user.id if current_user else None
        recipe = await recipe_service.get_by_slug(slug=slug, user_id=user_id)
    except RecipeNotFoundError as e:
        raise AppHTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key) from None
    else:
        async with uow:
            try:
                if current_user:
                    await recipe_impression.record_impression(recipe_id=recipe.id, source=source)
                elif anonymous_user and is_allowed_analytics:
                    await recipe_impression.record_impression_for_anonymous(
                        recipe_id=recipe.id,
                        anonymous_user_id=anonymous_user.id,
                        source=source,
                    )
                await uow.commit()
            except RecipeImpressionAlreadyExistsError:
                pass
        return recipe


@router.get(
    "/",
    summary="Get list of recipes",
    description=(
        "Returns a list of recipes with pagination. The total count of recipes is returned in the X-Total-Count header."
    ),
)
async def get_recipes(
    recipe_service: FromDishka[RecipeService],
    response: Response,
    current_user: CurrentUserOrNoneDependency,
    offset: Annotated[int, Query(ge=0, description="Смещение для пагинации")] = 0,
    limit: Annotated[int, Query(ge=1, le=50, description="Количество рецептов на странице")] = 10,
) -> list[RecipeReadShort]:
    total, recipes = await recipe_service.get_all(
        user_id=current_user.id if current_user else None, skip=offset, limit=limit
    )
    response.headers["X-Total-Count"] = str(total)
    return list(recipes)


@router.post(
    "/",
    status_code=status.HTTP_201_CREATED,
    summary="Create new recipe",
    description="Creates a new recipe with ingredients, instructions, and tags. Authentication required.",
    responses={
        status.HTTP_201_CREATED: {
            "description": "Recipe created successfully",
            "content": json_example_factory(_recipe_example),
        },
        status.HTTP_401_UNAUTHORIZED: {
            "description": "Unauthorized",
            "content": json_example_factory({"detail": "Not authenticated", "error_key": "not_authenticated"}),
        },
    },
)
async def create_recipe(
    recipe_data: RecipeCreate,
    current_user: CurrentUserDependency,
    recipe_service: FromDishka[RecipeService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> RecipeRead:
    async with uow:
        result = await recipe_service.create(user=current_user, recipe_create=recipe_data)
        await uow.commit()
        return result


@router.patch(
    "/{recipe_id}",
    summary="Update recipe",
    description="Updates an existing recipe. Can update main data and related entities. Authentication required. "
    "Only the owner of the recipe or a superuser can update it.",
    responses={
        status.HTTP_200_OK: {
            "description": "Recipe updated successfully",
            "content": json_example_factory(_recipe_full_example),
        },
        status.HTTP_400_BAD_REQUEST: {
            "description": "Can't publish recipe without instructions or image",
            "content": json_examples_factory(
                {
                    "No instructions": {
                        "value": {
                            "detail": "Recipe can not be published without instructions",
                            "error_key": "instructions_required_to_publish",
                        }
                    },
                    "No image": {
                        "value": {
                            "detail": "Recipe can not be published without image",
                            "error_key": "image_required_to_publish",
                        }
                    },
                }
            ),
        },
        status.HTTP_403_FORBIDDEN: {
            "description": "Forbidden - Recipe belongs to another user",
            "content": json_example_factory(
                {"detail": "Recipe with id 1 belongs to other user", "error_key": "recipe_belongs_to_other_user"}
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
async def update_recipe(
    recipe_id: Annotated[int, Path(title="Recipe ID", ge=1)],
    recipe_data: RecipeUpdate,
    current_user: CurrentUserDependency,
    recipe_service: FromDishka[RecipeService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> RecipeReadFull:
    async with uow:
        try:
            result = await recipe_service.update(user=current_user, recipe_id=recipe_id, recipe_update=recipe_data)
            await uow.commit()
        except RecipeNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        except RecipeOwnershipError as e:
            raise AppHTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail=str(e), error_key=e.error_key
            ) from None
        except (NoRecipeInstructionsError, NoRecipeImageError) as e:
            raise AppHTTPException(
                status_code=status.HTTP_400_BAD_REQUEST, detail=str(e), error_key=e.error_key
            ) from None
        else:
            return result


@router.delete(
    "/{recipe_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Delete recipe",
    description="Deletes a recipe and all related data (ingredients, instructions, tags). "
    "Authentication required. Only the owner of the recipe or a superuser can delete it.",
    responses={
        status.HTTP_403_FORBIDDEN: {
            "description": "Forbidden - Recipe belongs to another user",
            "content": json_example_factory(
                {"detail": "Recipe with id 1 belongs to other user", "error_key": "recipe_belongs_to_other_user"}
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
async def delete_recipe(
    recipe_id: Annotated[int, Path(title="Recipe ID", ge=1)],
    current_user: CurrentUserDependency,
    recipe_service: FromDishka[RecipeService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> None:
    async with uow:
        try:
            await recipe_service.delete(user=current_user, recipe_id=recipe_id)
            await uow.commit()
        except RecipeNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        except RecipeOwnershipError as e:
            raise AppHTTPException(
                status_code=status.HTTP_403_FORBIDDEN, detail=str(e), error_key=e.error_key
            ) from None


@router.get(
    "/{recipe_id}/image/upload-url",
    summary="Get URL for uploading recipe image",
    description="Returns a pre-signed URL for uploading a recipe image. "
    "Authentication required. Only the owner of the recipe or a superuser can get the URL.",
    responses={
        status.HTTP_403_FORBIDDEN: {
            "description": "Forbidden - Recipe belongs to another user",
            "content": json_example_factory(
                {"detail": "Recipe with id 1 belongs to other user", "error_key": "recipe_belongs_to_other_user"}
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
async def get_upload_image_url(
    recipe_id: Annotated[int, Path(title="Recipe ID", ge=1)],
    current_user: CurrentUserDependency,
    recipe_service: FromDishka[RecipeService],
) -> DirectUpload:
    try:
        return await recipe_service.get_image_upload_url(user=current_user, recipe_id=recipe_id)
    except RecipeNotFoundError as e:
        raise AppHTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key) from None
    except RecipeOwnershipError as e:
        raise AppHTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=str(e), error_key=e.error_key) from None


@router.get(
    "/{recipe_id}/instructions/upload-urls",
    summary="Get URLs for uploading instruction images",
    description="Returns pre-signed URLs for uploading images for recipe instruction steps. Authentication required.",
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Invalid step numbers",
            "content": json_examples_factory(
                {
                    "Step greater than maximum": {
                        "value": {
                            "detail": (
                                "Can't attach image to one of steps, because "
                                f"it's greater than {MAX_RECIPE_INSTRUCTIONS_COUNT}"
                            ),
                            "error_key": "attach_instruction_step",
                        }
                    },
                    "Too many steps": {
                        "value": {
                            "detail": f"Can't attach image to more steps than {MAX_RECIPE_INSTRUCTIONS_COUNT}",
                            "error_key": "attach_instruction_step",
                        }
                    },
                    "Duplicate steps": {
                        "value": {
                            "detail": "Can't attach image to duplicate steps",
                            "error_key": "attach_instruction_step",
                        }
                    },
                }
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
async def get_upload_instructions_urls(
    recipe_id: Annotated[int, Path(title="Recipe ID", ge=1)],
    steps: Annotated[list[PositiveInt], Query(description="Номера шагов инструкций для загрузки изображений")],
    instructions_service: FromDishka[RecipeInstructionsService],
    _current_user: CurrentUserDependency,  # Ensure user is authenticated
) -> list[RecipeInstructionsUploadUrls]:
    try:
        return await instructions_service.generate_instructions_post_urls(recipe_id, steps)
    except AttachInstructionStepError as e:
        raise AppHTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e),
            error_key=e.error_key,
        ) from None
