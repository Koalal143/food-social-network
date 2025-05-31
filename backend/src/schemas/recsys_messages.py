from pydantic import BaseModel, ConfigDict, Field

from src.enums.feedback_type import FeedbackTypeEnum
from src.enums.recipe_get_source import RecipeGetSourceEnum


class GetRecommendationsRequest(BaseModel):
    user_id: int = Field(gt=0)
    limit: int = Field(default=10, ge=1, le=100)
    fetch_k: int = Field(default=20, ge=1, le=200)
    lambda_mult: float = Field(default=0.5, ge=0.0, le=1.0)
    exclude_viewed: bool = Field(default=True)


class RecommendationItem(BaseModel):
    recipe_id: int = Field(gt=0)
    score: float = Field(ge=0.0, le=2)


class GetVectorRecommendationsRequest(BaseModel):
    user_id: int = Field(gt=0)
    limit: int = Field(default=10, ge=1, le=100)
    fetch_k: int = Field(default=20, ge=1, le=200)
    lambda_mult: float = Field(default=0.5, ge=0.0, le=1.0)
    exclude_viewed: bool = Field(default=True)


class AddRecipeMessage(BaseModel):
    author_id: int = Field(gt=0)
    recipe_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=500)
    tags: str = Field(default="", max_length=1000)


class UpdateRecipeMessage(BaseModel):
    recipe_id: int = Field(gt=0)
    title: str = Field(min_length=1, max_length=500)
    tags: str = Field(default="", max_length=1000)


class AddFeedbackMessage(BaseModel):
    user_id: int
    recipe_id: int = Field(gt=0)
    feedback_type: FeedbackTypeEnum


class AddImpressionMessage(BaseModel):
    model_config = ConfigDict(from_attributes=True, use_enum_values=True)

    user_id: int
    recipe_id: int = Field(gt=0)
    source: RecipeGetSourceEnum | None = Field(None)


class GetAllRecipeIdsResponse(BaseModel):
    recipe_ids: list[int] = Field(default_factory=list)
