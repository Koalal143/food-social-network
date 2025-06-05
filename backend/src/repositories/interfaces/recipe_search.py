from __future__ import annotations

from typing import TYPE_CHECKING, Protocol

if TYPE_CHECKING:
    from collections.abc import Sequence

    from src.models.search_query import SearchQuery
    from src.schemas.recipe import RecipeSearchQuery


class RecipeSearchRepositoryProtocol(Protocol):
    async def search_recipes(self, params: RecipeSearchQuery) -> tuple[int, list[int]]: ...

    async def index_recipe(self, recipe_data: dict) -> None: ...

    async def delete_recipe(self, recipe_id: int) -> None: ...

    async def save_search_query(
        self, query_text: str, user_id: int | None, anonymous_user_id: int | None
    ) -> SearchQuery | None: ...

    async def get_user_search_history(
        self, user_id: int, limit: int = 10, offset: int = 0
    ) -> Sequence[SearchQuery]: ...

    async def get_anonymous_search_history(
        self, anonymous_user_id: int, limit: int = 10, offset: int = 0
    ) -> Sequence[SearchQuery]: ...

    async def merge_search_queries(self, anonymous_user_id: int, user_id: int) -> None: ...
