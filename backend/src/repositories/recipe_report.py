from sqlalchemy import Select, delete, func, select, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.enums.report_reason import ReportReasonEnum
from src.enums.report_status import ReportStatusEnum
from src.models.recipe_report import RecipeReport
from src.models.user import User
from src.repositories.interfaces.recipe_report import RecipeReportRepositoryProtocol


class RecipeReportRepository(RecipeReportRepositoryProtocol):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    @staticmethod
    def _get_report_with_relations_query() -> Select:
        return select(RecipeReport).options(
            joinedload(RecipeReport.reporter_user).joinedload(User.profile),
            joinedload(RecipeReport.reviewed_by_user).joinedload(User.profile),
            joinedload(RecipeReport.recipe),
        )

    async def get(self, report_id: int) -> RecipeReport | None:
        return await self.session.scalar(select(RecipeReport).where(RecipeReport.id == report_id))

    async def get_with_relations(self, report_id: int) -> RecipeReport | None:
        return await self.session.scalar(
            self._get_report_with_relations_query()
            .where(RecipeReport.id == report_id)
        )

    async def get_by_recipe_and_reporter(self, recipe_id: int, reporter_user_id: int) -> RecipeReport | None:
        return await self.session.scalar(
            self._get_report_with_relations_query().where(
                RecipeReport.recipe_id == recipe_id,
                RecipeReport.reporter_user_id == reporter_user_id,
            )
        )

    async def get_all(self, limit: int, offset: int, status: ReportStatusEnum | None = None) -> list[RecipeReport]:
        query = self._get_report_with_relations_query()

        if status:
            query = query.where(RecipeReport.status == status)

        query = query.order_by(RecipeReport.created_at.desc()).offset(offset).limit(limit)
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_by_reporter(self, reporter_user_id: int, limit: int, offset: int) -> list[RecipeReport]:
        query = (
            self._get_report_with_relations_query()
            .where(RecipeReport.reporter_user_id == reporter_user_id)
            .order_by(RecipeReport.created_at.desc())
            .offset(offset)
            .limit(limit)
        )
        result = await self.session.execute(query)
        return list(result.scalars().all())

    async def get_count(self, status: ReportStatusEnum | None = None) -> int:
        query = select(func.count(RecipeReport.id))
        if status:
            query = query.where(RecipeReport.status == status)
        return await self.session.scalar(query) or 0

    async def get_count_by_reporter(self, reporter_user_id: int) -> int:
        query = select(func.count(RecipeReport.id)).where(RecipeReport.reporter_user_id == reporter_user_id)
        return await self.session.scalar(query) or 0

    async def create(
        self,
        recipe_id: int,
        reporter_user_id: int | None,
        reason: str,
        description: str | None = None,
    ) -> RecipeReport:
        report = RecipeReport(
            recipe_id=recipe_id,
            reporter_user_id=reporter_user_id,
            reason=ReportReasonEnum(reason),
            description=description,
        )
        self.session.add(report)
        await self.session.flush()
        return report

    async def update_status(
        self,
        report_id: int,
        status: ReportStatusEnum,
        reviewed_by_user_id: int | None = None,
        admin_notes: str | None = None,
    ) -> None:
        values = {"status": status}
        if reviewed_by_user_id is not None:
            values["reviewed_by_user_id"] = reviewed_by_user_id
        if admin_notes is not None:
            values["admin_notes"] = admin_notes

        await self.session.execute(update(RecipeReport).where(RecipeReport.id == report_id).values(**values))
        await self.session.flush()

    async def delete(self, report_id: int) -> None:
        await self.session.execute(delete(RecipeReport).where(RecipeReport.id == report_id))
        await self.session.flush()
