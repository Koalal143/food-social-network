from collections.abc import Sequence
from typing import Any

from sqlalchemy import Select, delete, exists, func, select, text, union_all, update
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import joinedload, selectinload

from src.models.favorite_recipes import FavoriteRecipe
from src.models.recipe import Recipe
from src.models.recipe_impression import RecipeImpression
from src.models.user import User
from src.models.user_profile import UserProfile
from src.typings.recipe_with_favorite import RecipeWithExtra


class RecipeRepository:
    def __init__(self, session: AsyncSession) -> None:
        self.session = session

    def _main_query(self) -> Select[tuple[Recipe]]:
        return select(Recipe).where(Recipe.is_published.is_(True))

    def _get_with_author_short(self) -> Select[tuple[Recipe]]:
        return select(Recipe).options(
            selectinload(Recipe.ingredients),
            selectinload(Recipe.instructions),
            selectinload(Recipe.tags),
            joinedload(Recipe.author)
            .load_only(User.id, User.username)
            .joinedload(User.profile)
            .load_only(UserProfile.avatar_url),
        )

    def _add_is_favorite_subquery(self, query: Select, user_id: int | None) -> Select:
        """Add a subquery to check if recipe is in user's favorites."""
        if user_id is None:
            return query

        favorite_subquery = (
            select(exists(FavoriteRecipe.id))
            .where(FavoriteRecipe.recipe_id == Recipe.id, FavoriteRecipe.user_id == user_id)
            .correlate(Recipe)
            .scalar_subquery()
            .label("is_on_favorites")
        )

        return query.add_columns(favorite_subquery)

    def _add_impressions_subquery(self, query: Select) -> Select:
        auth_impressions = (
            select(
                func.concat(text("'anonymous'"), RecipeImpression.anonymous_user_id).label("viewer_id"),
            )
            .where(RecipeImpression.anonymous_user_id.is_not(None), RecipeImpression.recipe_id == Recipe.id)
            .correlate(Recipe)
            .distinct()
        )
        anonymous_impressions = (
            select(
                func.concat(text("'user'"), RecipeImpression.user_id).label("viewer_id"),
            )
            .where(RecipeImpression.user_id.is_not(None), RecipeImpression.recipe_id == Recipe.id)
            .correlate(Recipe)
            .distinct()
        )
        impressions_union = union_all(auth_impressions, anonymous_impressions).subquery()
        impressions_subquery = (
            select(func.count(func.distinct(impressions_union.c.viewer_id)))
            .scalar_subquery()
            .label("impressions_count")
        )

        return query.add_columns(impressions_subquery)

    async def get_by_id(self, recipe_id: int, user_id: int | None = None) -> RecipeWithExtra | None:
        stmt = self._get_with_author_short().where(Recipe.id == recipe_id)
        stmt = self._add_impressions_subquery(stmt)
        if user_id is not None:
            stmt = self._add_is_favorite_subquery(stmt, user_id)
            result = await self.session.execute(stmt)
            row = result.first()
            if row is None:
                return None

            recipe, impressions_count, is_on_favorites = row
            recipe.is_on_favorites = bool(is_on_favorites)
            recipe.impressions_count = impressions_count
            return recipe

        result = await self.session.execute(stmt)
        row = result.first()
        if row:
            recipe, impressions_count = row
            recipe.is_on_favorites = False
            recipe.impressions_count = impressions_count
            return recipe
        return None

    async def get_by_ids(self, recipe_ids: Sequence[int]) -> Sequence[Recipe] | None:
        stmt = self._get_with_author_short().where(Recipe.id.in_(recipe_ids))  # TODO: add impressions and favorites
        result = await self.session.scalars(stmt)
        return result.all()

    async def _get_recipes_with_filters(
        self,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
        additional_filters: list[Any] | None = None,
        **filters: Any,
    ) -> tuple[Select, list[RecipeWithExtra]]:
        stmt = self._main_query().offset(skip).limit(limit)
        if filters:
            stmt = stmt.filter_by(**filters)

        if additional_filters:
            for filter_condition in additional_filters:
                stmt = stmt.where(filter_condition)

        stmt = self._add_impressions_subquery(stmt)
        recipes: list[RecipeWithExtra] = []
        if user_id is not None:
            stmt = self._add_is_favorite_subquery(stmt, user_id)
            result = await self.session.execute(stmt)
            for element in result.all():
                if not element:
                    continue
                recipe, impressions_count, is_on_favorites = element
                recipe.is_on_favorites = bool(is_on_favorites)
                recipe.impressions_count = impressions_count
                recipes.append(recipe)
        else:
            result = await self.session.execute(stmt)
            for element in result.all():
                if not element:
                    continue
                recipe, impressions_count = element
                recipe.impressions_count = impressions_count
                recipe.is_on_favorites = False
                recipes.append(recipe)

        return stmt, recipes

    async def _get_count_with_filters(self, additional_filters: list[Any] | None = None, **filters: Any) -> int:
        count_stmt = select(func.count(Recipe.id)).filter_by(**filters)
        if additional_filters:
            for filter_condition in additional_filters:
                count_stmt = count_stmt.where(filter_condition)

        count = await self.session.scalar(count_stmt)
        return count or 0

    async def get_all(
        self,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
        **filters: Any,
    ) -> tuple[int, Sequence[RecipeWithExtra]]:
        _, recipes = await self._get_recipes_with_filters(user_id=user_id, skip=skip, limit=limit, **filters)

        count = await self._get_count_with_filters(**filters)
        return count, recipes

    async def get_by_author_username(
        self,
        author_username: str,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
        **filters: Any,
    ) -> tuple[int, Sequence[RecipeWithExtra]]:
        author_filter = Recipe.author.has(User.username == author_username)

        _, recipes = await self._get_recipes_with_filters(
            user_id=user_id, skip=skip, limit=limit, additional_filters=[author_filter], **filters
        )

        count = await self._get_count_with_filters(additional_filters=[author_filter], **filters)

        return count, recipes

    async def get_by_author_id(
        self,
        author_id: int,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
        **filters: Any,
    ) -> tuple[int, Sequence[RecipeWithExtra]]:
        author_filter = Recipe.author.has(User.id == author_id)

        _, recipes = await self._get_recipes_with_filters(
            user_id=user_id,
            skip=skip,
            limit=limit,
            additional_filters=[author_filter],
            **filters,
        )

        count = await self._get_count_with_filters(
            additional_filters=[author_filter],
            **filters,
        )

        return count, recipes

    async def get_by_author_id(
        self,
        author_id: int,
        user_id: int | None = None,
        skip: int = 0,
        limit: int = 100,
    ) -> tuple[int, Sequence[RecipeWithFavorite]]:
        author_filter = Recipe.author.has(User.id == author_id)

        _, recipes = await self._get_recipes_with_filters(
            user_id=user_id,
            skip=skip,
            limit=limit,
            additional_filters=[author_filter],
        )

        count = await self._get_count_with_filters(
            additional_filters=[author_filter],
        )

        return count, recipes

    async def create(self, **fields: Any) -> Recipe:
        db_recipe = Recipe(**fields)
        self.session.add(db_recipe)
        await self.session.flush()
        await self.session.refresh(db_recipe)
        return db_recipe

    async def update(self, recipe_id: int, **fields: Any) -> Recipe | None:
        stmt = update(Recipe).where(Recipe.id == recipe_id).values(**fields)
        await self.session.execute(stmt)
        await self.session.flush()
        return await self.get_by_id(recipe_id=recipe_id)

    async def delete_by_id(self, recipe_id: int) -> None:
        stmt = delete(Recipe).where(Recipe.id == recipe_id)
        await self.session.execute(stmt)
        await self.session.flush()

    async def exists(self, recipe_id: int) -> bool:
        stmt = select(Recipe.id).where(Recipe.id == recipe_id).exists()
        final_stmt = select(stmt)
        result = await self.session.scalar(final_stmt)
        return bool(result)

    async def get_by_title(self, title: str) -> Recipe | None:
        stmt = select(Recipe).where(Recipe.title == title)
        result = await self.session.scalars(stmt)
        return result.first()

    async def get_by_slug(self, slug: str, user_id: int | None = None) -> RecipeWithExtra | None:
        stmt = self._get_with_author_short().where(Recipe.slug == slug)
        stmt = self._add_impressions_subquery(stmt)
        if user_id is not None:
            stmt = self._add_is_favorite_subquery(stmt, user_id)
            result = await self.session.execute(stmt)
            row = result.first()
            if row is None:
                return None

            recipe, impressions_count, is_on_favorites = row
            recipe.is_on_favorites = bool(is_on_favorites)
            recipe.impressions_count = impressions_count
            return recipe

        result = await self.session.execute(stmt)
        row = result.first()
        if row:
            recipe, impressions_count = row
            recipe.is_on_favorites = False
            recipe.impressions_count = impressions_count
        return recipe
