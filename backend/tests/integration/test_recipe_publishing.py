import pytest
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipePublishing:
    async def test_publish_recipe_with_image_and_instructions_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str]
    ):
        recipe_data = {
            "title": "Recipe to Publish",
            "short_description": "This recipe will be published",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
            "instructions": [{"step_number": 1, "description": "Test instruction"}],
            "image_path": "images/recipes/test/main.jpg",
        }

        create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
        assert create_response.status_code == status.HTTP_201_CREATED
        recipe_id = create_response.json()["id"]

        update_data = {"is_published": True}

        response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_data, headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        recipe = response.json()
        assert recipe["is_published"] is True

    async def test_publish_recipe_without_instructions_fails(
        self, api_client: AsyncClient, auth_headers: dict[str, str]
    ):
        recipe_data = {
            "title": "Recipe without Instructions",
            "short_description": "This recipe has no instructions",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
            "image_path": "images/recipes/test/main.jpg",
        }

        create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
        assert create_response.status_code == status.HTTP_201_CREATED
        recipe_id = create_response.json()["id"]

        update_data = {"is_published": True}

        response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_data, headers=auth_headers)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["error_key"] == "instructions_required_to_publish"

    async def test_publish_recipe_without_image_fails(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        recipe_data = {
            "title": "Recipe without Image",
            "short_description": "This recipe has no image",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
            "instructions": [{"step_number": 1, "description": "Test instruction"}],
        }

        create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
        assert create_response.status_code == status.HTTP_201_CREATED
        recipe_id = create_response.json()["id"]

        update_data = {"is_published": True}

        response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_data, headers=auth_headers)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["error_key"] == "image_required_to_publish"
