from faststream.nats import JStream

recommendations_stream = JStream(
    name="recsys_events_stream",
    subjects=["recsys_events.*"],
)

__all__ = ["recommendations_stream"]
