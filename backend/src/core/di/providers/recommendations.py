from dishka import Provider, Scope, provide
from faststream.nats import NatsBroker

from src.adapters.recommendations import RecommendationsAdapter


class RecommendationsAdapterProvider(Provider):
    scope = Scope.APP

    @provide
    def get_recommendations_adapter(self, broker: NatsBroker) -> RecommendationsAdapter:
        return RecommendationsAdapter(broker)
