from langchain_gigachat.embeddings import GigaChatEmbeddings


class EmbeddingsRepository:
    def __init__(self, embeddings: GigaChatEmbeddings) -> None:
        self._embeddings = embeddings

    async def get_embedding(self, text: str) -> list[float]:
        return await self._embeddings.aembed_query(text)
