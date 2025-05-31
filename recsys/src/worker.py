from dishka.integrations.faststream import setup_dishka
from faststream.asgi import AsgiFastStream
from faststream.nats import NatsBroker

from src.core.config import settings
from src.core.di import container
from src.tasks import router

broker = NatsBroker(
    servers=[f"{settings.nats.host}:{settings.nats.port}"],
    apply_types=True,
)
broker.include_router(router)
setup_dishka(container, broker=broker)

app = AsgiFastStream(broker, asyncapi_path="/docs/asyncapi" if settings.mode == "dev" else None)
