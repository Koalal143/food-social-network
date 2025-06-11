import pytest
from dirty_equals import IsDatetime, IsInt, IsStr, IsUrl
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeRetrieval:
    async def test_get_recipe_success(self, api_client: AsyncClient, test_recipe: dict):
        recipe_id = test_recipe["id"]

        response = await api_client.get(f"/v1/recipes/{recipe_id}")

        assert response.status_code == status.HTTP_200_OK
        recipe = response.json()
        assert recipe["id"] == recipe_id
        assert recipe["title"] == IsStr()
        assert recipe["slug"] == IsStr()
        assert recipe["short_description"] == IsStr()
        assert recipe["difficulty"] in ["EASY", "MEDIUM", "HARD"]
        assert recipe["cook_time_minutes"] == IsInt(gt=0)
        assert recipe["is_published"] is True
        assert recipe["image_url"] == IsUrl() or recipe["image_url"] is None
        assert recipe["impressions_count"] == IsInt(ge=0)
        assert recipe["is_on_favorites"] is False
        assert recipe["created_at"] == IsDatetime(iso_string=True, delta=3)
        assert recipe["updated_at"] == IsDatetime(iso_string=True, delta=3)
        assert "author" in recipe
        assert "ingredients" in recipe
        assert "tags" in recipe
        assert "instructions" in recipe

    async def test_get_recipe_not_found(self, api_client: AsyncClient):
        response = await api_client.get("/v1/recipes/999999")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "recipe_not_found"

    async def test_get_recipe_unpublished_by_other_user(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        recipe_data = {
            "title": "Unpublished Recipe",
            "short_description": "This recipe is not published",
            "difficulty": "EASY",
            "cook_time_minutes": 30,
            "ingredients": [{"name": "Test", "quantity": "1 piece"}],
            "tags": [{"name": "test"}],
        }

        create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
        assert create_response.status_code == status.HTTP_201_CREATED
        recipe_id = create_response.json()["id"]

        response = await api_client.get(f"/v1/recipes/{recipe_id}")

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "recipe_not_found"

    async def test_get_recipes_list_success(self, api_client: AsyncClient, test_recipes: list[dict]):
        response = await api_client.get("/v1/recipes/")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert isinstance(recipes, list)
        assert len(recipes) >= len(test_recipes)
        assert "X-Total-Count" in response.headers
        assert int(response.headers["X-Total-Count"]) >= len(test_recipes)

        for recipe in recipes:
            assert recipe["id"] == IsInt(gt=0)
            assert recipe["title"] == IsStr()
            assert recipe["slug"] == IsStr()

    async def test_get_recipes_list_pagination(self, api_client: AsyncClient, test_recipes: list[dict]):  # noqa: ARG002
        response = await api_client.get("/v1/recipes/?limit=2&offset=1")

        assert response.status_code == status.HTTP_200_OK
        recipes = response.json()
        assert len(recipes) <= 2  # noqa: PLR2004
        assert "X-Total-Count" in response.headers

    @pytest.mark.parametrize(
        ("limit", "offset"),
        [
            (-1, 0),
            (0, 0),
            (51, 0),
            (10, -1),
        ],
        ids=[
            "negative_limit",
            "zero_limit",
            "limit_too_high",
            "negative_offset",
        ],
    )
    async def test_get_recipes_list_validation_errors(self, api_client: AsyncClient, limit: int, offset: int):
        response = await api_client.get(f"/v1/recipes/?limit={limit}&offset={offset}")

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"
