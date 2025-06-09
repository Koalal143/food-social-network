from datetime import UTC

import pytest
from dirty_equals import IsNow, IsPositiveInt
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestShoppingListCreateIntegration:
    async def test_create_shopping_list_item_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        item_data = {
            "name": "Fresh Milk",
            "quantity": "2 liters",
        }

        response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)

        expected_response = {
            "name": "Fresh Milk",
            "quantity": "2 liters",
            "is_purchased": False,
            "is_actual": True,
            "recipe": None,
            "id": IsPositiveInt,
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json() == expected_response

    async def test_create_shopping_list_item_with_recipe_ingredient(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric,
    ):
        recipe = await recipe_fabric(
            auth_headers=auth_headers,
            title="Pasta Recipe",
            ingredients=[{"name": "Spaghetti", "quantity": "500g"}],
        )
        recipe_ingredient_id = recipe["ingredients"][0]["id"]

        item_data = {
            "name": "Spaghetti",
            "quantity": "500g",
            "recipe_ingredient_id": recipe_ingredient_id,
        }

        response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)

        expected_response = {
            "name": "Spaghetti",
            "quantity": "500g",
            "is_purchased": False,
            "is_actual": True,
            "recipe": {"id": recipe["id"], "title": recipe["title"]},
            "id": IsPositiveInt,
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json() == expected_response

    async def test_create_shopping_list_item_unauthorized(self, api_client: AsyncClient):
        item_data = {"name": "Milk", "quantity": "1 liter"}

        response = await api_client.post("/v1/shopping-list", json=item_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"


class TestShoppingListBulkCreateIntegration:
    async def test_bulk_create_shopping_list_items_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        bulk_data = {
            "items": [
                {"name": "Milk", "quantity": "1 liter"},
                {"name": "Bread", "quantity": "1 loaf"},
                {"name": "Eggs", "quantity": "12 pieces"},
            ]
        }

        response = await api_client.post("/v1/shopping-list/bulk", json=bulk_data, headers=auth_headers)
        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert len(data) == len(bulk_data["items"])

        # Check that all expected items are present (order may vary)
        item_names = [item["name"] for item in data]
        assert set(item_names) == {"Milk", "Bread", "Eggs"}

        # Check structure of each item - all should be actual since they don't have recipe
        for item in data:
            assert item["is_purchased"] is False
            assert item["is_actual"] is True  # Items without recipe are always actual
            assert item["recipe"] is None
            assert item["id"] == IsPositiveInt
            assert item["created_at"] == IsNow(iso_string=True, delta=3, tz=UTC)
            assert item["updated_at"] == IsNow(iso_string=True, delta=3, tz=UTC)
            assert item["name"] in {"Milk", "Bread", "Eggs"}

            if item["name"] == "Milk":
                assert item["quantity"] == "1 liter"
            elif item["name"] == "Bread":
                assert item["quantity"] == "1 loaf"
            elif item["name"] == "Eggs":
                assert item["quantity"] == "12 pieces"

    async def test_bulk_create_with_recipe_ingredients(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric,
    ):
        recipe = await recipe_fabric(
            auth_headers=auth_headers,
            title="Salad Recipe",
            ingredients=[
                {"name": "Lettuce", "quantity": "1 head"},
                {"name": "Tomatoes", "quantity": "3 pieces"},
            ],
        )

        bulk_data = {
            "items": [
                {
                    "name": "Lettuce",
                    "quantity": "1 head",
                    "recipe_ingredient_id": recipe["ingredients"][0]["id"],
                },
                {
                    "name": "Tomatoes",
                    "quantity": "3 pieces",
                    "recipe_ingredient_id": recipe["ingredients"][1]["id"],
                },
                {"name": "Olive Oil", "quantity": "1 bottle"},
            ]
        }

        response = await api_client.post("/v1/shopping-list/bulk", json=bulk_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert len(data) == len(bulk_data["items"])

        assert data[0]["is_actual"] is True
        assert data[0]["recipe"]["id"] == recipe["id"]
        assert data[1]["is_actual"] is True
        assert data[1]["recipe"]["id"] == recipe["id"]

        assert data[2]["is_actual"] is True
        assert data[2]["recipe"] is None

    async def test_bulk_create_with_nonexistent_recipe_ingredient(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        bulk_data = {
            "items": [
                {
                    "name": "Nonexistent Item",
                    "quantity": "1 piece",
                    "recipe_ingredient_id": 999999,
                }
            ]
        }

        response = await api_client.post("/v1/shopping-list/bulk", json=bulk_data, headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "recipe_ingredient_not_found"

    async def test_bulk_create_empty_list(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        bulk_data: dict[str, list] = {"items": []}

        response = await api_client.post("/v1/shopping-list/bulk", json=bulk_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
