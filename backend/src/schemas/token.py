from datetime import datetime

from pydantic import BaseModel


class Token(BaseModel):
    access_token: str
    refresh_token: str


class TokenPayload(BaseModel):
    sub: int
    exp: datetime
