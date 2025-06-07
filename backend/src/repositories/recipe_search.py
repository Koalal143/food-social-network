import logging

from elasticsearch import AsyncElasticsearch
from elasticsearch.dsl import Q

from src.adapters.search.indexes import RecipeIndex
from src.repositories.interfaces.recipe_search import RecipeSearchRepositoryProtocol
from src.schemas.recipe import RecipeSearchQuery

logger = logging.getLogger(__name__)


class RecipeSearchRepository(RecipeSearchRepositoryProtocol):
    def __init__(self, es_client: AsyncElasticsearch) -> None:
        self.es_client = es_client

    async def search_recipes(self, params: RecipeSearchQuery) -> tuple[int, list[int]]:
        search = RecipeIndex.search()

        must_queries = []
        must_not_queries = []
        filter_queries = []
        must_queries.append(Q("term", is_published=True))
        if params.query:
            text_query = Q("multi_match", query=params.query, fields=["title", "short_description"])
            must_queries.append(text_query)
            logger.info(
                "Text search query: '%s' - using multi_match on fields: ['title', 'short_description']", params.query
            )

        if params.tags:
            filter_queries.append(Q("terms", tags=params.tags))

        if params.include_ingredients:
            include_ingredients_list = [Q("match", ingredients=ingredient) for ingredient in params.include_ingredients]
            must_queries.extend(include_ingredients_list)
            logger.info("Include ingredients: %s", params.include_ingredients)

        if params.exclude_ingredients:
            exclude_ingredients_list = [Q("match", ingredients=ingredient) for ingredient in params.exclude_ingredients]
            must_not_queries.extend(exclude_ingredients_list)

        if params.cook_time_from is not None or params.cook_time_to is not None:
            cook_range = {}
            if params.cook_time_from is not None:
                cook_range["gte"] = params.cook_time_from
            if params.cook_time_to is not None:
                cook_range["lte"] = params.cook_time_to
            filter_queries.append(Q("range", cook_time_minutes=cook_range))

        query = Q("bool", must=must_queries, must_not=must_not_queries, filter=filter_queries)

        search = search.query(query).extra(from_=params.offset, size=params.limit, track_total_hits=True)

        if params.sort_by:
            search = search.sort(params.sort_by)

        result = await search.execute()
        total = result.hits.total.value  # type: ignore[attr-defined]
        recipe_ids = [hit.to_dict()["id"] for hit in result]

        return total, recipe_ids

    async def index_recipe(self, recipe_data: dict) -> None:
        schema = recipe_data.copy()
        schema["_id"] = schema["id"]
        schema["tags"] = [tag["name"] for tag in schema.get("tags", [])]
        schema["ingredients"] = [ingredient["name"] for ingredient in schema.get("ingredients", [])]
        recipe_index = RecipeIndex(**schema)
        await recipe_index.save()

        await self.es_client.indices.refresh(index="recipes")

    async def delete_recipe(self, recipe_id: int) -> None:
        search = RecipeIndex.search()
        await search.query(Q("term", id=recipe_id)).delete()
