from collections.abc import Sequence

from elasticsearch.dsl import Q
from sqlalchemy import delete, desc, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.adapters.search.indexes import RecipeIndex
from src.models.search_query import SearchQuery
from src.schemas.recipe import RecipeSearchQuery


class RecipeSearchRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

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
        search = RecipeIndex.search()
        await search.query(Q("term", id=recipe_id)).delete()

    async def save_search_query(
        self, query_text: str, user_id: int | None, anonymous_user_id: int | None
    ) -> SearchQuery:
        if not (user_id or anonymous_user_id):
            msg = "One of user_id or anonymous_user_id must be provided"
            raise ValueError(msg)
        stmt = insert(SearchQuery).values(
            query=query_text,
            user_id=user_id,
            anonymous_user_id=anonymous_user_id,
        )
        if user_id:
            stmt = stmt.on_conflict_do_update(
                index_elements=[SearchQuery.user_id, SearchQuery.query],
                set_={SearchQuery.updated_at: func.now()},
            )
        else:
            stmt = stmt.on_conflict_do_update(
                index_elements=[SearchQuery.anonymous_user_id, SearchQuery.query],
                set_={SearchQuery.updated_at: func.now()},
            )
        result = await self.session.scalars(stmt.returning(SearchQuery))
        return result.first()

    async def get_user_search_history(self, user_id: int, limit: int = 10, offset: int = 0) -> Sequence[SearchQuery]:
        stmt = (
            select(SearchQuery)
            .where(SearchQuery.user_id == user_id)
            .order_by(desc(SearchQuery.created_at))
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.scalars(stmt)
        return result.all()

    async def get_anonymous_search_history(
        self, anonymous_user_id: int, limit: int = 10, offset: int = 0
    ) -> Sequence[SearchQuery]:
        stmt = (
            select(SearchQuery)
            .where(SearchQuery.anonymous_user_id == anonymous_user_id)
            .order_by(desc(SearchQuery.created_at))
            .limit(limit)
            .offset(offset)
        )
        result = await self.session.scalars(stmt)
        return result.all()

    async def merge_search_queries(self, anonymous_user_id: int, user_id: int) -> None:
        user_searched_queries_subq = select(SearchQuery.query).where(SearchQuery.user_id == user_id).scalar_subquery()
        unique_update_stmt = (
            update(SearchQuery)
            .where(
                SearchQuery.anonymous_user_id == anonymous_user_id, SearchQuery.query.not_in(user_searched_queries_subq)
            )
            .values(user_id=user_id, anonymous_user_id=None)
        )
        update_duplicate_stmt = (
            update(SearchQuery)
            .where(SearchQuery.user_id == user_id, SearchQuery.query.in_(user_searched_queries_subq))
            .values(updated_at=SearchQuery.created_at)
        )
        delete_duplicate_stmt = delete(SearchQuery).where(
            SearchQuery.anonymous_user_id == anonymous_user_id, SearchQuery.query.in_(user_searched_queries_subq)
        )
        await self.session.execute(unique_update_stmt)
        await self.session.execute(update_duplicate_stmt)
        await self.session.execute(delete_duplicate_stmt)
        await self.session.flush()
