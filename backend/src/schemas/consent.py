from pydantic import BaseModel, ConfigDict

from src.schemas.base import BaseReadSchema


class BaseConsentSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    is_analytics_allowed: bool


class ConsentCreate(BaseConsentSchema):
    pass


class ConsentRead(BaseConsentSchema, BaseReadSchema):
    pass


class ConsentUpdate(BaseConsentSchema):
    pass
