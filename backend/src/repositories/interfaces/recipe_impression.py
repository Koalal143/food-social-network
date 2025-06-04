from collections.abc import Sequence
from typing import Protocol

from src.enums.recipe_get_source import RecipeGetSourceEnum
from src.models.recipe_impression import RecipeImpression


class RecipeImpressionRepositoryProtocol(Protocol):
    async def get_all_by_user(
        self,
        user_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[int, Sequence[RecipeImpression]]: ...

    async def get_all_by_recipe(
        self,
        recipe_id: int,
        skip: int = 0,
        limit: int = 10,
    ) -> tuple[int, Sequence[RecipeImpression]]: ...

    async def get_count_by_user(self, user_id: int) -> int: ...

    async def get_count_by_recipe(self, recipe_id: int) -> int: ...

    async def create(
        self, user_id: int, recipe_id: int, source: RecipeGetSourceEnum | None = None
    ) -> RecipeImpression | None: ...

    async def create_for_anonymous(
        self, anonymous_user_id: int, recipe_id: int, source: RecipeGetSourceEnum | None = None
    ) -> RecipeImpression | None: ...

    async def delete(self, user_id: int, recipe_id: int) -> None: ...

    async def merge_impressions(self, anonymous_user_id: int, user_id: int) -> Sequence[RecipeImpression]: ...

    async def exists(self, user_id: int, recipe_id: int) -> bool: ...

    async def exists_recent(
        self, user_id: int, recipe_id: int, source: RecipeGetSourceEnum | None, hours: int = 24
    ) -> bool: ...

    async def exists_recent_for_anonymous(
        self, anonymous_user_id: int, recipe_id: int, source: RecipeGetSourceEnum | None, hours: int = 24
    ) -> bool: ...

    async def get_user_viewed_recipes_count(self, user_id: int) -> int: ...
