import uuid

from src.exceptions.anonymous_user import AnonymousUserDoesNotExistError
from src.repositories.interfaces import AnonymousUserRepositoryProtocol
from src.schemas.anonymous_user import AnonymousUserCreate, AnonymousUserRead


class AnonymousUserService:
    def __init__(self, anonymous_user_repository: AnonymousUserRepositoryProtocol) -> None:
        self.anonymous_user_repository = anonymous_user_repository

    async def create(
        self,
        anonymous_user_create: AnonymousUserCreate,
    ) -> AnonymousUserRead:
        anonymous_user_data = anonymous_user_create.model_dump()
        anonymous_user = await self.anonymous_user_repository.create(**anonymous_user_data)
        return AnonymousUserRead.model_validate(anonymous_user)

    async def create_with_cookie_id(
        self,
        cookie_id: uuid.UUID,
        user_agent: str | None = None,
    ) -> AnonymousUserRead:
        """Create anonymous user with specified cookie_id."""
        anonymous_user = await self.anonymous_user_repository.create(
            cookie_id=cookie_id,
            user_agent=user_agent,
        )
        return AnonymousUserRead.model_validate(anonymous_user)

    async def get_by_id(self, anonymous_user_id: int) -> AnonymousUserRead | None:
        anonymous_user = await self.anonymous_user_repository.get_by_id(anonymous_user_id)
        if not anonymous_user:
            msg = f"Anonymous user with id {anonymous_user_id} not found"
            raise AnonymousUserDoesNotExistError(msg)
        return AnonymousUserRead.model_validate(anonymous_user)

    async def get_by_cookie_id(self, cookie_id: uuid.UUID) -> AnonymousUserRead | None:
        anonymous_user = await self.anonymous_user_repository.get_by_cookie_id(cookie_id)
        if not anonymous_user:
            msg = f"Anonymous user with cookie_id {cookie_id} not found"
            raise AnonymousUserDoesNotExistError(msg)
        return AnonymousUserRead.model_validate(anonymous_user)

    async def delete_by_id(self, anonymous_user_id: int) -> None:
        await self.anonymous_user_repository.delete_by_id(anonymous_user_id)

    async def exists(self, anonymous_user_id: int) -> bool:
        return await self.anonymous_user_repository.exists(anonymous_user_id)

    async def exists_by_cookie_id(self, cookie_id: uuid.UUID) -> bool:
        return await self.anonymous_user_repository.exists_by_cookie_id(cookie_id)
