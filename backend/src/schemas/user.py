from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from src.schemas.base import BaseReadSchema


class UserCreate(BaseModel):
    username: str = Field(min_length=3, max_length=30)
    email: EmailStr
    password: str = Field(min_length=8)


class UserRead(BaseReadSchema):
    email: str
    is_active: bool
    is_superuser: bool
    last_login: datetime | None
