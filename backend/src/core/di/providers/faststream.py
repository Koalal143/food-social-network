import logging

from dishka import Provider, Scope, provide
from faststream.nats import NatsBroker

from src.core.config import settings

logger = logging.getLogger(__name__)


class FastStreamProvider(Provider):
    scope = Scope.APP

    @provide
    async def get_faststream_broker(self) -> NatsBroker:
        return NatsBroker(
            servers=[settings.nats.url],
        )
