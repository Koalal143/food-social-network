import logging
from typing import Any

from qdrant_client.async_qdrant_client import AsyncQdrantClient
from qdrant_client.http import models

logger = logging.getLogger(__name__)


class QdrantRepository:
    def __init__(self, client: AsyncQdrantClient) -> None:
        self._client = client
        self.recipe_collection_name = "recipes"

    async def create_recipes_collection(self) -> None:
        if not await self._client.collection_exists(self.recipe_collection_name):
            await self._client.create_collection(
                collection_name=self.recipe_collection_name,
                vectors_config=models.VectorParams(size=1024, distance=models.Distance.COSINE),
            )

    async def add_recipe(self, recipe_id: int, embedding: list[float], payload: dict[str, Any] | None = None) -> None:
        await self._client.upsert(
            collection_name=self.recipe_collection_name,
            points=[
                models.PointStruct(
                    id=recipe_id,
                    vector=embedding,
                    payload=payload,
                )
            ],
        )

    async def delete_recipe(self, recipe_id: int) -> None:
        await self._client.delete(collection_name=self.recipe_collection_name, points_selector=[recipe_id])

    async def get_recommendations(
        self,
        query_vector: list[float],
        limit: int = 10,
        exclude_ids: list[int] | None = None,
    ) -> Any:
        filter_condition = None
        if exclude_ids:
            filter_condition = models.Filter(must_not=[models.HasIdCondition(has_id=exclude_ids)])
        return await self._client.query_points(
            collection_name=self.recipe_collection_name,
            query=query_vector,
            limit=limit,
            query_filter=filter_condition,
        )

    async def get_all_recipe_ids(self) -> list[int]:
        try:
            collection_info = await self._client.get_collection(self.recipe_collection_name)
            total_points = collection_info.points_count

            if total_points == 0:
                return []

            recipe_ids: list[int] = []
            offset = None

            while True:
                result = await self._client.scroll(
                    collection_name=self.recipe_collection_name,
                    limit=1000,
                    offset=offset,
                    with_payload=False,
                    with_vectors=False,
                )

                if not result[0]:
                    break

                recipe_ids.extend([point.id for point in result[0] if isinstance(point.id, int)])

                offset = result[1]

                if offset is None:
                    break
        except Exception:
            logger.exception("Error while getting all recipe ids")
            return []
        else:
            return recipe_ids

    async def get_recipe_embeddings(self, recipe_ids: list[int]) -> dict[int, list[float]]:
        result = await self._client.retrieve(
            collection_name=self.recipe_collection_name, ids=recipe_ids, with_vectors=True, with_payload=False
        )

        embeddings: dict[int, list[float]] = {}
        for point in result:
            if isinstance(point.id, int) and point.vector is not None and isinstance(point.vector, list):
                vector_floats = [float(x) for x in point.vector if isinstance(x, (int, float))]
                if len(vector_floats) == len(point.vector):
                    embeddings[point.id] = vector_floats

        return embeddings
