from src.adapters.interfaces.recommendations import RecommendationsAdapterProtocol
from src.enums.feedback_type import FeedbackTypeEnum
from src.schemas.recsys_messages import AddImpressionMessage, RecommendationItem


class MockRecommendationsAdapter(RecommendationsAdapterProtocol):
    async def get_recommendations(
        self,
        user_id: int,
        limit: int = 10,
        fetch_k: int = 20,  # noqa: ARG002
        lambda_mult: float = 0.5,  # noqa: ARG002
        fail_after: float = 10,  # noqa: ARG002
        *,
        exclude_viewed: bool = True,  # noqa: ARG002
    ) -> list[RecommendationItem]:
        base_recipe_id = user_id * 100
        recommendations = []

        for i in range(min(limit, 5)):
            recipe_id = base_recipe_id + i + 1
            score = max(0.1, 1.0 - (i * 0.15))
            recommendations.append(RecommendationItem(recipe_id=recipe_id, score=score))

        return recommendations

    async def add_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None:
        pass

    async def delete_recipe(self, recipe_id: int) -> None:
        pass

    async def update_recipe(self, author_id: int, recipe_id: int, title: str, tags: str) -> None:
        pass

    async def add_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        pass

    async def delete_feedback(self, user_id: int, recipe_id: int, feedback_type: FeedbackTypeEnum) -> None:
        pass

    async def add_impression(self, user_id: int, recipe_id: int, source: str) -> None:
        pass

    async def add_impressions_bulk(self, impressions: list[AddImpressionMessage]) -> None:
        pass
