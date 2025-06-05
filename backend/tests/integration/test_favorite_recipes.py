import pytest
from dirty_equals import IsDatetime, IsStr, IsUrl
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestFavoriteRecipesIntegration:
    async def test_get_favorite_recipes_empty_list(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/favorite-recipes", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
        assert response.headers.get("X-Total-Count") == "0"

    async def test_add_recipe_to_favorites_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        payload = {"recipe_id": test_recipe["id"]}
        response = await api_client.post("/v1/favorite-recipes", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data == {
            "id": test_recipe["id"],
            "title": test_recipe["title"],
            "short_description": test_recipe["short_description"],
            "difficulty": test_recipe["difficulty"],
            "cook_time_minutes": test_recipe["cook_time_minutes"],
            "image_url": IsUrl(any_http_url=True),
            "impressions_count": 1,
            "is_on_favorites": True,
            "slug": IsStr(regex=r"^test-recipe-[0-9]-[a-f0-9]{8}$"),
            "author": {
                "id": test_recipe["author"]["id"],
                "username": test_recipe["author"]["username"],
                "profile": {
                    "avatar_url": None,
                },
            },
            "ingredients": test_recipe["ingredients"],
            "tags": test_recipe["tags"],
            "instructions": test_recipe["instructions"],
            "is_published": True,
            "created_at": IsDatetime(iso_string=True, delta=3),
            "updated_at": IsDatetime(iso_string=True, delta=3),
        }

        favorites_response = await api_client.get("/v1/favorite-recipes", headers=auth_headers)
        assert favorites_response.status_code == status.HTTP_200_OK
        favorites_data = favorites_response.json()
        assert len(favorites_data) == 1
        assert favorites_data[0]["id"] == test_recipe["id"]

    async def test_add_recipe_to_favorites_recipe_not_found(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        payload = {"recipe_id": 99999}
        response = await api_client.post("/v1/favorite-recipes", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert data["error_key"] == "recipe_not_found"
        assert "Recipe with id 99999 not found" in data["detail"]

    async def test_add_recipe_to_favorites_already_in_favorites(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        payload = {"recipe_id": test_recipe["id"]}
        await api_client.post("/v1/favorite-recipes", json=payload, headers=auth_headers)

        response = await api_client.post("/v1/favorite-recipes", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["error_key"] == "recipe_already_in_favorites"
        assert f"Recipe with id {test_recipe['id']} is already in favorites" in data["detail"]

    async def test_get_favorite_recipes_with_data(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        payload = {"recipe_id": test_recipe["id"]}
        await api_client.post("/v1/favorite-recipes", json=payload, headers=auth_headers)

        response = await api_client.get("/v1/favorite-recipes", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert response.headers.get("X-Total-Count") == "1"

        recipe_data = data[0]
        assert recipe_data == {
            "id": test_recipe["id"],
            "title": test_recipe["title"],
            "short_description": test_recipe["short_description"],
            "difficulty": test_recipe["difficulty"],
            "cook_time_minutes": test_recipe["cook_time_minutes"],
            "image_url": IsUrl(any_http_url=True),
            "impressions_count": test_recipe["impressions_count"],
            "is_on_favorites": True,
            "slug": IsStr(regex=r"^test-recipe-[0-9]-[a-f0-9]{8}$"),
        }

    async def test_get_favorite_recipes_pagination(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipes: list[dict],
    ):
        for recipe in test_recipes:
            payload = {"recipe_id": recipe["id"]}
            await api_client.post("/v1/favorite-recipes", json=payload, headers=auth_headers)
        page_limit = 2
        response = await api_client.get(f"/v1/favorite-recipes?limit={page_limit}&offset=0", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == page_limit
        assert response.headers.get("X-Total-Count") == str(len(test_recipes))

        response = await api_client.get(f"/v1/favorite-recipes?limit={page_limit}&offset=2", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == page_limit

    async def test_remove_recipe_from_favorites_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        payload = {"recipe_id": test_recipe["id"]}
        await api_client.post("/v1/favorite-recipes", json=payload, headers=auth_headers)

        response = await api_client.delete(f"/v1/favorite-recipes/{test_recipe['id']}", headers=auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        favorites_response = await api_client.get("/v1/favorite-recipes", headers=auth_headers)
        assert favorites_response.status_code == status.HTTP_200_OK
        favorites_data = favorites_response.json()
        assert len(favorites_data) == 0

    async def test_remove_recipe_from_favorites_not_in_favorites(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        response = await api_client.delete(f"/v1/favorite-recipes/{test_recipe['id']}", headers=auth_headers)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["error_key"] == "recipe_not_in_favorites"
        assert f"Recipe with id {test_recipe['id']} is not in favorites" in data["detail"]

    async def test_remove_recipe_from_favorites_recipe_not_found(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.delete("/v1/favorite-recipes/99999", headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert data["error_key"] == "recipe_not_found"
        assert "Recipe with id 99999 not found" in data["detail"]

    async def test_favorite_recipes_unauthorized(self, api_client: AsyncClient):
        response = await api_client.get("/v1/favorite-recipes")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        response = await api_client.post("/v1/favorite-recipes", json={"recipe_id": 1})
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

        response = await api_client.delete("/v1/favorite-recipes/1")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.parametrize(
        "payload",
        [
            {},
            {"recipe_id": "invalid"},
            {"recipe_id": -1},
            {"recipe_id": 0},
        ],
        ids=[
            "empty_payload",
            "invalid_recipe_id_string",
            "negative_recipe_id",
            "zero_recipe_id",
        ],
    )
    async def test_add_recipe_to_favorites_invalid_data(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        payload: dict,
    ):
        response = await api_client.post("/v1/favorite-recipes", json=payload, headers=auth_headers)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "recipe_id",
        [
            "invalid",
            "-1",
            "0",
        ],
        ids=[
            "invalid_string_id",
            "negative_string_id",
            "zero_string_id",
        ],
    )
    async def test_remove_recipe_invalid_id(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_id: str,
    ):
        response = await api_client.delete(f"/v1/favorite-recipes/{recipe_id}", headers=auth_headers)
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
