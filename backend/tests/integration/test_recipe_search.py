import pytest
from faker import Faker
from fastapi import status
from httpx import AsyncClient

fake = Faker()

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeSearch:
    async def test_search_recipes_without_params_success(self, api_client: AsyncClient, test_recipes: list[dict]):  # noqa: ARG002
        response = await api_client.get("/v1/recipes/search")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_by_query_success(self, api_client: AsyncClient, test_recipes: list[dict]):  # noqa: ARG002
        search_query = "Test Recipe"
        response = await api_client.get(f"/v1/recipes/search?query={search_query}")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_by_tags_success(self, api_client: AsyncClient, test_recipes: list[dict]):  # noqa: ARG002
        tag_name = "test0"
        response = await api_client.get(f"/v1/recipes/search?tags={tag_name}")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_by_include_ingredients_success(
        self, api_client: AsyncClient, test_recipes: list[dict]  # noqa: ARG002
    ):
        ingredient_name = "Test Ingredient 0"
        response = await api_client.get(f"/v1/recipes/search?include_ingredients={ingredient_name}")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_by_exclude_ingredients_success(
        self, api_client: AsyncClient, test_recipes: list[dict]  # noqa: ARG002
    ):
        ingredient_name = "NonExistentIngredient"
        response = await api_client.get(f"/v1/recipes/search?exclude_ingredients={ingredient_name}")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_by_cook_time_range_success(self, api_client: AsyncClient, test_recipes: list[dict]):  # noqa: ARG002
        cook_time_from = 25
        cook_time_to = 40
        response = await api_client.get(
            f"/v1/recipes/search?cook_time_from={cook_time_from}&cook_time_to={cook_time_to}"
        )

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_with_sorting_success(self, api_client: AsyncClient, test_recipes: list[dict]):  # noqa: ARG002
        response = await api_client.get("/v1/recipes/search?sort_by=-created_at")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_with_pagination_success(self, api_client: AsyncClient, test_recipes: list[dict]):  # noqa: ARG002
        limit = 2
        offset = 1
        response = await api_client.get(f"/v1/recipes/search?limit={limit}&offset={offset}")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) <= limit
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_combined_filters_success(self, api_client: AsyncClient, test_recipes: list[dict]):  # noqa: ARG002
        response = await api_client.get(
            "/v1/recipes/search?query=Test&cook_time_from=25&cook_time_to=50&limit=10&offset=0"
        )

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    @pytest.mark.parametrize(
        ("limit", "offset", "cook_time_from", "cook_time_to"),
        [
            (-1, 0, None, None),
            (51, 0, None, None),
            (10, -1, None, None),
            (10, 0, -1, None),
            (10, 0, None, -1),
        ],
        ids=[
            "negative_limit",
            "limit_too_high",
            "negative_offset",
            "negative_cook_time_from",
            "negative_cook_time_to",
        ],
    )
    async def test_search_recipes_validation_errors(
        self, api_client: AsyncClient, limit: int, offset: int, cook_time_from: int | None, cook_time_to: int | None
    ):
        params = []
        if limit is not None:
            params.append(f"limit={limit}")
        if offset is not None:
            params.append(f"offset={offset}")
        if cook_time_from is not None:
            params.append(f"cook_time_from={cook_time_from}")
        if cook_time_to is not None:
            params.append(f"cook_time_to={cook_time_to}")

        query_string = "&".join(params)
        response = await api_client.get(f"/v1/recipes/search?{query_string}")

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    async def test_search_recipes_zero_limit_success(self, api_client: AsyncClient):
        response = await api_client.get("/v1/recipes/search?limit=0")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == 0
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= 0

    async def test_search_recipes_empty_query_success(self, api_client: AsyncClient):
        response = await api_client.get("/v1/recipes/search?query=")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_nonexistent_query_success(self, api_client: AsyncClient):
        response = await api_client.get("/v1/recipes/search?query=NonExistentRecipeQuery12345")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == 0
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == 0

    async def test_search_recipes_multiple_tags_success(self, api_client: AsyncClient):
        response = await api_client.get("/v1/recipes/search?tags=test0&tags=test1")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_multiple_ingredients_success(self, api_client: AsyncClient):
        response = await api_client.get(
            "/v1/recipes/search?include_ingredients=Test Ingredient 0&include_ingredients=Test Ingredient 1"
        )

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count >= len(recipes)

    async def test_search_recipes_saves_query_for_authenticated_user(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipes: list[dict],  # noqa: ARG002
    ):
        search_query = "Test Recipe Search"
        response = await api_client.get(f"/v1/recipes/search?query={search_query}", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK

        history_response = await api_client.get("/v1/recipes/search/history", headers=auth_headers)
        assert history_response.status_code == status.HTTP_200_OK

        history = history_response.json()
        assert isinstance(history, list)
        assert len(history) >= 1
        assert any(item["query"] == search_query for item in history)
