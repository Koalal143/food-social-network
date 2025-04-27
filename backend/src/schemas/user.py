from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from src.schemas.base import BaseReadSchema


class UserProfileRead(BaseReadSchema):
    user_id: int = Field(description="User ID to which the profile belongs")
    about: str | None = Field(None, description="About the user")
    avatar_url: str | None = Field(None, description="User avatar URL")


class UserProfileUpdate(BaseModel):
    about: str | None = Field(None, description="About the user")
    avatar_url: str | None = Field(None, description="User avatar URL")


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8)

class UserRead(BaseReadSchema):
    email: str
    is_active: bool
    is_superuser: bool
    profile: UserProfileRead | None = Field(default=None)
    last_login: datetime | None


class UserLogin(BaseModel):
    email: str | None = Field(None, description="User email")
    username: str | None = Field(None, description="Username")
    password: str = Field(..., min_length=8, description="User password")
