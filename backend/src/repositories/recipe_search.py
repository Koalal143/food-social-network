from elasticsearch.dsl import Q

from src.adapters.search.indexes import RecipeIndex
from src.schemas.recipe import RecipeSearchQuery


class RecipeSearchRepository:
    async def search_recipes(self, params: RecipeSearchQuery) -> tuple[int, list[int]]:
        search = RecipeIndex.search()

        must_queries = []
        must_not_queries = []
        filter_queries = []

        if params.query:
            must_queries.append(Q("multi_match", query=params.query, fields=["title", "short_description"]))

        if params.tags:
            filter_queries.append(Q("terms", tags=params.tags))

        if params.include_ingredients:
            include_ingredients_list = [Q("match", ingredients=ingredient) for ingredient in params.include_ingredients]
            must_queries.extend(include_ingredients_list)

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

        search = search.query(query).extra(from_=params.offset, size=params.limit)

        if params.sort_by:
            search = search.sort(params.sort_by)

        result = await search.execute()
        total = result.hits.total.value
        recipe_ids = [hit.to_dict()["id"] for hit in result]

        return total, recipe_ids

    async def index_recipe(self, recipe_data: dict) -> None:
        schema = recipe_data.copy()
        schema["tags"] = [tag["name"] for tag in schema.get("tags", [])]
        schema["ingredients"] = [ingredient["name"] for ingredient in schema.get("ingredients", [])]
        recipe_index = RecipeIndex(**schema)
        await recipe_index.save()

    async def delete_recipe(self, recipe_id: int) -> None:
        await RecipeIndex.delete(id=recipe_id)
        await RecipeIndex.save()
