import pytest
from dirty_equals import IsDatetime
from faker import Faker
from fastapi import status
from freezegun import freeze_time
from httpx import AsyncClient

fake = Faker()

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeUpdate:
    async def test_update_recipe_success(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        recipe_data = {
            "title": "Original Recipe",
            "short_description": "Original description",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
        }

        create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
        assert create_response.status_code == status.HTTP_201_CREATED
        recipe_id = create_response.json()["id"]

        update_data = {
            "title": "Updated Recipe Title",
            "short_description": "Updated description",
            "difficulty": "HARD",
            "cook_time_minutes": 45,
        }

        response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_data, headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        recipe = response.json()
        assert recipe["title"] == update_data["title"]
        assert recipe["short_description"] == update_data["short_description"]
        assert recipe["difficulty"] == update_data["difficulty"]
        assert recipe["cook_time_minutes"] == update_data["cook_time_minutes"]

    async def test_update_recipe_with_timestamp_change(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        recipe_data = {
            "title": "Test Recipe",
            "short_description": "Test description",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
        }

        with freeze_time("2024-01-01 12:00:00") as frozen_time:
            create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
            assert create_response.status_code == status.HTTP_201_CREATED
            recipe_id = create_response.json()["id"]
            original_updated_at = create_response.json()["updated_at"]

            frozen_time.tick(delta=60)

            update_data = {"title": "Updated Recipe Title"}
            response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_data, headers=auth_headers)

            assert response.status_code == status.HTTP_200_OK
            recipe = response.json()
            assert recipe["updated_at"] != original_updated_at
            assert recipe["updated_at"] == IsDatetime(iso_string=True, delta=3)

    async def test_update_recipe_publish_without_image_and_instructions(
        self, api_client: AsyncClient, auth_headers: dict[str, str]
    ):
        recipe_data = {
            "title": "Test Recipe",
            "short_description": "Test description",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
        }

        create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
        assert create_response.status_code == status.HTTP_201_CREATED
        recipe_id = create_response.json()["id"]

        update_data = {"is_published": True}

        response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_data, headers=auth_headers)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        error = response.json()
        assert error["error_key"] in ["instructions_required_to_publish", "image_required_to_publish"]

    async def test_update_recipe_not_found(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        update_data = {"title": "Updated Title"}

        response = await api_client.patch("/v1/recipes/999999", json=update_data, headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "recipe_not_found"

    async def test_update_recipe_without_auth(self, api_client: AsyncClient, test_recipe: dict):
        recipe_id = test_recipe["id"]
        update_data = {"title": "Updated Title"}

        response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"

    async def test_update_recipe_by_other_user(self, api_client: AsyncClient, test_recipe: dict):
        recipe_id = test_recipe["id"]

        other_user_data = {"username": fake.user_name(), "email": fake.email(), "password": "TestPass123!"}
        register_response = await api_client.post("/v1/auth/register", json=other_user_data)
        assert register_response.status_code == status.HTTP_201_CREATED

        login_data = {"email": other_user_data["email"], "password": "TestPass123!"}
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        assert login_response.status_code == status.HTTP_200_OK
        other_token = login_response.json()["access_token"]
        other_headers = {"Authorization": f"Bearer {other_token}"}

        update_data = {"title": "Updated Title"}

        response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_data, headers=other_headers)

        assert response.status_code == status.HTTP_403_FORBIDDEN
        assert response.json()["error_key"] == "recipe_belongs_to_other_user"

    @pytest.mark.parametrize(
        ("field", "value"),
        [
            ("title", ""),
            ("title", "a" * 136),
            ("short_description", ""),
            ("short_description", "a" * 256),
            ("difficulty", "INVALID"),
            ("cook_time_minutes", 0),
            ("cook_time_minutes", -5),
        ],
        ids=[
            "empty_title",
            "title_too_long",
            "empty_description",
            "description_too_long",
            "invalid_difficulty",
            "zero_cook_time",
            "negative_cook_time",
        ],
    )
    async def test_update_recipe_validation_errors(
        self, api_client: AsyncClient, auth_headers: dict[str, str], field: str, value
    ):
        recipe_data = {
            "title": "Test Recipe",
            "short_description": "Test description",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
        }

        create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
        assert create_response.status_code == status.HTTP_201_CREATED
        recipe_id = create_response.json()["id"]

        update_data = {field: value}

        response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"
