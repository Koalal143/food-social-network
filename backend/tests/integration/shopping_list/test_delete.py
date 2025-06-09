from collections import defaultdict

import pytest
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestShoppingListDeleteIntegration:
    async def test_delete_shopping_list_item_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        item_data = {"name": "Item to Delete", "quantity": "1 piece"}
        create_response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]

        response = await api_client.delete(f"/v1/shopping-list/{item_id}", headers=auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        get_response = await api_client.get(f"/v1/shopping-list/{item_id}", headers=auth_headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_shopping_list_item_not_found(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.delete("/v1/shopping-list/999999", headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "shopping_list_item_not_found"

    async def test_delete_shopping_list_item_unauthorized(self, api_client: AsyncClient):
        response = await api_client.delete("/v1/shopping-list/1")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"


class TestShoppingListBulkDeleteIntegration:
    async def test_bulk_delete_shopping_list_items_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        items_data = [
            {"name": "Item 1", "quantity": "1 piece"},
            {"name": "Item 2", "quantity": "2 pieces"},
            {"name": "Item 3", "quantity": "3 pieces"},
        ]

        item_ids: defaultdict[str, list[str]] = defaultdict(list)
        for item_data in items_data:
            response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)

            item_ids["item_ids"].append(str(response.json()["id"]))

        response = await api_client.delete("/v1/shopping-list/bulk", params=item_ids, headers=auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        for item in item_ids["item_ids"]:
            get_response = await api_client.get(f"/v1/shopping-list/{item}", headers=auth_headers)
            assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_bulk_delete_empty_list(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.delete("/v1/shopping-list/bulk", headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_bulk_delete_with_nonexistent_ids(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        item_data = {"name": "Existing Item", "quantity": "1 piece"}
        create_response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)
        existing_id = create_response.json()["id"]

        item_ids = {"item_ids": [str(existing_id), "999999", "888888"]}

        response = await api_client.delete("/v1/shopping-list/bulk", params=item_ids, headers=auth_headers)
        assert response.status_code == status.HTTP_204_NO_CONTENT

        get_response = await api_client.get(f"/v1/shopping-list/{existing_id}", headers=auth_headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_bulk_delete_unauthorized(self, api_client: AsyncClient):
        response = await api_client.delete("/v1/shopping-list/bulk", params={"id": [1, 2, 3]})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"


class TestShoppingListClearIntegration:
    async def test_clear_shopping_list_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        items_data = [
            {"name": "Item 1", "quantity": "1 piece"},
            {"name": "Item 2", "quantity": "2 pieces"},
            {"name": "Item 3", "quantity": "3 pieces"},
        ]

        for item_data in items_data:
            await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)

        list_response = await api_client.get("/v1/shopping-list", headers=auth_headers)
        assert len(list_response.json()) == len(items_data)

        response = await api_client.delete("/v1/shopping-list", headers=auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        list_response = await api_client.get("/v1/shopping-list", headers=auth_headers)
        assert list_response.json() == []
        assert list_response.headers.get("X-Total-Count") == str(len(list_response.json()))

    async def test_clear_empty_shopping_list(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.delete("/v1/shopping-list", headers=auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

    async def test_clear_shopping_list_unauthorized(self, api_client: AsyncClient):
        response = await api_client.delete("/v1/shopping-list")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"
