from datetime import UTC

import pytest
from dirty_equals import IsNow
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestShoppingListUpdateIntegration:
    async def test_update_shopping_list_item_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        item_data = {"name": "Original Item", "quantity": "1 piece"}
        create_response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]

        update_data = {
            "name": "Updated Item",
            "quantity": "2 pieces",
            "is_purchased": True,
        }

        response = await api_client.patch(f"/v1/shopping-list/{item_id}", json=update_data, headers=auth_headers)

        expected_response = {
            "id": item_id,
            "name": "Updated Item",
            "quantity": "2 pieces",
            "is_purchased": True,
            "is_actual": True,
            "recipe": None,
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == expected_response

    async def test_update_shopping_list_item_partial(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        item_data = {"name": "Original Item", "quantity": "1 piece"}
        create_response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]

        update_data = {"is_purchased": True}

        response = await api_client.patch(f"/v1/shopping-list/{item_id}", json=update_data, headers=auth_headers)

        expected_response = {
            "id": item_id,
            "name": "Original Item",
            "quantity": "1 piece",
            "is_purchased": True,
            "is_actual": True,
            "recipe": None,
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == expected_response

    async def test_update_shopping_list_item_not_found(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        update_data = {"name": "Updated Item"}

        response = await api_client.patch("/v1/shopping-list/999999", json=update_data, headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "shopping_list_item_not_found"

    async def test_update_shopping_list_item_unauthorized(self, api_client: AsyncClient):
        update_data = {"name": "Updated Item"}

        response = await api_client.patch("/v1/shopping-list/1", json=update_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"


class TestShoppingListToggleIntegration:
    async def test_toggle_shopping_list_item_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        item_data = {"name": "Toggle Item", "quantity": "1 piece"}
        create_response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]

        # Toggle to purchased
        response = await api_client.post(f"/v1/shopping-list/{item_id}/toggle", headers=auth_headers)

        expected_response = {
            "id": item_id,
            "name": "Toggle Item",
            "quantity": "1 piece",
            "is_purchased": True,
            "is_actual": True,
            "recipe": None,
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == expected_response

        # Toggle back to not purchased
        response = await api_client.post(f"/v1/shopping-list/{item_id}/toggle", headers=auth_headers)

        expected_response["is_purchased"] = False
        expected_response["updated_at"] = IsNow(iso_string=True, delta=3, tz=UTC)
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == expected_response

    async def test_toggle_shopping_list_item_not_found(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.post("/v1/shopping-list/999999/toggle", headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "shopping_list_item_not_found"

    async def test_toggle_shopping_list_item_unauthorized(self, api_client: AsyncClient):
        response = await api_client.post("/v1/shopping-list/1/toggle")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"
