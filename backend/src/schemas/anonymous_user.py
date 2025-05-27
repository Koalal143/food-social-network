from pydantic import UUID4, BaseModel, ConfigDict, Field

from src.schemas.base import BaseReadSchema


class BaseAnonymousUserSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    user_agent: str | None = Field(
        None,
        max_length=255,
    )


class AnonymousUserCreate(BaseAnonymousUserSchema):
    pass


class AnonymousUserRead(BaseAnonymousUserSchema, BaseReadSchema):
    model_config = ConfigDict(from_attributes=True, extra="ignore")

    cookie_id: UUID4
