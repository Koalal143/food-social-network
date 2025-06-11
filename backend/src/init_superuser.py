import asyncio

from src.core.config import Settings
from src.core.di import container
from src.db.uow import SQLAlchemyUnitOfWork
from src.repositories.interfaces.user import UserRepositoryProtocol
from src.services.security import SecurityService


async def main() -> None:
    async with container() as request_container:
        uow = await request_container.get(SQLAlchemyUnitOfWork)
        user_repository: UserRepositoryProtocol = await request_container.get(UserRepositoryProtocol)
        settings = await request_container.get(Settings)
        hashed_password = SecurityService.get_password_hash(settings.superuser.password)
        async with uow:
            if await user_repository.get_by_email(settings.superuser.email) or await user_repository.get_by_username(
                settings.superuser.username
            ):
                return
            await user_repository.create_superuser(
                username=settings.superuser.username,
                email=settings.superuser.email,
                hashed_password=hashed_password,
            )
            await uow.commit()


if __name__ == "__main__":
    asyncio.run(main())
