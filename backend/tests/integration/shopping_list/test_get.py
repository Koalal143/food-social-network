from datetime import UTC

import pytest
from dirty_equals import IsNow, IsPositiveInt
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestShoppingListGetIntegration:
    async def test_get_shopping_list_empty(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/shopping-list", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
        assert response.headers.get("X-Total-Count") == "0"

    async def test_get_shopping_list_with_items(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric,
    ):
        recipe = await recipe_fabric(
            auth_headers=auth_headers,
            title="Test Recipe for Shopping",
            ingredients=[
                {"name": "Tomatoes", "quantity": "2 pieces"},
                {"name": "Onions", "quantity": "1 piece"},
            ],
        )
        recipe_ingredient_id = recipe["ingredients"][0]["id"]

        item_data_1 = {
            "name": "Milk",
            "quantity": "1 liter",
        }
        item_data_2 = {
            "name": "Tomatoes",
            "quantity": "2 pieces",
            "recipe_ingredient_id": recipe_ingredient_id,
        }
        shopping_list_items_to_fetch = 2

        await api_client.post("/v1/shopping-list", json=item_data_1, headers=auth_headers)
        await api_client.post("/v1/shopping-list", json=item_data_2, headers=auth_headers)

        response = await api_client.get("/v1/shopping-list", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == shopping_list_items_to_fetch
        assert response.headers.get("X-Total-Count") == str(shopping_list_items_to_fetch)

        expected_first_item = {
            "name": "Tomatoes",
            "quantity": "2 pieces",
            "is_purchased": False,
            "is_actual": True,
            "recipe": {"id": recipe["id"], "title": recipe["title"], "slug": recipe["slug"]},
            "id": IsPositiveInt,
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }
        assert data[0] == expected_first_item

        expected_second_item = {
            "name": "Milk",
            "quantity": "1 liter",
            "is_purchased": False,
            "is_actual": True,
            "recipe": None,
            "id": IsPositiveInt,
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }
        assert data[1] == expected_second_item

    @pytest.mark.parametrize(
        ("skip", "limit", "expected_count"),
        [
            (0, 1, 1),
            (1, 2, 2),
            (0, 10, 3),
            (2, 5, 1),
        ],
        ids=[
            "first_item_only",
            "skip_first_get_two",
            "all_items",
            "skip_two_get_remaining",
        ],
    )
    async def test_get_shopping_list_pagination(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        skip: int,
        limit: int,
        expected_count: int,
    ):
        items_data = [
            {"name": "Item 1", "quantity": "1 piece"},
            {"name": "Item 2", "quantity": "2 pieces"},
            {"name": "Item 3", "quantity": "3 pieces"},
        ]

        for item_data in items_data:
            await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)

        response = await api_client.get(
            f"/v1/shopping-list?skip={skip}&limit={limit}",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == expected_count
        assert response.headers.get("X-Total-Count") == "3"

    async def test_get_shopping_list_only_not_purchased_filter(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        item_data_1 = {"name": "Milk", "quantity": "1 liter"}
        item_data_2 = {"name": "Bread", "quantity": "1 loaf"}

        response_1 = await api_client.post("/v1/shopping-list", json=item_data_1, headers=auth_headers)
        await api_client.post("/v1/shopping-list", json=item_data_2, headers=auth_headers)
        item_1_id = response_1.json()["id"]

        # Mark first item as purchased
        await api_client.post(f"/v1/shopping-list/{item_1_id}/toggle", headers=auth_headers)

        response = await api_client.get(
            "/v1/shopping-list?only_not_purchased=true",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert data[0]["name"] == "Bread"
        assert data[0]["is_purchased"] is False
        assert response.headers.get("X-Total-Count") == "1"

    async def test_get_shopping_list_unauthorized(self, api_client: AsyncClient):
        response = await api_client.get("/v1/shopping-list")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"


class TestShoppingListGetItemIntegration:
    async def test_get_shopping_list_item_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        item_data = {"name": "Test Item", "quantity": "1 piece"}
        create_response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]

        response = await api_client.get(f"/v1/shopping-list/{item_id}", headers=auth_headers)

        expected_response = {
            "id": item_id,
            "name": "Test Item",
            "quantity": "1 piece",
            "is_purchased": False,
            "is_actual": True,
            "recipe": None,
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == expected_response

    async def test_get_shopping_list_item_with_recipe(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric,
    ):
        recipe = await recipe_fabric(
            auth_headers=auth_headers,
            title="Test Recipe",
            ingredients=[{"name": "Test Ingredient", "quantity": "1 piece"}],
        )
        recipe_ingredient_id = recipe["ingredients"][0]["id"]

        item_data = {
            "name": "Test Ingredient",
            "quantity": "1 piece",
            "recipe_ingredient_id": recipe_ingredient_id,
        }
        create_response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]

        response = await api_client.get(f"/v1/shopping-list/{item_id}", headers=auth_headers)

        expected_response = {
            "id": item_id,
            "name": "Test Ingredient",
            "quantity": "1 piece",
            "is_purchased": False,
            "is_actual": True,
            "recipe": {"id": recipe["id"], "title": recipe["title"], "slug": recipe["slug"]},
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == expected_response

    async def test_get_shopping_list_item_not_found(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/shopping-list/999999", headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "shopping_list_item_not_found"

    async def test_get_shopping_list_item_unauthorized(self, api_client: AsyncClient):
        response = await api_client.get("/v1/shopping-list/1")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"

    async def test_get_shopping_list_item_belongs_to_other_user(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        # Create item with first user
        item_data = {"name": "Private Item", "quantity": "1 piece"}
        create_response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]

        # Login as different user
        other_user_data = {"username": "otheruser", "email": "other@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)
        login_response = await api_client.post(
            "/v1/auth/login", json={"email": "other@example.com", "password": "TestPass123!"}
        )
        other_auth_headers = {"Authorization": f"Bearer {login_response.json()['access_token']}"}

        response = await api_client.get(f"/v1/shopping-list/{item_id}", headers=other_auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "shopping_list_item_not_found"
