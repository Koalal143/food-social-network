from src.exceptions.recipe_search import UserIdentityNotProvidedError
from src.models.recipe import Recipe
from src.repositories.interfaces import (
    RecipeImageRepositoryProtocol,
    RecipeRepositoryProtocol,
    RecipeSearchRepositoryProtocol,
    SearchQueryRepositoryProtocol,
)
from src.schemas.recipe import RecipeReadShort, RecipeSearchQuery
from src.schemas.search_query import SearchQueryRead


class SearchService:
    def __init__(
        self,
        recipe_search_repository: RecipeSearchRepositoryProtocol,
        search_query_repository: SearchQueryRepositoryProtocol,
        recipe_repository: RecipeRepositoryProtocol,
        recipe_image_repository: RecipeImageRepositoryProtocol,
    ) -> None:
        self.recipe_search_repository = recipe_search_repository
        self.search_query_repository = search_query_repository
        self.recipe_repository = recipe_repository
        self.recipe_image_repository = recipe_image_repository

    async def _to_recipe_short_schema(self, recipe: Recipe) -> RecipeReadShort:
        schema = RecipeReadShort.model_validate(recipe, from_attributes=True)
        if recipe.image_path:
            schema.image_url = await self.recipe_image_repository.get_image_url(recipe.image_path)
        return schema

    async def search(
        self,
        params: RecipeSearchQuery,
        user_id: int | None = None,
        anonymous_user_id: int | None = None,
    ) -> tuple[int, list[RecipeReadShort]]:
        """
        Search recipes by different criteria using search engine.

        If user/anonymous_user is provided, it will be saved in the database for displaying user history.
        """
        # Save search query if there's a query text and user identification
        if params.query and (user_id or anonymous_user_id):
            await self.save_search_query(
                query_text=params.query,
                user_id=user_id,
                anonymous_user_id=anonymous_user_id,
            )

        total, recipe_ids = await self.recipe_search_repository.search_recipes(params)
        recipes = await self.recipe_repository.get_by_ids(recipe_ids=recipe_ids)
        recipes_short = [await self._to_recipe_short_schema(recipe) for recipe in recipes]
        return total, recipes_short

    async def save_search_query(
        self, query_text: str, user_id: int | None = None, anonymous_user_id: int | None = None
    ) -> SearchQueryRead:
        """
        Save a search query to the database for history tracking.

        Args:
            query_text: The search query text
            user_id: ID of authenticated user
            anonymous_user_id: ID of anonymous user

        Returns:
            SearchQueryRead: The saved search query

        Raises:
            UserIdentityNotProvidedError: If neither user_id nor anonymous_user_id is provided

        """
        if not (user_id or anonymous_user_id):
            msg = "Either user_id or anonymous_user_id must be provided"
            raise UserIdentityNotProvidedError(msg)

        search_query = await self.search_query_repository.save_search_query(
            query_text=query_text,
            user_id=user_id,
            anonymous_user_id=anonymous_user_id,
        )
        return SearchQueryRead.model_validate(search_query, from_attributes=True)

    async def get_search_history(
        self, user_id: int | None = None, anonymous_user_id: int | None = None, limit: int = 10, offset: int = 0
    ) -> list[SearchQueryRead]:
        """
        Get search history for a user or anonymous user.

        Args:
            user_id: ID of authenticated user
            anonymous_user_id: ID of anonymous user
            limit: Maximum number of search queries to return (default: 10)
            offset: Number of search queries to skip for pagination (default: 0)

        Returns:
            List of search queries ordered by creation date (newest first)

        Raises:
            UserIdentityNotProvidedError: If neither user_id nor anonymous_user_id is provided

        """
        if user_id:
            search_queries = await self.search_query_repository.get_user_search_history(user_id, limit, offset)
        elif anonymous_user_id:
            search_queries = await self.search_query_repository.get_anonymous_search_history(
                anonymous_user_id, limit, offset
            )
        else:
            msg = "Either user_id or anonymous_user_id must be provided"
            raise UserIdentityNotProvidedError(msg)

        return [SearchQueryRead.model_validate(query, from_attributes=True) for query in search_queries]

    async def merge_search_queries(self, anonymous_user_id: int, user_id: int) -> None:
        """
        Merge search queries from anonymous user to authenticated user.

        Args:
            anonymous_user_id: ID of anonymous user
            user_id: ID of authenticated user

        """
        await self.search_query_repository.merge_search_queries(anonymous_user_id=anonymous_user_id, user_id=user_id)
