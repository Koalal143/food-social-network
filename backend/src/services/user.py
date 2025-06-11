from datetime import UTC, datetime
from typing import cast

from src.enums.user_role import UserRoleEnum
from src.exceptions.auth import InactiveOrNotExistingUserError, IncorrectCredentialsError, SuspiciousEmailError
from src.exceptions.user import (
    InsufficientRoleError,
    UserEmailAlreadyExistsError,
    UserNicknameAlreadyExistsError,
    UserNotFoundError,
)
from src.models.user import User
from src.repositories.interfaces import (
    BannedEmailRepositoryProtocol,
    UserAvatarRepositoryProtocol,
    UserProfileRepositoryProtocol,
    UserRepositoryProtocol,
)
from src.schemas.user import UserProfileUpdate, UserRead
from src.services.security import SecurityService


class UserService:
    def __init__(
        self,
        user_repository: UserRepositoryProtocol,
        user_profile_repository: UserProfileRepositoryProtocol,
        banned_email_repository: BannedEmailRepositoryProtocol,
        user_avatar_repository: UserAvatarRepositoryProtocol,
    ) -> None:
        self.user_repository = user_repository
        self.user_profile_repository = user_profile_repository
        self.banned_email_repository = banned_email_repository
        self.user_avatar_repository = user_avatar_repository

    async def get(self, user_id: int) -> UserRead:
        user = await self.user_repository.get_with_profile(user_id)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return await self._to_user_model(user)

    async def get_by_email(self, email: str) -> UserRead:
        user = await self.user_repository.get_by_email(email)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return await self._to_user_model(user)

    async def get_by_username(self, username: str) -> UserRead:
        user = await self.user_repository.get_by_username(username)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return await self._to_user_model(user)

    async def create(self, *, username: str, email: str, hashed_password: str) -> UserRead:
        existing = await self.user_repository.check_username_email_exists(username, email)
        for user in existing:
            if user.username == username:
                msg = "Username already taken"
                raise UserNicknameAlreadyExistsError(msg)
            if user.email == email:
                msg = "Email already registered"
                raise UserEmailAlreadyExistsError(msg)

        _, email_domain = email.split("@", 1)

        if await self.banned_email_repository.get_by_domain(email_domain):
            msg = "Email is disposable"
            raise SuspiciousEmailError(msg)

        user = await self.user_repository.create(
            username=username,
            email=email,
            hashed_password=hashed_password,
        )
        await self.user_profile_repository.create(user_id=user.id)

        user = cast("User", await self.user_repository.get_with_profile(user.id))
        return await self._to_user_model(user)

    async def authenticate(self, *, email: str | None, username: str | None, password: str) -> UserRead:
        try:
            if email:
                user = await self.user_repository.get_by_email(email)
            else:
                user = await self.user_repository.get_by_username(username)  # type: ignore[arg-type]
        except UserNotFoundError:
            msg = "Incorrect email/username or password"
            raise UserNotFoundError(msg) from None

        if not user:
            # Should not happen due to previous check, but for type safety
            msg = "User not found"
            raise UserNotFoundError(msg)

        if not SecurityService.verify_password(password, user.hashed_password):
            msg = "Incorrect email/username or password"
            raise IncorrectCredentialsError(msg)

        if not user.is_active:
            msg = "Inactive user"
            raise InactiveOrNotExistingUserError(msg)

        return await self._to_user_model(user)

    async def update_last_login(self, user_read: UserRead) -> UserRead:
        await self.user_repository.update_last_login(user_read.id, datetime.now(tz=UTC))
        user = await self.user_repository.get_with_profile(user_read.id)
        if not user:
            msg = "User not found after update_last_login"
            raise UserNotFoundError(msg)
        return await self._to_user_model(user)

    async def update(
        self, user_id: int, *, username: str | None = None, profile: UserProfileUpdate | None = None
    ) -> UserRead:
        user = await self.user_repository.get_with_profile(user_id)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)

        if username is not None and username != user.username:
            existing_user = await self.user_repository.get_by_username(username)
            if existing_user:
                msg = "Username already taken"
                raise UserNicknameAlreadyExistsError(msg)
            await self.user_repository.update_username(user_id, username)

        if profile and profile.about is not None:
            await self.user_profile_repository.update(user_id=user_id, about=profile.about)

        user = cast("User", await self.user_repository.get_with_profile(user_id))
        return await self._to_user_model(user)

    async def update_role(self, user_id: int, role: UserRoleEnum, current_user: User) -> UserRead:
        if not current_user.can_manage_recipes():
            msg = "Role management requires superuser privileges"
            raise InsufficientRoleError(msg)

        user = await self.user_repository.get_with_profile(user_id)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)

        await self.user_repository.update_role(user_id, role)
        user = cast("User", await self.user_repository.get_with_profile(user_id))
        return await self._to_user_model(user)

    async def _to_user_model(self, user: User) -> UserRead:
        model = UserRead.model_validate(user, from_attributes=True)
        if model.profile and model.profile.avatar_url:
            model.profile.avatar_url = await self.user_avatar_repository.get_avatar_presigned_url(user.id)
        return UserRead.model_validate(model, from_attributes=True)
