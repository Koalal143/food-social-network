from datetime import UTC, datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload

from src.exceptions.user import UserEmailAlreadyExistsError, UserNicknameAlreadyExistsError, UserNotFoundError
from src.models.user import User
from src.models.user_profile import UserProfile
from src.schemas.user import UserProfileUpdate


class UserService:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def get(self, user_id: int) -> User | None:
        user = await self.session.scalar(select(User).options(joinedload(User.profile)).where(User.id == user_id))
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return user

    async def get_by_email(self, email: str) -> User | None:
        user = await self.session.scalar(select(User).options(joinedload(User.profile)).where(User.email == email))
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return user

    async def get_by_username(self, username: str) -> User | None:
        user = await self.session.scalar(
            select(User).options(joinedload(User.profile)).where(User.username == username)
        )
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)
        return user

    async def create(self, *, username: str, email: str, hashed_password: str) -> User:
        result = await self.session.execute(select(User).where((User.username == username) | (User.email == email)))
        existing = result.scalars().all()
        for user in existing:
            if user.username == username:
                msg = "Username already taken"
                raise UserNicknameAlreadyExistsError(msg)
            if user.email == email:
                msg = "Email already registered"
                raise UserEmailAlreadyExistsError(msg)
        user = User(
            username=username,
            email=email,
            hashed_password=hashed_password,
        )
        user_profile = UserProfile(user_id=user.id)
        self.session.add(user)
        self.session.add(user_profile)
        await self.session.commit()
        await self.session.refresh(user)
        await self.session.refresh(user_profile)
        return user

    async def update_last_login(self, user: User) -> User:
        user.last_login = datetime.now(tz=UTC)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def get_profile(self, user_id: int) -> UserProfile | None:
        return await self.session.scalar(select(UserProfile).where(UserProfile.user_id == user_id))

    async def update(
        self, user_id: int, *, username: str | None = None, profile: UserProfileUpdate | None = None
    ) -> User:
        user = await self.get(user_id)
        if not user:
            msg = "User not found"
            raise UserNotFoundError(msg)

        if username is not None and username != user.username:
            if await self.get_by_username(username):
                msg = "Username already taken"
                raise UserNicknameAlreadyExistsError(msg)
            user.username = username

        if profile is not None:
            user_profile = await self.get_profile(user_id)
            if not user_profile:
                user_profile = UserProfile(user_id=user_id)
                self.session.add(user_profile)

            if profile.about is not None:
                user_profile.about = profile.about

        await self.session.commit()
        await self.session.refresh(user)
        return user
