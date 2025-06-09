import pytest
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestShoppingListValidation:
    @pytest.mark.parametrize(
        ("payload", "expected_field"),
        [
            ({"quantity": "1 piece"}, "name"),
            ({"name": "Test Item"}, "quantity"),
            ({}, "name"),
        ],
        ids=[
            "missing_name",
            "missing_quantity",
            "missing_both_fields",
        ],
    )
    async def test_create_shopping_list_item_missing_required_fields(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        payload: dict,
        expected_field: str,
    ):
        response = await api_client.post("/v1/shopping-list", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert data["error_key"] == "validation_error"
        assert expected_field in str(data["detail"])

    @pytest.mark.parametrize(
        ("name", "quantity"),
        [
            ("", "1 piece"),
            (None, "1 piece"),
            (123, "1 piece"),
            ("Test Item", 123),
            ([], "1 piece"),
            ("Test Item", []),
        ],
        ids=[
            "empty_name",
            "null_name",
            "integer_name",
            "integer_quantity",
            "list_name",
            "list_quantity",
        ],
    )
    async def test_create_shopping_list_item_invalid_field_types(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        name,
        quantity,
    ):
        payload = {"name": name, "quantity": quantity}

        response = await api_client.post("/v1/shopping-list", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    @pytest.mark.parametrize(
        "recipe_ingredient_id",
        [
            "invalid",
            -1,
            0,
            [],
            {},
        ],
        ids=[
            "string_recipe_ingredient_id",
            "negative_recipe_ingredient_id",
            "zero_recipe_ingredient_id",
            "list_recipe_ingredient_id",
            "dict_recipe_ingredient_id",
        ],
    )
    async def test_create_shopping_list_item_invalid_recipe_ingredient_id(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_ingredient_id,
    ):
        payload = {
            "name": "Test Item",
            "quantity": "1 piece",
            "recipe_ingredient_id": recipe_ingredient_id,
        }

        response = await api_client.post("/v1/shopping-list", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    @pytest.mark.parametrize(
        ("skip", "limit"),
        [
            (-1, 10),
            (0, 0),
            (0, 101),
            ("invalid", 10),
            (0, "invalid"),
        ],
        ids=[
            "negative_skip",
            "zero_limit",
            "limit_too_large",
            "invalid_skip_type",
            "invalid_limit_type",
        ],
    )
    async def test_get_shopping_list_invalid_pagination_params(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        skip,
        limit,
    ):
        response = await api_client.get(
            f"/v1/shopping-list?skip={skip}&limit={limit}",
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    async def test_bulk_create_too_many_items(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        items = [{"name": f"Item {i}", "quantity": "1 piece"} for i in range(26)]
        bulk_data = {"items": items}

        response = await api_client.post("/v1/shopping-list/bulk", json=bulk_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    async def test_update_shopping_list_item_invalid_is_purchased_type(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        item_data = {"name": "Test Item", "quantity": "1 piece"}
        create_response = await api_client.post("/v1/shopping-list", json=item_data, headers=auth_headers)
        item_id = create_response.json()["id"]

        update_data = {"is_purchased": "invalid"}

        response = await api_client.patch(f"/v1/shopping-list/{item_id}", json=update_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    async def test_create_shopping_list_item_with_malformed_json(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.post(
            "/v1/shopping-list",
            content="invalid json",
            headers={**auth_headers, "Content-Type": "application/json"},
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
