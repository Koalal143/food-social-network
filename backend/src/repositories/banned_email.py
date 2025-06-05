from collections.abc import Sequence

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.banned_email import BannedEmail
from src.repositories.interfaces.banned_email import BannedEmailRepositoryProtocol
from src.schemas.banned_email import BannedEmailDomainCreate


class BannedEmailRepository(BannedEmailRepositoryProtocol):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_count(self) -> int:
        stmt = select(func.count()).select_from(BannedEmail)
        return await self.session.scalar(stmt) or 0

    async def get_all(self, limit: int, offset: int) -> Sequence[BannedEmail]:
        stmt = select(BannedEmail).limit(limit).offset(offset)
        result = await self.session.scalars(stmt)
        return result.all()

    async def get_by_domain(self, domain: str) -> BannedEmail | None:
        stmt = select(BannedEmail).where(BannedEmail.domain == domain)
        result = await self.session.scalars(stmt)
        return result.first()

    async def create(self, banned_email_in: BannedEmailDomainCreate) -> BannedEmail:
        banned_email = BannedEmail(**banned_email_in.model_dump())
        self.session.add(banned_email)
        await self.session.flush()
        await self.session.refresh(banned_email)
        return banned_email

    async def delete(self, domain: str) -> BannedEmail | None:
        banned_email = await self.get_by_domain(domain)
        if banned_email:
            await self.session.delete(banned_email)
            await self.session.flush()
        return banned_email
