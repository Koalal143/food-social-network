from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.banned_email import EmailDomainAlreadyBannedError
from src.schemas.banned_email import (
    BannedEmailDomainCreate,
    BannedEmailDomainRead,
)


class BannedEmailService:
    def __init__(self, uow: SQLAlchemyUnitOfWork) -> None:
        self.uow = uow

    async def get_all_banned_emails(self, limit: int, offset: int) -> tuple[int, list[str]]:
        count = await self.uow.banned_emails.get_count()
        banned_emails = await self.uow.banned_emails.get_all(limit, offset)
        return count, [email.domain for email in banned_emails]

    async def check_banned_email(self, domain: str) -> bool:
        banned_email = await self.uow.banned_emails.get_by_domain(domain)
        return bool(banned_email)

    async def create_banned_email(self, banned_email_create: BannedEmailDomainCreate) -> BannedEmailDomainRead:
        existing_banned_email = await self.uow.banned_emails.get_by_domain(banned_email_create.domain)
        if existing_banned_email:
            msg = f"Domain '{banned_email_create.domain}' is already banned"
            raise EmailDomainAlreadyBannedError(msg)
        new_banned_email = await self.uow.banned_emails.create(banned_email_create)
        await self.uow.commit()
        return BannedEmailDomainRead.model_validate(new_banned_email)

    async def delete_banned_email(self, domain: str) -> None:
        await self.uow.banned_emails.delete(domain)
        await self.uow.commit()
