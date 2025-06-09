import pytest
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestShoppingListIsActualLogic:
    """Tests for the is_actual field logic with is_from_recipe."""

    async def test_item_without_recipe_is_always_actual(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        """Items created without recipe should always have is_actual = True."""
        item_data = {"name": "Manual Item", "quantity": "1 piece"}

        response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["is_actual"] is True
        assert data["recipe"] is None

    async def test_item_with_recipe_ingredient_is_actual(
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

        response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data["is_actual"] is True
        assert data["recipe"]["id"] == recipe["id"]

    async def test_bulk_create_mixed_items_actual_logic(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric,
    ):
        """Test bulk create with mix of recipe and non-recipe items."""
        recipe = await recipe_fabric(
            auth_headers=auth_headers,
            title="Mixed Recipe",
            ingredients=[
                {"name": "Recipe Item 1", "quantity": "1 piece"},
                {"name": "Recipe Item 2", "quantity": "2 pieces"},
            ],
        )

        bulk_data = {
            "items": [
                {
                    "name": "Recipe Item 1",
                    "quantity": "1 piece",
                    "recipe_ingredient_id": recipe["ingredients"][0]["id"],
                },
                {"name": "Manual Item", "quantity": "1 piece"},
                {
                    "name": "Recipe Item 2",
                    "quantity": "2 pieces",
                    "recipe_ingredient_id": recipe["ingredients"][1]["id"],
                },
            ]
        }

        response = await api_client.post("/v1/shopping-list/bulk", json=bulk_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert len(data) == len(bulk_data["items"])

        for item in data:
            assert item["is_actual"] is True

        recipe_items = [item for item in data if item["recipe"] is not None]
        recipe_item_should_fetch_number = 2
        manual_items = [item for item in data if item["recipe"] is None]
        manual_item_should_fetch_number = 1

        assert len(recipe_items) == recipe_item_should_fetch_number
        assert len(manual_items) == manual_item_should_fetch_number

        for item in recipe_items:
            assert item["recipe"]["id"] == recipe["id"]

    async def test_get_list_with_mixed_actual_items(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric,
    ):
        """Test getting shopping list with mixed recipe and manual items."""
        recipe = await recipe_fabric(
            auth_headers=auth_headers,
            title="List Test Recipe",
            ingredients=[{"name": "Recipe Ingredient", "quantity": "1 unit"}],
        )

        # Create manual item
        manual_item_data = {"name": "Manual Item", "quantity": "1 piece"}
        await api_client.post("/v1/shopping-list", json=manual_item_data, headers=auth_headers)

        # Create recipe item
        recipe_item_data = {
            "name": "Recipe Ingredient",
            "quantity": "1 unit",
            "recipe_ingredient_id": recipe["ingredients"][0]["id"],
        }
        await api_client.post("/v1/shopping-list", json=recipe_item_data, headers=auth_headers)
        total_shopping_list_items_count = 2

        response = await api_client.get("/v1/shopping-list", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == total_shopping_list_items_count

        for item in data:
            assert item["is_actual"] is True

        recipe_items = [item for item in data if item["recipe"] is not None]
        manual_items = [item for item in data if item["recipe"] is None]

        assert len(recipe_items) == 1
        assert len(manual_items) == 1
