from collections.abc import Sequence
from typing import Protocol

from src.models.favorite_recipes import FavoriteRecipe


class FavoriteRecipeRepositoryProtocol(Protocol):
    async def get_all_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[int, Sequence[FavoriteRecipe]]: ...

    async def get_count(self, user_id: int) -> int: ...

    async def create(self, user_id: int, recipe_id: int) -> FavoriteRecipe: ...

    async def delete(self, user_id: int, recipe_id: int) -> None: ...

    async def exists(self, user_id: int, recipe_id: int) -> bool: ...
