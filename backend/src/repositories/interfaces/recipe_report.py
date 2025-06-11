from typing import Protocol

from src.enums.report_status import ReportStatusEnum
from src.models.recipe_report import RecipeReport


class RecipeReportRepositoryProtocol(Protocol):
    async def get(self, report_id: int) -> RecipeReport | None: ...

    async def get_with_relations(self, report_id: int) -> RecipeReport | None: ...

    async def get_by_recipe_and_reporter(self, recipe_id: int, reporter_user_id: int) -> RecipeReport | None: ...

    async def get_all(self, limit: int, offset: int, status: ReportStatusEnum | None = None) -> list[RecipeReport]: ...

    async def get_by_reporter(self, reporter_user_id: int, limit: int, offset: int) -> list[RecipeReport]: ...

    async def get_count(self, status: ReportStatusEnum | None = None) -> int: ...

    async def get_count_by_reporter(self, reporter_user_id: int) -> int: ...

    async def create(
        self,
        recipe_id: int,
        reporter_user_id: int | None,
        reason: str,
        description: str | None = None,
    ) -> RecipeReport: ...

    async def update_status(
        self,
        report_id: int,
        status: ReportStatusEnum,
        reviewed_by_user_id: int | None = None,
        admin_notes: str | None = None,
    ) -> None: ...

    async def delete(self, report_id: int) -> None: ...
