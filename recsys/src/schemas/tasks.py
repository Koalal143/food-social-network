from pydantic import BaseModel, ConfigDict, Field

from src.repositories.postgres import FeedbackType, ImpressionSource


class GetRecommendationsRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    user_id: int = Field(
        examples=[1, 42]
    )
    limit: int = Field(
        default=10,
        ge=1,
        le=100,
        description="Number of recommendations",
        examples=[10, 20, 50]
    )
    fetch_k: int = Field(
        default=20,
        ge=1,
        le=200,
        description="Number of candidates for selection",
        examples=[20, 50, 100]
    )
    lambda_mult: float = Field(
        default=0.5,
        ge=0.0,
        le=1.0,
        description="Balance between relevance and diversity",
        examples=[0.3, 0.5, 0.7]
    )
    exclude_viewed: bool = Field(
        default=True,
        description="Exclude viewed recipes",
        examples=[True, False]
    )


class AddRecipeRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    recipe_id: int = Field(
        gt=0,
        examples=[1, 42, 123]
    )
    title: str = Field(
        min_length=1,
        max_length=500,
        examples=["Борщ украинский", "Паста карбонара", "Салат цезарь"]
    )
    tags: str = Field(
        default="",
        max_length=1000,
        examples=["суп, украинская кухня", "паста, итальянская кухня", ""]
    )
    author_id: int = Field(
        gt=0,
        examples=[1, 42, 123]
    )


class DeleteRecipeRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    recipe_id: int = Field(
        gt=0,
        examples=[1, 42, 123]
    )


class UpdateRecipeRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    recipe_id: int = Field(
        gt=0,
        examples=[1, 42, 123]
    )
    title: str = Field(
        min_length=1,
        max_length=500,
        examples=["Борщ русский классический", "Паста карбонара с беконом"]
    )
    tags: str = Field(
        default="",
        max_length=1000,
        examples=["суп, русская кухня, классический", "паста, итальянская кухня, бекон"]
    )
    is_published: bool = Field(
        description="Is the recipe published or not",
        examples=[True, False]
    )


class AddFeedbackRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    user_id: int = Field(
        examples=[1, 42, -123]
    )
    recipe_id: int = Field(
        gt=0,
        examples=[1, 42, 123]
    )
    feedback_type: FeedbackType = Field(
        examples=[FeedbackType.like, FeedbackType.dislike]
    )


class AddImpressionRequest(BaseModel):
    model_config = ConfigDict(arbitrary_types_allowed=True)

    user_id: int = Field(
        examples=[1, 42, -123]
    )
    recipe_id: int = Field(
        gt=0,
        examples=[1, 42, 123]
    )
    source: ImpressionSource = Field(
        description="Source of impression feed",
        examples=[
            ImpressionSource.search,
            ImpressionSource.feed,
            ImpressionSource.recs
        ]
    )
