from datetime import datetime

from pydantic import BaseModel, ConfigDict, Field


class BaseSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)


class BaseReadSchema(BaseSchema):
    id: int = Field(description="Уникальный идентификатор")
    created_at: datetime = Field(description="Дата и время создания")
    updated_at: datetime | None = Field(None, description="Дата и время последнего обновления")
