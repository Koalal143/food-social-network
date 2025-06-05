from collections.abc import Sequence
from typing import Any

from sqlalchemy import delete, func, insert, select, update
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.recipe_instructions import RecipeInstruction
from src.repositories.interfaces.recipe_instruction import RecipeInstructionRepositoryProtocol


class RecipeInstructionRepository(RecipeInstructionRepositoryProtocol):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_all_for_recipe(self, recipe_id: int, skip: int = 0, limit: int = 100) -> Sequence[RecipeInstruction]:
        stmt = (
            select(RecipeInstruction)
            .where(RecipeInstruction.recipe_id == recipe_id)
            .order_by(RecipeInstruction.step_number)
            .offset(skip)
            .limit(limit)
        )
        result = await self.session.scalars(stmt)
        return result.all()

    async def get_instructions_count_by_recipe_id(self, recipe_id: int) -> int:
        stmt = select(func.count()).where(RecipeInstruction.recipe_id == recipe_id)
        result = await self.session.scalar(stmt)
        return result or 0

    async def create(
        self, recipe_id: int, step_number: int, description: str, image_path: str | None = None
    ) -> RecipeInstruction:
        db_instruction = RecipeInstruction(
            recipe_id=recipe_id,
            step_number=step_number,
            description=description,
            image_path=image_path,
        )
        self.session.add(db_instruction)
        await self.session.flush()
        await self.session.refresh(db_instruction)
        return db_instruction

    async def bulk_create(self, instructions: list[dict[str, Any]]) -> Sequence[RecipeInstruction]:
        stmt = insert(RecipeInstruction).values(instructions).returning(RecipeInstruction)
        result = await self.session.scalars(stmt)
        await self.session.flush()
        return result.all()

    async def delete_by_recipe_id(self, recipe_id: int) -> None:
        stmt = delete(RecipeInstruction).where(RecipeInstruction.recipe_id == recipe_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def update(
        self,
        instruction_id: int,
        **fields: Any,
    ) -> RecipeInstruction | None:
        stmt = (
            update(RecipeInstruction)
            .where(RecipeInstruction.id == instruction_id)
            .values(**fields)
            .returning(RecipeInstruction)
        )
        result = await self.session.scalars(stmt)
        await self.session.flush()
        return result.first()

    async def delete_by_id(self, instruction_id: int) -> None:
        stmt = delete(RecipeInstruction).where(RecipeInstruction.id == instruction_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def get_by_ids_and_recipe_id(self, instruction_ids: list[int], recipe_id: int) -> Sequence[RecipeInstruction]:
        stmt = select(RecipeInstruction).where(
            RecipeInstruction.id.in_(instruction_ids), RecipeInstruction.recipe_id == recipe_id
        )
        result = await self.session.scalars(stmt)
        return result.all()

    async def bulk_update(self, instructions: list[dict[str, Any]]) -> Sequence[RecipeInstruction]:
        updated_instructions = []
        for instruction_data in instructions:
            instruction_id = instruction_data.pop("id")
            stmt = (
                update(RecipeInstruction)
                .where(RecipeInstruction.id == instruction_id)
                .values(**instruction_data)
                .returning(RecipeInstruction)
            )
            result = await self.session.scalars(stmt)
            updated_instruction = result.first()
            if updated_instruction:
                updated_instructions.append(updated_instruction)

        await self.session.flush()
        return updated_instructions

    async def bulk_delete(self, instruction_ids: list[int]) -> None:
        if instruction_ids:
            stmt = delete(RecipeInstruction).where(RecipeInstruction.id.in_(instruction_ids))
            await self.session.execute(stmt)
            await self.session.flush()
