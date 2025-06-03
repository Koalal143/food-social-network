from collections.abc import Sequence
from typing import Any, Protocol

from src.models.recipe_instructions import RecipeInstruction


class RecipeInstructionRepositoryProtocol(Protocol):
    async def get_all_for_recipe(
        self, recipe_id: int, skip: int = 0, limit: int = 100
    ) -> Sequence[RecipeInstruction]: ...

    async def get_instructions_count_by_recipe_id(self, recipe_id: int) -> int: ...

    async def create(self, **fields: dict[str, Any]) -> RecipeInstruction: ...

    async def bulk_create(self, instructions: list[dict[str, Any]]) -> Sequence[RecipeInstruction]: ...

    async def delete_by_recipe_id(self, recipe_id: int) -> None: ...

    async def update(
        self,
        instruction_id: int,
        **fields: dict[str, Any],
    ) -> RecipeInstruction | None: ...

    async def delete_by_id(self, instruction_id: int) -> None: ...

    async def get_by_ids_and_recipe_id(
        self, instruction_ids: list[int], recipe_id: int
    ) -> Sequence[RecipeInstruction]: ...

    async def bulk_update(self, instructions: list[dict[str, Any]]) -> Sequence[RecipeInstruction]: ...

    async def bulk_delete(self, instruction_ids: list[int]) -> None: ...
