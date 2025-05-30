from collections.abc import Sequence

from pydantic import BaseModel, ConfigDict, Field


class RecommendationItem(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    recipe_id: int = Field(
        gt=0,
        description="Recipe ID",
        examples=[1, 42, 123]
    )
    score: float = Field(
        ge=0.0,
        le=2,
        description="Recipe relevancy score",
        examples=[0.95, 0.87, 0.73]
    )


class UserPreferences(BaseModel):
    favorite_recipes_ids: Sequence[int] | None = Field(
        description="List of favorite recipes IDs",
        examples=[[1, 2, 3], [42, 123, 789]]
    )
    disliked_recipes_ids: Sequence[int] | None = Field(
        description="List of disliked recipes IDs",
        examples=[[1, 2, 3], [42, 123, 789]]
    )
    viewed_recipes_ids: Sequence[int] | None = Field(
        description="List of viewed recipes IDs",
        examples=[[1, 2, 3], [42, 123, 789]]
    )
    recs_detail_recipes_ids: Sequence[int] | None = Field(
        description="List of recipes IDs that were viewed in recommendations detail",
    )
    author_recipes_ids: Sequence[int] | None = Field(
        description="List of recipes IDs that were created by the user",
        examples=[[1, 2, 3], [42, 123, 789]]
    )
