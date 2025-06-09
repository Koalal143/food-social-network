from collections.abc import Sequence

from src.exceptions.recipe_ingredient import RecipeIngredientNotFoundError
from src.exceptions.shopping_list_item import ShoppingListItemNotFoundError
from src.repositories.interfaces import (
    RecipeIngredientRepositoryProtocol,
    ShoppingListItemRepositoryProtocol,
)
from src.schemas.shopping_list_item import (
    ShoppingListItemBulkCreate,
    ShoppingListItemCreate,
    ShoppingListItemRead,
    ShoppingListItemUpdate,
)


class ShoppingListItemService:
    def __init__(
        self,
        shopping_list_item_repository: ShoppingListItemRepositoryProtocol,
        recipe_ingredient_repository: RecipeIngredientRepositoryProtocol,
    ) -> None:
        self.shopping_list_item_repository = shopping_list_item_repository
        self.recipe_ingredient_repository = recipe_ingredient_repository

    async def get_all_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        *,
        only_not_purchased: bool = False,
    ) -> tuple[int, Sequence[ShoppingListItemRead]]:
        count, items = await self.shopping_list_item_repository.get_all_by_user(
            user_id=user_id,
            skip=skip,
            limit=limit,
            only_not_purchased=only_not_purchased,
        )

        return count, [ShoppingListItemRead.model_validate(item) for item in items]

    async def get_by_id(self, item_id: int, user_id: int) -> ShoppingListItemRead:
        item = await self.shopping_list_item_repository.get_by_id(item_id)

        if not item or item.user_id != user_id:
            msg = "Shopping list item not found"
            raise ShoppingListItemNotFoundError(msg)

        return ShoppingListItemRead.model_validate(item)

    async def create(self, user_id: int, item_data: ShoppingListItemCreate) -> ShoppingListItemRead:
        item = await self.shopping_list_item_repository.create(user_id=user_id, **item_data.model_dump())
        return ShoppingListItemRead.model_validate(item)

    async def bulk_create(self, user_id: int, bulk_data: ShoppingListItemBulkCreate) -> Sequence[ShoppingListItemRead]:
        if not bulk_data.items:
            return []

        items_data = []
        ingredients_ids_to_check: set[int] = set()

        for item in bulk_data.items:
            item_dict = item.model_dump()
            item_dict["user_id"] = user_id
            items_data.append(item_dict)
            if item.recipe_ingredient_id:
                ingredients_ids_to_check.add(item.recipe_ingredient_id)

        if ingredients_ids_to_check:
            ingredients = await self.recipe_ingredient_repository.get_by_ids(list(ingredients_ids_to_check))
            if len(ingredients) != len(ingredients_ids_to_check):
                msg = "Some of the provided recipe ingredients were not found"
                raise RecipeIngredientNotFoundError(msg)

        items = await self.shopping_list_item_repository.bulk_create(user_id, items_data)
        return [ShoppingListItemRead.model_validate(item) for item in items]

    async def update(self, item_id: int, user_id: int, item_data: ShoppingListItemUpdate) -> ShoppingListItemRead:
        item = await self.shopping_list_item_repository.get_by_id(item_id)

        if not item:
            msg = "Shopping list item not found"
            raise ShoppingListItemNotFoundError(msg)

        update_data = {k: v for k, v in item_data.model_dump().items() if v is not None}

        if update_data:
            item = await self.shopping_list_item_repository.update(user_id, item_id, **update_data)

        return ShoppingListItemRead.model_validate(item)

    async def delete(self, item_id: int, user_id: int) -> None:
        item = await self.shopping_list_item_repository.get_by_id(item_id)

        if not item:
            msg = "Shopping list item not found"
            raise ShoppingListItemNotFoundError(msg)

        await self.shopping_list_item_repository.delete_by_id(user_id, item_id)

    async def delete_by_ids(self, user_id: int, item_ids: Sequence[int]) -> None:
        await self.shopping_list_item_repository.delete_by_ids(user_id, item_ids)

    async def toggle_purchased(self, item_id: int, user_id: int) -> ShoppingListItemRead:
        item = await self.shopping_list_item_repository.get_by_id(item_id)

        if not item:
            msg = "Shopping list item not found"
            raise ShoppingListItemNotFoundError(msg)

        updated_item = await self.shopping_list_item_repository.toggle_purchased(user_id, item_id)
        return ShoppingListItemRead.model_validate(updated_item)

    async def clear_user_shopping_list(self, user_id: int) -> None:
        await self.shopping_list_item_repository.delete_by_user_id(user_id)
