from src.exceptions.banned_email import EmailDomainAlreadyBannedError
from src.repositories.interfaces import BannedEmailRepositoryProtocol
from src.schemas.banned_email import (
    BannedEmailDomainCreate,
    BannedEmailDomainRead,
)


class BannedEmailService:
    def __init__(self, banned_email_repository: BannedEmailRepositoryProtocol) -> None:
        self.banned_email_repository = banned_email_repository

    async def get_all_banned_emails(self, limit: int, offset: int) -> tuple[int, list[str]]:
        count = await self.banned_email_repository.get_count()
        banned_emails = await self.banned_email_repository.get_all(limit, offset)
        return count, [email.domain for email in banned_emails]

    async def check_banned_email(self, domain: str) -> bool:
        banned_email = await self.banned_email_repository.get_by_domain(domain)
        return bool(banned_email)

    async def create_banned_email(self, banned_email_create: BannedEmailDomainCreate) -> BannedEmailDomainRead:
        existing_banned_email = await self.banned_email_repository.get_by_domain(banned_email_create.domain)
        if existing_banned_email:
            msg = f"Domain '{banned_email_create.domain}' is already banned"
            raise EmailDomainAlreadyBannedError(msg)
        new_banned_email = await self.banned_email_repository.create(banned_email_create)
        return BannedEmailDomainRead.model_validate(new_banned_email)

    async def delete_banned_email(self, domain: str) -> None:
        await self.banned_email_repository.delete(domain)
