from datetime import UTC, datetime

from src.adapters.storage import S3Storage
from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.auth import InactiveOrNotExistingUserError, IncorrectCredentialsError, SuspiciousEmailError
from src.exceptions.user import UserEmailAlreadyExistsError, UserNicknameAlreadyExistsError, UserNotFoundError
from src.models.user import User
from src.schemas.user import UserProfileUpdate, UserRead
from src.services.security import SecurityService


class UserService:
    def __init__(self, uow: SQLAlchemyUnitOfWork, s3_client: S3Storage) -> None:
        self.uow = uow
        self.s3_client = s3_client

    async def get(self, user_id: int) -> UserRead:
        user = await self.uow.users.get_with_profile(user_id)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return await self._to_user_model(user)

    async def get_by_email(self, email: str) -> UserRead:
        user = await self.uow.users.get_by_email(email)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return await self._to_user_model(user)

    async def get_by_username(self, username: str) -> UserRead:
        user = await self.uow.users.get_by_username(username)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return await self._to_user_model(user)

    async def create(self, *, username: str, email: str, hashed_password: str) -> UserRead:
        existing = await self.uow.users.check_username_email_exists(username, email)
        for user in existing:
            if user.username == username:
                msg = "Username already taken"
                raise UserNicknameAlreadyExistsError(msg)
            if user.email == email:
                msg = "Email already registered"
                raise UserEmailAlreadyExistsError(msg)

        _, email_domain = email.split("@", 1)

        if await self.uow.banned_emails.get_by_domain(email_domain):
            msg = "Email is disposable"
            raise SuspiciousEmailError(msg)

        user = await self.uow.users.create(
            username=username,
            email=email,
            hashed_password=hashed_password,
        )
        await self.uow.session.flush()
        await self.uow.user_profiles.create(user_id=user.id)
        await self.uow.commit()

        user = await self.uow.users.get_with_profile(user.id)
        return await self._to_user_model(user)

    async def authenticate(self, *, email: str | None, username: str | None, password: str) -> UserRead:
        try:
            if email:
                user = await self.uow.users.get_by_email(email)
            else:
                user = await self.uow.users.get_by_username(username)  # type: ignore[arg-type]
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
        await self.uow.users.update_last_login(user_read.id, datetime.now(tz=UTC))
        await self.uow.commit()
        user = await self.uow.users.get_with_profile(user_read.id)
        if not user:
            msg = "User not found after update_last_login"
            raise UserNotFoundError(msg)
        return await self._to_user_model(user)

    async def update(
        self, user_id: int, *, username: str | None = None, profile: UserProfileUpdate | None = None
    ) -> UserRead:
        user = await self.uow.users.get_with_profile(user_id)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)

        if username is not None and username != user.username:
            existing_user = await self.uow.users.get_by_username(username)
            if existing_user:
                msg = "Username already taken"
                raise UserNicknameAlreadyExistsError(msg)
            await self.uow.users.update_username(user_id, username)

        if profile and profile.about is not None:
            await self.uow.user_profiles.update(user_id=user_id, about=profile.about)

        await self.uow.commit()
        user = await self.uow.users.get_with_profile(user_id)
        return await self._to_user_model(user)

    async def _to_user_model(self, user: User) -> UserRead:
        model = UserRead.model_validate(user, from_attributes=True)
        if user.profile and user.profile.avatar_url:
            model.profile.avatar_url = await self.s3_client.get_file_url("images", user.profile.avatar_url)
        return UserRead.model_validate(user, from_attributes=True)
