from __future__ import annotations

from typing import TYPE_CHECKING, Any

from sqlalchemy import delete, select, update

from src.models.consent import Consent
from src.repositories.interfaces.consent import ConsentRepositoryProtocol

if TYPE_CHECKING:
    from sqlalchemy.ext.asyncio import AsyncSession


class ConsentRepository(ConsentRepositoryProtocol):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get_by_anonymous_user_id(self, anonymous_user_id: int) -> Consent | None:
        stmt = select(Consent).where(Consent.anonymous_user_id == anonymous_user_id)
        result = await self.session.scalars(stmt)
        return result.first()

    async def create(self, **fields: Any) -> Consent:
        consent = Consent(**fields)
        self.session.add(consent)
        await self.session.flush()
        await self.session.refresh(consent)
        return consent

    async def update(self, anonymous_user_id: int, **fields: Any) -> Consent | None:
        stmt = update(Consent).where(Consent.anonymous_user_id == anonymous_user_id).values(**fields)
        await self.session.execute(stmt)
        await self.session.flush()
        return await self.session.scalar(select(Consent).where(Consent.anonymous_user_id == anonymous_user_id))

    async def delete(self, consent_id: int) -> None:
        stmt = delete(Consent).where(Consent.id == consent_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def delete_by_anonymous_user_id(self, anonymous_user_id: int) -> None:
        stmt = delete(Consent).where(Consent.anonymous_user_id == anonymous_user_id)
        await self.session.execute(stmt)
        await self.session.flush()
