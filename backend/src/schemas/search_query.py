from datetime import datetime

from pydantic import Field

from src.schemas.base import BaseReadSchema, BaseSchema


class SearchQueryCreate(BaseSchema):
    """Schema for creating a search query."""

    query: str = Field(min_length=1, max_length=500, description="Search query text")


class SearchQueryRead(BaseReadSchema):
    """Schema for reading search query history."""

    query: str = Field(description="Search query text")
    created_at: datetime = Field(description="Date and time when the search was made")
