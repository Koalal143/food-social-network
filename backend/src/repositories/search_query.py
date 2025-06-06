from collections.abc import Sequence

from sqlalchemy import delete, desc, func, select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from src.models.search_query import SearchQuery
from src.repositories.interfaces.search_query import SearchQueryRepositoryProtocol


class SearchQueryRepository(SearchQueryRepositoryProtocol):
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    async def save_search_query(
        self, query_text: str, user_id: int | None, anonymous_user_id: int | None
    ) -> SearchQuery | None:
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
        await self.session.flush()
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
