from dishka import Provider, Scope, provide
from faststream.nats import NatsBroker

from src.adapters.interfaces.recommendations import RecommendationsAdapterProtocol
from src.adapters.recommendations import RecommendationsAdapter
from src.core.config import Settings


class RecommendationsAdapterProvider(Provider):
    scope = Scope.APP

    @provide
    def get_recommendations_adapter(self, broker: NatsBroker, settings: Settings) -> RecommendationsAdapterProtocol:  # noqa: ARG002
        return RecommendationsAdapter(broker)
