import asyncio

from src.core.di import container
from src.repositories.qdrant import QdrantRepository


async def main() -> None:
    async with container() as request_container:
        qdrant_repository = await request_container.get(QdrantRepository)
        await qdrant_repository.create_recipes_collection()


if __name__ == "__main__":
    asyncio.run(main())
