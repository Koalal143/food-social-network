from typing import Annotated

from dishka.integrations.fastapi import DishkaRoute, FromDishka
from fastapi import APIRouter, Query, Response, status

from src.core.security import CurrentUserDependency
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.http import AppHTTPException
from src.exceptions.recipe_ingredient import RecipeIngredientNotFoundError
from src.exceptions.shopping_list_item import ShoppingListItemNotFoundError
from src.schemas.shopping_list_item import (
    ShoppingListItemBulkCreate,
    ShoppingListItemCreate,
    ShoppingListItemRead,
    ShoppingListItemUpdate,
)
from src.services.shopping_list_item import ShoppingListItemService

router = APIRouter(route_class=DishkaRoute, prefix="/shopping-list", tags=["Shopping List"])


@router.get("", summary="Get user shopping list")
async def get_shopping_list(
    current_user: CurrentUserDependency,
    service: FromDishka[ShoppingListItemService],
    response: Response,
    skip: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 20,
    *,
    only_not_purchased: bool = False,
) -> list[ShoppingListItemRead]:
    count, items = await service.get_all_by_user(
        user_id=current_user.id,
        skip=skip,
        limit=limit,
        only_not_purchased=only_not_purchased,
    )
    response.headers["X-Total-Count"] = str(count)
    return items


@router.post("", summary="Create shopping list item", status_code=status.HTTP_201_CREATED)
async def create_shopping_list_item(
    item_data: ShoppingListItemCreate,
    current_user: CurrentUserDependency,
    service: FromDishka[ShoppingListItemService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> ShoppingListItemRead:
    async with uow:
        result = await service.create(user_id=current_user.id, item_data=item_data)
        await uow.commit()
        return result


@router.post("/bulk", summary="Bulk create shopping list items", status_code=status.HTTP_201_CREATED)
async def bulk_create_shopping_list_items(
    bulk_data: ShoppingListItemBulkCreate,
    current_user: CurrentUserDependency,
    service: FromDishka[ShoppingListItemService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> list[ShoppingListItemRead]:
    async with uow:
        try:
            result = await service.bulk_create(user_id=current_user.id, bulk_data=bulk_data)
        except RecipeIngredientNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND, detail=str(e), error_key=e.error_key
            ) from None
        else:
            await uow.commit()
            return result


@router.get("/{item_id}", summary="Get shopping list item")
async def get_shopping_list_item(
    item_id: int,
    current_user: CurrentUserDependency,
    service: FromDishka[ShoppingListItemService],
) -> ShoppingListItemRead:
    try:
        return await service.get_by_id(item_id=item_id, user_id=current_user.id)
    except ShoppingListItemNotFoundError as e:
        raise AppHTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=e.message,
            error_key=e.error_key,
        ) from None


@router.patch("/{item_id}", summary="Update shopping list item")
async def update_shopping_list_item(
    item_id: int,
    item_data: ShoppingListItemUpdate,
    current_user: CurrentUserDependency,
    service: FromDishka[ShoppingListItemService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> ShoppingListItemRead:
    async with uow:
        try:
            result = await service.update(item_id=item_id, user_id=current_user.id, item_data=item_data)
        except ShoppingListItemNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=e.message,
                error_key=e.error_key,
            ) from None
        else:
            await uow.commit()
            return result


@router.post("/{item_id}/toggle", summary="Toggle shopping list item purchased status")
async def toggle_shopping_list_item(
    item_id: int,
    current_user: CurrentUserDependency,
    service: FromDishka[ShoppingListItemService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> ShoppingListItemRead:
    async with uow:
        try:
            result = await service.toggle_purchased(item_id=item_id, user_id=current_user.id)
        except ShoppingListItemNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=e.message,
                error_key=e.error_key,
            ) from None
        else:
            await uow.commit()
            return result


@router.delete("/{item_id}", summary="Delete shopping list item", status_code=status.HTTP_204_NO_CONTENT)
async def delete_shopping_list_item(
    item_id: int,
    current_user: CurrentUserDependency,
    service: FromDishka[ShoppingListItemService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> None:
    async with uow:
        try:
            await service.delete(item_id=item_id, user_id=current_user.id)
        except ShoppingListItemNotFoundError as e:
            raise AppHTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=e.message,
                error_key=e.error_key,
            ) from None
        else:
            await uow.commit()


@router.delete("/bulk", summary="Bulk delete shopping list items", status_code=status.HTTP_204_NO_CONTENT)
async def bulk_delete_shopping_list_items(
    item_ids: list[int],
    current_user: CurrentUserDependency,
    service: FromDishka[ShoppingListItemService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> None:
    async with uow:
        await service.delete_by_ids(user_id=current_user.id, item_ids=item_ids)
        await uow.commit()


@router.delete("", summary="Clear shopping list", status_code=status.HTTP_204_NO_CONTENT)
async def clear_shopping_list(
    current_user: CurrentUserDependency,
    service: FromDishka[ShoppingListItemService],
    uow: FromDishka[SQLAlchemyUnitOfWork],
) -> None:
    async with uow:
        await service.clear_user_shopping_list(user_id=current_user.id)
        await uow.commit()
