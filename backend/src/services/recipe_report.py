from src.enums.report_status import ReportStatusEnum
from src.exceptions.recipe import RecipeNotFoundError
from src.exceptions.recipe_report import (
    CannotReportOwnRecipeError,
    RecipeReportAlreadyExistsError,
    RecipeReportNotFoundError,
)
from src.models.user import User
from src.repositories.interfaces import RecipeReportRepositoryProtocol, RecipeRepositoryProtocol
from src.schemas.recipe_report import RecipeReportRead, RecipeReportStats


class RecipeReportService:
    def __init__(
        self,
        recipe_report_repository: RecipeReportRepositoryProtocol,
        recipe_repository: RecipeRepositoryProtocol,
    ) -> None:
        self.recipe_report_repository = recipe_report_repository
        self.recipe_repository = recipe_repository

    async def create_report(
        self, user: User, recipe_id: int, reason: str, description: str | None = None
    ) -> RecipeReportRead:
        recipe = await self.recipe_repository.get_by_id(recipe_id)
        if not recipe:
            msg = f"Recipe with id {recipe_id} not found"
            raise RecipeNotFoundError(msg)

        if recipe.author_id == user.id:
            msg = "Cannot report your own recipe"
            raise CannotReportOwnRecipeError(msg)

        existing_report = await self.recipe_report_repository.get_by_recipe_and_reporter(recipe_id, user.id)
        if existing_report:
            msg = f"You have already reported recipe with id {recipe_id}"
            raise RecipeReportAlreadyExistsError(msg)

        report = await self.recipe_report_repository.create(
            recipe_id=recipe_id,
            reporter_user_id=user.id,
            reason=reason,
            description=description,
        )

        report_with_relations = await self.recipe_report_repository.get_with_relations(report.id)
        return RecipeReportRead.model_validate(report_with_relations, from_attributes=True)

    async def get_user_reports(self, user: User, limit: int, offset: int) -> tuple[int, list[RecipeReportRead]]:
        count = await self.recipe_report_repository.get_count_by_reporter(user.id)
        reports = await self.recipe_report_repository.get_by_reporter(user.id, limit, offset)

        report_schemas = [RecipeReportRead.model_validate(report, from_attributes=True) for report in reports]

        return count, report_schemas

    async def get_all_reports(
        self, limit: int, offset: int, status: ReportStatusEnum | None = None
    ) -> tuple[int, list[RecipeReportRead]]:
        count = await self.recipe_report_repository.get_count(status)
        reports = await self.recipe_report_repository.get_all(limit, offset, status)

        report_schemas = [RecipeReportRead.model_validate(report, from_attributes=True) for report in reports]

        return count, report_schemas

    async def get_report_by_id(self, report_id: int) -> RecipeReportRead:
        report = await self.recipe_report_repository.get_with_relations(report_id)
        if not report:
            msg = f"Recipe report with id {report_id} not found"
            raise RecipeReportNotFoundError(msg)

        return RecipeReportRead.model_validate(report, from_attributes=True)

    async def update_report_status(
        self,
        admin_user: User,
        report_id: int,
        status: ReportStatusEnum | None = None,
        admin_notes: str | None = None,
    ) -> RecipeReportRead:
        report = await self.recipe_report_repository.get(report_id)
        if not report:
            msg = f"Recipe report with id {report_id} not found"
            raise RecipeReportNotFoundError(msg)

        if status or admin_notes is not None:
            reviewed_by_user_id = admin_user.id if status else None
            await self.recipe_report_repository.update_status(
                report_id=report_id,
                status=status or report.status,
                reviewed_by_user_id=reviewed_by_user_id,
                admin_notes=admin_notes,
            )

        updated_report = await self.recipe_report_repository.get_with_relations(report_id)
        return RecipeReportRead.model_validate(updated_report, from_attributes=True)

    async def delete_report(self, report_id: int) -> None:
        report = await self.recipe_report_repository.get(report_id)
        if not report:
            msg = f"Recipe report with id {report_id} not found"
            raise RecipeReportNotFoundError(msg)

        await self.recipe_report_repository.delete(report_id)

    async def get_reports_stats(self) -> RecipeReportStats:
        stats_data = await self.recipe_report_repository.get_stats()
        return RecipeReportStats.model_validate(stats_data)
