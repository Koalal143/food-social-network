from __future__ import annotations

from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from src.schemas.recipe import RecipeSearchQuery


class RecipeSearchRepositoryProtocol(Protocol):
    async def search_recipes(self, params: RecipeSearchQuery) -> tuple[int, list[int]]: ...

    async def index_recipe(self, recipe_data: dict) -> None: ...

    async def delete_recipe(self, recipe_id: int) -> None: ...
