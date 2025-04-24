from datetime import datetime
from typing import Annotated

from pydantic import BaseModel, EmailStr, Field

from src.schemas.base import BaseReadSchema


class UserCreate(BaseModel):
    email: EmailStr
    password: Annotated[str, Field(min_length=8)]


class UserRead(BaseReadSchema):
    email: str
    is_active: bool
    is_superuser: bool
    last_login: datetime | None
