import asyncio

from src.core.config import Settings
from src.core.di import container
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.user import UserNotFoundError
from src.services.security import SecurityService
from src.services.user import UserService


async def main() -> None:
    async with container() as request_container:
        uow = await request_container.get(SQLAlchemyUnitOfWork)
        user_service: UserService = await request_container.get(UserService)
        settings = await request_container.get(Settings)
        hashed_password = SecurityService.get_password_hash(settings.superuser.password)
        async with uow:
            try:
                await user_service.get_by_email(settings.superuser.email)
                await user_service.get_by_username(settings.superuser.username)
            except UserNotFoundError:
                await user_service.create_superuser(
                    username=settings.superuser.username,
                    email=settings.superuser.email,
                    hashed_password=hashed_password,
                )
                await uow.commit()
            else:
                pass


if __name__ == "__main__":
    asyncio.run(main())
