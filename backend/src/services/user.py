from datetime import UTC, datetime

from src.db.uow import SQLAlchemyUnitOfWork
from src.exceptions.auth import InactiveOrNotExistingUserError, IncorrectCredentialsError
from src.exceptions.user import UserEmailAlreadyExistsError, UserNicknameAlreadyExistsError, UserNotFoundError
from src.models.user import User
from src.models.user_profile import UserProfile
from src.schemas.user import UserProfileUpdate
from src.services.security import SecurityService


class UserService:
    def __init__(self, uow: SQLAlchemyUnitOfWork) -> None:
        self.uow = uow

    async def get(self, user_id: int) -> User:
        user = await self.uow.users.get_with_profile(user_id)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return user

    async def get_by_email(self, email: str) -> User:
        user = await self.uow.users.get_by_email(email)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return user

    async def get_by_username(self, username: str) -> User:
        user = await self.uow.users.get_by_username(username)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return user

    async def create(self, *, username: str, email: str, hashed_password: str) -> User:
        existing = await self.uow.users.check_username_email_exists(username, email)
        for user in existing:
            if user.username == username:
                msg = "Username already taken"
                raise UserNicknameAlreadyExistsError(msg)
            if user.email == email:
                msg = "Email already registered"
                raise UserEmailAlreadyExistsError(msg)

        user = await self.uow.users.create(
            username=username,
            email=email,
            hashed_password=hashed_password,
        )
        await self.uow.session.flush()

        await self.uow.user_profiles.create(user_id=user.id)
        await self.uow.commit()
        return await self.get(user.id)

    async def authenticate(self, *, email: str | None, username: str | None, password: str) -> User:
        try:
            if email:
                user = await self.get_by_email(email)
            else:
                user = await self.get_by_username(username)  # type: ignore[arg-type]
        except UserNotFoundError:
            msg = "Incorrect email/username or password"
            raise UserNotFoundError(msg) from None

        if not SecurityService.verify_password(password, user.hashed_password):
            msg = "Incorrect email/username or password"
            raise IncorrectCredentialsError(msg)

        if not user.is_active:
            msg = "Inactive user"
            raise InactiveOrNotExistingUserError(msg)

        return user

    async def update_last_login(self, user: User) -> User:
        await self.uow.users.update_last_login(user.id, datetime.now(tz=UTC))
        await self.uow.commit()
        return user

    async def get_profile(self, user_id: int) -> UserProfile | None:
        return await self.uow.user_profiles.get_by_user_id(user_id)

    async def update(
        self, user_id: int, *, username: str | None = None, profile: UserProfileUpdate | None = None
    ) -> User:
        user = await self.get(user_id)

        if username is not None and username != user.username:
            existing_user = await self.uow.users.get_by_username(username)
            if existing_user:
                msg = "Username already taken"
                raise UserNicknameAlreadyExistsError(msg)

            await self.uow.users.update_username(user_id, username)

        if profile is not None:
            user_profile = await self.uow.user_profiles.get_by_user_id(user_id)
            if not user_profile:
                user_profile = await self.uow.user_profiles.create(user_id=user_id)

            if profile.about is not None:
                await self.uow.user_profiles.update(user_profile, about=profile.about)

        await self.uow.commit()
        return await self.get(user_id)
