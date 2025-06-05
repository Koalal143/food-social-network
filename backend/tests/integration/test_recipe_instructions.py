import pytest
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeInstructionsUploadUrls:
    async def test_get_upload_instructions_urls_success(self, api_client: AsyncClient, auth_headers: dict[str, str]):
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

        steps = [1, 2, 3]

        response = await api_client.post(
            f"/v1/recipes/{recipe_id}/instructions/upload-urls", json=steps, headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        upload_urls = response.json()
        assert len(upload_urls) == len(steps)
        for i, upload_url in enumerate(upload_urls):
            assert upload_url["step_number"] == steps[i]
            assert "url" in upload_url
            assert "fields" in upload_url

    async def test_get_upload_instructions_urls_without_auth(self, api_client: AsyncClient, test_recipe: dict):
        recipe_id = test_recipe["id"]
        steps = [1, 2]

        response = await api_client.post(f"/v1/recipes/{recipe_id}/instructions/upload-urls", json=steps)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        assert response.json()["error_key"] == "invalid_token"

    @pytest.mark.parametrize(
        "steps",
        [
            [0],
            [-1],
        ],
        ids=[
            "step_zero",
            "step_negative",
        ],
    )
    async def test_get_upload_instructions_urls_validation_errors(
        self, api_client: AsyncClient, auth_headers: dict[str, str], steps: list[int]
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

        response = await api_client.post(
            f"/v1/recipes/{recipe_id}/instructions/upload-urls", json=steps, headers=auth_headers
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    @pytest.mark.parametrize(
        "steps",
        [
            [26],
            list(range(1, 27)),
            [1, 1],  # duplicate steps
        ],
        ids=[
            "step_too_high",
            "too_many_steps",
            "duplicate_steps",
        ],
    )
    async def test_get_upload_instructions_urls_business_logic_errors(
        self, api_client: AsyncClient, auth_headers: dict[str, str], steps: list[int]
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

        response = await api_client.post(
            f"/v1/recipes/{recipe_id}/instructions/upload-urls", json=steps, headers=auth_headers
        )

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.json()["error_key"] == "attach_instruction_step"
