from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from src.schemas.base import BaseReadSchema


class UserProfileRead(BaseReadSchema):
    user_id: int = Field(description="ID пользователя, к которому относится профиль")
    about: str | None = Field(None, description="О пользователе")
    avatar_url: str | None = Field(None, description="URL аватара пользователя")


class UserProfileUpdate(BaseModel):
    about: str | None = Field(None, description="О пользователе")
    avatar_url: str | None = Field(None, description="URL аватара пользователя")


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8)


class UserRead(BaseReadSchema):
    email: str
    is_active: bool
    is_superuser: bool
    profile: UserProfileRead | None = None
    last_login: datetime | None
