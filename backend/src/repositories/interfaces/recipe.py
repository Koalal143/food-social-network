from collections.abc import Sequence
from typing import Any, Protocol

from src.enums.recipe_sort_field import RecipeSortFieldEnum
from src.models.recipe import Recipe
from src.typings.recipe_with_favorite import RecipeWithExtra


class RecipeRepositoryProtocol(Protocol):
    async def get_by_id(self, recipe_id: int, user_id: int | None = None) -> RecipeWithExtra | None: ...

    async def get_by_ids(self, recipe_ids: Sequence[int]) -> Sequence[Recipe]: ...

    async def get_all(
        self,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
        sort_by: RecipeSortFieldEnum | None = None,
        **filters: Any,
    ) -> tuple[int, Sequence[Recipe]]: ...

    async def get_by_author_username(
        self,
        author_username: str,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
        sort_by: RecipeSortFieldEnum | None = None,
        **filters: Any,
    ) -> tuple[int, Sequence[Recipe]]: ...

    async def get_by_author_id(
        self,
        author_id: int,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
        sort_by: RecipeSortFieldEnum | None = None,
        **filters: Any,
    ) -> tuple[int, Sequence[Recipe]]: ...

    async def create(self, **fields: Any) -> Recipe: ...

    async def update(self, recipe_id: int, **fields: Any) -> Recipe | None: ...

    async def delete_by_id(self, recipe_id: int) -> None: ...

    async def exists(self, recipe_id: int) -> bool: ...

    async def get_by_title(self, title: str) -> Recipe | None: ...

    async def get_by_slug(self, slug: str, user_id: int | None = None) -> RecipeWithExtra | None: ...
