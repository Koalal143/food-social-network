from collections.abc import Iterable, Sequence
from typing import Any, cast

from sqlalchemy import Select, delete, func, insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.models.recipe import Recipe
from src.models.recipe_ingredient import RecipeIngredient
from src.models.shopping_list_item import ShoppingListItem
from src.repositories.interfaces.shopping_list_item import ShoppingListItemRepositoryProtocol


class ShoppingListItemRepository(ShoppingListItemRepositoryProtocol):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    @staticmethod
    def _get_shopping_list_item_with_recipe() -> Select:
        return select(ShoppingListItem).options(joinedload(ShoppingListItem.recipe).load_only(Recipe.id, Recipe.title))

    async def get_by_id(self, item_id: int) -> ShoppingListItem | None:
        stmt = self._get_shopping_list_item_with_recipe().where(ShoppingListItem.id == item_id)
        result = await self.session.scalars(stmt)
        return result.first()

    async def get_by_ids(self, item_ids: Iterable[int]) -> Sequence[ShoppingListItem]:
        stmt = self._get_shopping_list_item_with_recipe().where(ShoppingListItem.id.in_(item_ids))
        result = await self.session.scalars(stmt)
        return result.all()

    async def get_all_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 100,
        *,
        only_not_purchased: bool = False,
    ) -> tuple[int, Sequence[ShoppingListItem]]:
        stmt = (
            self._get_shopping_list_item_with_recipe()
            .where(ShoppingListItem.user_id == user_id)
            .order_by(ShoppingListItem.created_at.desc())
            .offset(skip)
            .limit(limit)
        )

        if only_not_purchased:
            stmt = stmt.where(ShoppingListItem.is_purchased.is_(False))

        result = await self.session.scalars(stmt)
        count = await self.get_count(user_id=user_id, only_not_purchased=only_not_purchased)
        return count, result.all()

    async def get_count(self, user_id: int, *, only_not_purchased: bool = False) -> int:
        stmt = select(func.count()).select_from(ShoppingListItem).where(ShoppingListItem.user_id == user_id)

        if only_not_purchased:
            stmt = stmt.where(ShoppingListItem.is_purchased.is_(False))

        return await self.session.scalar(stmt) or 0

    async def create(self, **fields: Any) -> ShoppingListItem | None:
        if "recipe_ingredient_id" in fields:
            recipe_id_by_ingredient = (
                select(RecipeIngredient.recipe_id)
                .where(RecipeIngredient.id == fields["recipe_ingredient_id"])
                .scalar_subquery()
            )
            fields["recipe_id"] = recipe_id_by_ingredient

        stmt = insert(ShoppingListItem).values(**fields).returning(ShoppingListItem.id)
        result = cast("int", await self.session.scalar(stmt))
        return await self.get_by_id(result)

    async def bulk_create(self, user_id: int, items: list[dict[str, Any]]) -> Sequence[ShoppingListItem]:
        if not items:
            return []
        items_without_recipe_ids: list[dict[str, str | int | Select | None]] = []
        items_with_recipe_ids: list[dict[str, str | int | Select | None]] = []
        for item in items:
            recipe_ingredient_id = item.get("recipe_ingredient_id")
            if not recipe_ingredient_id:
                items_without_recipe_ids.append(
                    {
                        "user_id": user_id,
                        "recipe_id": None,
                        "recipe_ingredient_id": None,
                        "is_from_recipe": False,
                        **item,
                    }
                )
                continue

            recipe_id_by_ingredient = select(RecipeIngredient.recipe_id).where(
                RecipeIngredient.id == recipe_ingredient_id
            )
            items_with_recipe_ids.append(
                {"user_id": user_id, "recipe_id": recipe_id_by_ingredient, "is_from_recipe": True, **item}
            )
        result_ids: list[int] = []
        stmt_without_recipe_ids = (
            insert(ShoppingListItem).values(items_without_recipe_ids).returning(ShoppingListItem.id)
        )

        if items_without_recipe_ids:
            result_without_recipe_ids = await self.session.scalars(stmt_without_recipe_ids)
            if result_without_recipe_ids:
                result_ids.extend([*result_without_recipe_ids])
        if items_with_recipe_ids:
            stmt_with_recipe_ids = insert(ShoppingListItem).values(items_with_recipe_ids).returning(ShoppingListItem.id)
            result_with_recipe_ids = await self.session.scalars(stmt_with_recipe_ids)
            if result_with_recipe_ids:
                result_ids.extend([*result_with_recipe_ids])
        return await self.get_by_ids(result_ids)

    async def update(self, user_id: int, item_id: int, **fields: Any) -> ShoppingListItem | None:
        stmt = (
            update(ShoppingListItem)
            .where(ShoppingListItem.user_id == user_id, ShoppingListItem.id == item_id)
            .values(**fields)
            .returning(ShoppingListItem.id)
        )
        result = await self.session.scalar(stmt)
        return await self.get_by_id(result) if result else None

    async def delete_by_id(self, user_id: int, item_id: int) -> None:
        stmt = delete(ShoppingListItem).where(ShoppingListItem.user_id == user_id, ShoppingListItem.id == item_id)
        await self.session.execute(stmt)

    async def delete_by_ids(self, user_id: int, item_ids: Sequence[int]) -> None:
        stmt = delete(ShoppingListItem).where(ShoppingListItem.user_id == user_id, ShoppingListItem.id.in_(item_ids))
        await self.session.execute(stmt)

    async def delete_by_user_id(self, user_id: int) -> None:
        stmt = delete(ShoppingListItem).where(ShoppingListItem.user_id == user_id)
        await self.session.execute(stmt)

    async def toggle_purchased(self, user_id: int, item_id: int) -> ShoppingListItem | None:
        item = await self.get_by_id(item_id)
        if not item:
            return None

        stmt = (
            update(ShoppingListItem)
            .where(ShoppingListItem.user_id == user_id, ShoppingListItem.id == item_id)
            .values(is_purchased=not item.is_purchased)
            .returning(ShoppingListItem.id)
        )

        result = await self.session.scalar(stmt)
        return await self.get_by_id(result) if result else None
