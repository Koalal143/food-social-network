from typing import Protocol

from src.models.search_query import SearchQuery
from src.schemas.recipe import RecipeSearchQuery


class RecipeSearchRepositoryProtocol(Protocol):
    async def search_recipes(self, params: RecipeSearchQuery) -> tuple[int, list[int]]: ...

    async def index_recipe(self, recipe_data: dict) -> None: ...

    async def delete_recipe(self, recipe_id: int) -> None: ...

    async def save_search_query(
        self, query_text: str, user_id: int | None, anonymous_user_id: int | None
    ) -> SearchQuery: ...

    async def get_user_search_history(self, user_id: int, limit: int = 10, offset: int = 0) -> list[SearchQuery]: ...

    async def get_anonymous_search_history(
        self, anonymous_user_id: int, limit: int = 10, offset: int = 0
    ) -> list[SearchQuery]: ...
