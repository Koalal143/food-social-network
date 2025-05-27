from datetime import datetime

from pydantic import Field

from src.schemas.base import BaseReadSchema


class SearchQueryRead(BaseReadSchema):
    """Schema for reading search query history."""

    query: str = Field(description="Search query text")
    created_at: datetime = Field(description="Date and time when the search was made")
