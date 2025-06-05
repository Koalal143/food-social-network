from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from src.models.consent import Consent
    from src.repositories.interfaces.consent import ConsentRepositoryProtocol


class ConsentService:
    def __init__(self, consent_repository: ConsentRepositoryProtocol) -> None:
        self.consent_repository = consent_repository

    async def get_by_anonymous_user_id(self, anonymous_user_id: int) -> Consent | None:
        return await self.consent_repository.get_by_anonymous_user_id(anonymous_user_id)

    async def create(self, anonymous_user_id: int, *, is_analytics_allowed: bool = False) -> Consent:
        return await self.consent_repository.create(
            anonymous_user_id=anonymous_user_id, is_analytics_allowed=is_analytics_allowed
        )

    async def update_analytics_consent(self, anonymous_user_id: int, *, is_analytics_allowed: bool) -> Consent | None:
        return await self.consent_repository.update(anonymous_user_id, is_analytics_allowed=is_analytics_allowed)

    async def delete(self, consent_id: int) -> None:
        await self.consent_repository.delete(consent_id)

    async def delete_by_anonymous_user_id(self, anonymous_user_id: int) -> None:
        await self.consent_repository.delete_by_anonymous_user_id(anonymous_user_id)
