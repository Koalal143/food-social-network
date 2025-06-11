import asyncio

import pytest
from faker import Faker
from fastapi import status
from httpx import AsyncClient

fake = Faker()

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeDeletion:
    async def test_delete_recipe_success(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        recipe_data = {
            "title": "Recipe to Delete",
            "short_description": "This recipe will be deleted",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
        }

        create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
        assert create_response.status_code == status.HTTP_201_CREATED
        recipe_id = create_response.json()["id"]

        response = await api_client.delete(f"/v1/recipes/{recipe_id}", headers=auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Give Elasticsearch time to process the deletion
        await asyncio.sleep(0.1)

        get_response = await api_client.get(f"/v1/recipes/{recipe_id}")
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_recipe_not_found(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        response = await api_client.delete("/v1/recipes/999999", headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "recipe_not_found"

    async def test_delete_recipe_without_auth(self, api_client: AsyncClient, test_recipe: dict):
        recipe_id = test_recipe["id"]

        response = await api_client.delete(f"/v1/recipes/{recipe_id}")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"

    async def test_delete_recipe_by_other_user(self, api_client: AsyncClient, test_recipe: dict):
        recipe_id = test_recipe["id"]

        other_user_data = {"username": fake.user_name(), "email": fake.email(), "password": "TestPass123!"}
        register_response = await api_client.post("/v1/auth/register", json=other_user_data)
        assert register_response.status_code == status.HTTP_201_CREATED

        login_data = {"email": other_user_data["email"], "password": "TestPass123!"}
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        assert login_response.status_code == status.HTTP_200_OK
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}

        response = await api_client.delete(f"/v1/recipes/{recipe_id}", headers=other_headers)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.json()["error_key"] == "recipe_belongs_to_other_user"
