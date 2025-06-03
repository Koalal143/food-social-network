from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Query, Response, status

from src.core.security import (
    AnonymousUserOrNoneDependency,
    CurrentUserOrNoneDependency,
)
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions import AppHTTPException
from src.exceptions.recipe_search import UserIdentityNotProvidedError
from src.schemas.recipe import RecipeReadShort, RecipeSearchQuery
from src.schemas.search_query import SearchQueryCreate, SearchQueryRead
from src.services.search import SearchService
from src.utils.examples_factory import json_example_factory

router = APIRouter(route_class=DishkaRoute, prefix="/recipes/search", tags=["Recipe Search"])


@router.get(
    "",
    summary="Search recipes",
    description="Search recipes by different criteria using Elasticsearch",
    responses={
        status.HTTP_200_OK: {
            "headers": {"X-Total-Count": {"description": "Total number of found recipes", "type": "integer"}}
        }
    },
)
async def search_recipes(
    query: Annotated[RecipeSearchQuery, Query()],
    search_service: FromDishka[SearchService],
    response: Response,
    current_user: CurrentUserOrNoneDependency,
    anonymous_user: AnonymousUserOrNoneDependency,
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> list[RecipeReadShort]:
    user_id = current_user.id if current_user else None
    anonymous_user_id = anonymous_user.id if anonymous_user else None
    async with uow:
        total, recipes = await search_service.search(
            params=query,
            user_id=user_id,
            anonymous_user_id=anonymous_user_id,
        )
        response.headers["X-Total-Count"] = str(total)
        await uow.commit()
    return recipes


@router.get(
    "/history",
    summary="Get search history",
    description="Returns user's search history. Works for both authenticated and anonymous users.",
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Successful response with search history",
            "content": json_example_factory(
                {
                    "detail": "Either user_id or anonymous_user_id must be provided",
                    "error_key": "user_id_or_anonymous_user_id_not_provided",
                }
            ),
        }
    },
)
async def get_search_history(
    search_service: FromDishka[SearchService],
    current_user: CurrentUserOrNoneDependency,
    anonymous_user: AnonymousUserOrNoneDependency,
    limit: Annotated[int, Query(ge=1, le=50, description="Maximum number of search queries to return")] = 10,
    offset: Annotated[int, Query(ge=0, description="Number of search queries to skip for pagination")] = 0,
) -> list[SearchQueryRead]:
    user_id = current_user.id if current_user else None
    anonymous_user_id = anonymous_user.id if anonymous_user else None
    try:
        return await search_service.get_search_history(
            user_id=user_id, anonymous_user_id=anonymous_user_id, limit=limit, offset=offset
        )
    except UserIdentityNotProvidedError as e:
        raise AppHTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e), error_key=e.error_key) from None


@router.post(
    "/history",
    summary="Save search query to history",
    description="Saves a search query to user's search history. Works for both authenticated and anonymous users.",
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_400_BAD_REQUEST: {
            "description": "Bad request - user identity not provided",
            "content": json_example_factory(
                {
                    "detail": "Either user_id or anonymous_user_id must be provided",
                    "error_key": "user_id_or_anonymous_user_id_not_provided",
                }
            ),
        }
    },
)
async def save_search_query(
    query_data: SearchQueryCreate,
    search_service: FromDishka[SearchService],
    current_user: CurrentUserOrNoneDependency,
    anonymous_user: AnonymousUserOrNoneDependency,
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> SearchQueryRead:
    user_id = current_user.id if current_user else None
    anonymous_user_id = anonymous_user.id if anonymous_user else None

    try:
        async with uow:
            search_query = await search_service.save_search_query(
                query_text=query_data.query,
                user_id=user_id,
                anonymous_user_id=anonymous_user_id,
            )
            await uow.commit()
            return search_query
    except UserIdentityNotProvidedError as e:
        raise AppHTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e), error_key=e.error_key) from None
