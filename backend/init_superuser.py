import asyncio

from src.core.config import Settings
from src.core.di import container
from src.repositories.interfaces.user import UserRepositoryProtocol
from src.services.security import SecurityService


async def main() -> None:
    async with container() as request_container:
        user_repository = await request_container.get(UserRepositoryProtocol)
        settings = await request_container.get(Settings)
        hashed_password = SecurityService.hash_password(settings.superuser.password)
        await user_repository.create_superuser(
            username=settings.superuser.username,
            email=settings.superuser.email,
            hashed_password=hashed_password,
        )


if __name__ == "__main__":
    asyncio.run(main())
