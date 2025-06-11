import pytest
from fastapi import status
from httpx import AsyncClient

from tests.fixtures.recipes import RecipeFabricProtocol

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeSearch:
    async def test_search_recipes_without_params_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        recipes = [
            await recipe_fabric(auth_headers=auth_headers, title="Pasta Carbonara"),
            await recipe_fabric(auth_headers=auth_headers, title="Chicken Curry"),
            await recipe_fabric(auth_headers=auth_headers, title="Chocolate Cake"),
        ]
        response = await api_client.get("/v1/recipes/search")

        assert response.status_code == status.HTTP_200_OK
        recipes_retrieved = response.json()
        assert isinstance(recipes_retrieved, list)
        assert len(recipes_retrieved) == len(recipes)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == len(recipes)

    async def test_search_recipes_by_query_success(
        self, api_client: AsyncClient, recipe_fabric: RecipeFabricProtocol, auth_headers: dict[str, str]
    ):
        await recipe_fabric(auth_headers=auth_headers, title="Delicious Pasta Recipe")
        await recipe_fabric(auth_headers=auth_headers, title="Amazing Pasta Carbonara")
        await recipe_fabric(auth_headers=auth_headers, title="Chicken Curry")

        params = {"query": "Pasta"}
        recipes_should_match = 2
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == recipes_should_match  # Only recipes with "Pasta" in title should match
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == recipes_should_match

    async def test_search_recipes_by_tags_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        await recipe_fabric(
            auth_headers=auth_headers, title="Italian Pasta", tags=[{"name": "italian"}, {"name": "pasta"}]
        )
        await recipe_fabric(
            auth_headers=auth_headers, title="Chinese Noodles", tags=[{"name": "chinese"}, {"name": "noodles"}]
        )
        await recipe_fabric(auth_headers=auth_headers, title="French Soup", tags=[{"name": "french"}, {"name": "soup"}])

        params = {"tags": "italian"}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == 1  # Only recipe with "italian" tag should match
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == 1

    async def test_search_recipes_by_include_ingredients_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        recipes = [
            await recipe_fabric(
                auth_headers=auth_headers,
                title="Tomato Pasta",
                ingredients=[{"name": "tomato", "quantity": "2 pieces"}],
            ),
            await recipe_fabric(
                auth_headers=auth_headers, title="Cheese Pizza", ingredients=[{"name": "cheese", "quantity": "100g"}]
            ),
            await recipe_fabric(
                auth_headers=auth_headers, title="Tomato Soup", ingredients=[{"name": "tomato", "quantity": "3 pieces"}]
            ),
        ]

        params = {"include_ingredients": "tomato"}
        recipes_should_match = 2
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == recipes_should_match  # Only recipes with "tomato" ingredient should match
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == recipes_should_match

    async def test_search_recipes_by_exclude_ingredients_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        await recipe_fabric(
            auth_headers=auth_headers, title="Meat Stew", ingredients=[{"name": "beef", "quantity": "500g"}]
        )
        await recipe_fabric(
            auth_headers=auth_headers, title="Vegetable Soup", ingredients=[{"name": "carrot", "quantity": "2 pieces"}]
        )

        params = {"exclude_ingredients": "beef"}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == 1  # Only recipe without "beef" should match
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == 1

    async def test_search_recipes_by_cook_time_range_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        await recipe_fabric(auth_headers=auth_headers, title="Quick Snack", cook_time_minutes=15)
        await recipe_fabric(auth_headers=auth_headers, title="Medium Dish", cook_time_minutes=30)
        await recipe_fabric(auth_headers=auth_headers, title="Long Recipe", cook_time_minutes=60)

        params = {"cook_time_from": "25", "cook_time_to": "40"}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == 1  # Only "Medium Dish" (30 minutes) should match
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == 1

    async def test_search_recipes_with_sorting_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        recipes = [
            await recipe_fabric(auth_headers=auth_headers, title="First Recipe"),
            await recipe_fabric(auth_headers=auth_headers, title="Second Recipe"),
            await recipe_fabric(auth_headers=auth_headers, title="Third Recipe"),
        ]

        params = {"sort_by": "-created_at"}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes_retrieved = response.json()
        assert isinstance(recipes_retrieved, list)
        assert len(recipes_retrieved) == len(recipes)  # All recipes returned, sorted by creation date
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == len(recipes)

    async def test_search_recipes_with_pagination_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        recipes = [
            await recipe_fabric(auth_headers=auth_headers, title="Recipe 1"),
            await recipe_fabric(auth_headers=auth_headers, title="Recipe 2"),
            await recipe_fabric(auth_headers=auth_headers, title="Recipe 3"),
            await recipe_fabric(auth_headers=auth_headers, title="Recipe 4"),
        ]

        params = {"limit": "2", "offset": "1"}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes_retrieved = response.json()
        assert isinstance(recipes_retrieved, list)
        assert len(recipes_retrieved) == int(params["limit"])  # Should return 2 recipes with offset 1
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == len(recipes)

    async def test_search_recipes_combined_filters_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        await recipe_fabric(auth_headers=auth_headers, title="Test Quick Recipe", cook_time_minutes=30)
        await recipe_fabric(auth_headers=auth_headers, title="Test Long Recipe", cook_time_minutes=60)
        await recipe_fabric(auth_headers=auth_headers, title="Other Quick Recipe", cook_time_minutes=35)

        params = {
            "query": "Test",
            "cook_time_from": "25",
            "cook_time_to": "50",
            "limit": "10",
            "offset": "0",
        }
        recipes_will_match = 2
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == recipes_will_match  # Only "Test Quick Recipe" matches both query and cook time
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == recipes_will_match

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
        params: dict[str, str] = {}
        if limit is not None:
            params["limit"] = str(limit)
        if offset is not None:
            params["offset"] = str(offset)
        if cook_time_from is not None:
            params["cook_time_from"] = str(cook_time_from)
        if cook_time_to is not None:
            params["cook_time_to"] = str(cook_time_to)

        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    async def test_search_recipes_zero_limit_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        recipes = [
            await recipe_fabric(auth_headers=auth_headers, title="Recipe 1"),
            await recipe_fabric(auth_headers=auth_headers, title="Recipe 2"),
        ]
        params = {"limit": "0"}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes_retrieved = response.json()
        assert isinstance(recipes_retrieved, list)
        assert len(recipes_retrieved) == 0  # No recipes returned due to limit=0
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == len(recipes)  # Total count should reflect all available recipes

    async def test_search_recipes_empty_query_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        recipes = [
            await recipe_fabric(auth_headers=auth_headers, title="Recipe A"),
            await recipe_fabric(auth_headers=auth_headers, title="Recipe B"),
            await recipe_fabric(auth_headers=auth_headers, title="Recipe C"),
        ]
        params = {"query": ""}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes_retrieved = response.json()
        assert isinstance(recipes_retrieved, list)
        assert len(recipes_retrieved) == len(recipes)  # Empty query returns all recipes
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == len(recipes)

    async def test_search_recipes_nonexistent_query_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        await recipe_fabric(auth_headers=auth_headers, title="Normal Recipe")

        params = {"query": "NonExistentRecipeQuery12345"}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == 0
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == 0

    async def test_search_recipes_multiple_tags_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        recipes = [
            await recipe_fabric(auth_headers=auth_headers, title="Italian Recipe", tags=[{"name": "italian"}]),
            await recipe_fabric(auth_headers=auth_headers, title="Vegetarian Recipe", tags=[{"name": "vegetarian"}]),
        ]
        params = {"tags": ["italian", "vegetarian"]}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes_retrieved = response.json()
        assert isinstance(recipes_retrieved, list)
        assert len(recipes_retrieved) == len(recipes)
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == len(recipes)

    async def test_search_recipes_multiple_ingredients_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str], recipe_fabric: RecipeFabricProtocol
    ):
        await recipe_fabric(
            auth_headers=auth_headers, title="Tomato Recipe", ingredients=[{"name": "tomato", "quantity": "2 pieces"}]
        )
        await recipe_fabric(
            auth_headers=auth_headers, title="Cheese Recipe", ingredients=[{"name": "cheese", "quantity": "100g"}]
        )

        params = {"include_ingredients": ["tomato", "cheese"]}
        response = await api_client.get("/v1/recipes/search", params=params)

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) == 0
        assert "X-Total-Count" in response.headers
        total_count = int(response.headers["X-Total-Count"])
        assert total_count == 0

    async def test_search_recipes_saves_query_for_authenticated_user(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        await recipe_fabric(auth_headers=auth_headers, title="Test Recipe for Search History")

        params = {"query": "Test Recipe Search"}
        await api_client.get("/v1/recipes/search", params=params, headers=auth_headers)

        history_response = await api_client.get("/v1/recipes/search/history", headers=auth_headers)
        assert history_response.status_code == status.HTTP_200_OK

        history = history_response.json()
        assert isinstance(history, list)
        assert len(history) == 1  # Exactly one search query saved
        assert history[0]["query"] == "Test Recipe Search"
