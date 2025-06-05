import pytest
from dirty_equals import IsDatetime, IsStr, IsUrl
from fastapi import status
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestDislikedRecipesIntegration:
    async def test_get_disliked_recipes_empty_list(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/disliked-recipes", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
        assert response.headers.get("X-Total-Count") == "0"

    async def test_add_recipe_to_dislikes_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        payload = {"recipe_id": test_recipe["id"]}
        response = await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == test_recipe["id"]
        assert data["title"] == test_recipe["title"]
        assert data["short_description"] == test_recipe["short_description"]
        assert data["difficulty"] == test_recipe["difficulty"]
        assert data["cook_time_minutes"] == test_recipe["cook_time_minutes"]
        assert data["image_url"] == IsUrl(any_http_url=True)
        assert data["impressions_count"] == 1
        assert data["is_on_favorites"] is False
        assert data["slug"] == IsStr(regex=r"^test-recipe-[0-9]-[a-f0-9]{8}$")
        assert data["author"]["id"] == test_recipe["author"]["id"]
        assert data["author"]["username"] == test_recipe["author"]["username"]
        assert data["author"]["profile"]["avatar_url"] is None
        assert data["created_at"] == IsDatetime(iso_string=True, delta=3)
        assert data["updated_at"] == IsDatetime(iso_string=True, delta=3)
        assert "is_published" in data
        assert "tags" in data
        assert "ingredients" in data
        assert "instructions" in data

    async def test_add_recipe_to_dislikes_nonexistent_recipe(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        payload = {"recipe_id": 999999}
        response = await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert data["error_key"] == "recipe_not_found"

    async def test_add_recipe_to_dislikes_already_disliked(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        payload = {"recipe_id": test_recipe["id"]}
        await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        response = await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["error_key"] == "recipe_already_disliked"

    async def test_add_recipe_to_dislikes_removes_from_favorites(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        favorite_payload = {"recipe_id": test_recipe["id"]}
        await api_client.post("/v1/favorite-recipes", json=favorite_payload, headers=auth_headers)

        dislike_payload = {"recipe_id": test_recipe["id"]}
        response = await api_client.post("/v1/disliked-recipes", json=dislike_payload, headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["is_on_favorites"] is False

        favorites_response = await api_client.get("/v1/favorite-recipes", headers=auth_headers)
        assert favorites_response.status_code == status.HTTP_200_OK
        assert favorites_response.json() == []

    async def test_remove_recipe_from_dislikes_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        payload = {"recipe_id": test_recipe["id"]}
        await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        response = await api_client.delete(f"/v1/disliked-recipes/{test_recipe['id']}", headers=auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT
        assert response.content == b""

    async def test_remove_recipe_from_dislikes_nonexistent_recipe(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.delete("/v1/disliked-recipes/999999", headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        data = response.json()
        assert data["error_key"] == "recipe_not_found"

    async def test_remove_recipe_from_dislikes_not_disliked(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        response = await api_client.delete(f"/v1/disliked-recipes/{test_recipe['id']}", headers=auth_headers)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        data = response.json()
        assert data["error_key"] == "recipe_not_disliked"

    async def test_get_disliked_recipes_with_data(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        payload = {"recipe_id": test_recipe["id"]}
        await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        response = await api_client.get("/v1/disliked-recipes", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert response.headers.get("X-Total-Count") == "1"
        assert data[0] == {
            "id": test_recipe["id"],
            "title": test_recipe["title"],
            "short_description": test_recipe["short_description"],
            "difficulty": test_recipe["difficulty"],
            "cook_time_minutes": test_recipe["cook_time_minutes"],
            "image_url": IsUrl(any_http_url=True),
            "impressions_count": 0,
            "is_on_favorites": False,
            "slug": IsStr(regex=r"^test-recipe-[0-9]-[a-f0-9]{8}$"),
        }

    async def test_get_disliked_recipes_pagination(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipes: list[dict],
    ):
        for recipe in test_recipes:
            payload = {"recipe_id": recipe["id"]}
            await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        page_limit = 2
        response = await api_client.get(f"/v1/disliked-recipes?limit={page_limit}&offset=0", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == page_limit
        assert response.headers.get("X-Total-Count") == str(len(test_recipes))

        response_page_2 = await api_client.get(
            f"/v1/disliked-recipes?limit={page_limit}&offset=2", headers=auth_headers
        )
        assert response_page_2.status_code == status.HTTP_200_OK
        data_page_2 = response_page_2.json()
        assert len(data_page_2) == page_limit

        all_ids = [recipe["id"] for recipe in data] + [recipe["id"] for recipe in data_page_2]
        assert len(set(all_ids)) == len(all_ids)


class TestDislikedRecipesValidation:
    @pytest.mark.parametrize(
        "recipe_id",
        [
            "invalid",
            -1,
            0,
            None,
            [],
            {},
        ],
        ids=[
            "recipe_id_string",
            "recipe_id_negative",
            "recipe_id_zero",
            "recipe_id_none",
            "recipe_id_list",
            "recipe_id_dict",
        ],
    )
    async def test_add_recipe_to_dislikes_invalid_recipe_id(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_id,
    ):
        payload = {"recipe_id": recipe_id}
        response = await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert data["error_key"] == "validation_error"

    async def test_add_recipe_to_dislikes_missing_recipe_id(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        payload: dict[None, None] = {}
        response = await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert data["error_key"] == "validation_error"

    @pytest.mark.parametrize(
        "recipe_id",
        [
            "invalid",
            -1,
            0,
        ],
        ids=[
            "recipe_id_string",
            "recipe_id_negative",
            "recipe_id_zero",
        ],
    )
    async def test_remove_recipe_from_dislikes_invalid_recipe_id(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_id,
    ):
        response = await api_client.delete(f"/v1/disliked-recipes/{recipe_id}", headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert data["error_key"] == "validation_error"

    @pytest.mark.parametrize(
        ("offset", "limit"),
        [
            (-1, 10),
            (0, 0),
            (0, 51),
            (0, -1),
        ],
        ids=[
            "negative_offset",
            "zero_limit",
            "limit_too_large",
            "negative_limit",
        ],
    )
    async def test_get_disliked_recipes_invalid_pagination(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        offset,
        limit,
    ):
        response = await api_client.get(f"/v1/disliked-recipes?offset={offset}&limit={limit}", headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert data["error_key"] == "validation_error"


class TestDislikedRecipesAuthorization:
    async def test_get_disliked_recipes_unauthorized(self, api_client: AsyncClient):
        response = await api_client.get("/v1/disliked-recipes")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_add_recipe_to_dislikes_unauthorized(self, api_client: AsyncClient):
        payload = {"recipe_id": 1}
        response = await api_client.post("/v1/disliked-recipes", json=payload)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_remove_recipe_from_dislikes_unauthorized(self, api_client: AsyncClient):
        response = await api_client.delete("/v1/disliked-recipes/1")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_get_disliked_recipes_invalid_token(self, api_client: AsyncClient):
        headers = {"Authorization": "Bearer invalid_token"}
        response = await api_client.get("/v1/disliked-recipes", headers=headers)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_add_recipe_to_dislikes_invalid_token(self, api_client: AsyncClient):
        headers = {"Authorization": "Bearer invalid_token"}
        payload = {"recipe_id": 1}
        response = await api_client.post("/v1/disliked-recipes", json=payload, headers=headers)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_remove_recipe_from_dislikes_invalid_token(self, api_client: AsyncClient):
        headers = {"Authorization": "Bearer invalid_token"}
        response = await api_client.delete("/v1/disliked-recipes/1", headers=headers)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestDislikedRecipesBusinessLogic:
    async def test_dislike_recipe_multiple_users_isolation(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        user1_payload = {"recipe_id": test_recipe["id"]}
        await api_client.post("/v1/disliked-recipes", json=user1_payload, headers=auth_headers)

        user2_response = await api_client.post("/v1/auth/register", json={
            "username": "testuser2",
            "email": "test2@example.com",
            "password": "TestPass123!"
        })
        assert user2_response.status_code == status.HTTP_201_CREATED

        user2_login = await api_client.post("/v1/auth/login", json={
            "email": "test2@example.com",
            "password": "TestPass123!"
        })
        user2_token = user2_login.json()["access_token"]
        user2_headers = {"Authorization": f"Bearer {user2_token}"}

        user2_dislikes = await api_client.get("/v1/disliked-recipes", headers=user2_headers)
        assert user2_dislikes.status_code == status.HTTP_200_OK
        assert user2_dislikes.json() == []

        user2_payload = {"recipe_id": test_recipe["id"]}
        user2_dislike_response = await api_client.post(
            "/v1/disliked-recipes", json=user2_payload, headers=user2_headers
        )
        assert user2_dislike_response.status_code == status.HTTP_200_OK

        user1_dislikes = await api_client.get("/v1/disliked-recipes", headers=auth_headers)
        assert user1_dislikes.status_code == status.HTTP_200_OK
        assert len(user1_dislikes.json()) == 1

    async def test_dislike_and_undislike_recipe_cycle(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        payload = {"recipe_id": test_recipe["id"]}

        add_response = await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)
        assert add_response.status_code == status.HTTP_200_OK

        remove_response = await api_client.delete(f"/v1/disliked-recipes/{test_recipe['id']}", headers=auth_headers)
        assert remove_response.status_code == status.HTTP_204_NO_CONTENT

        add_again_response = await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)
        assert add_again_response.status_code == status.HTTP_200_OK

        dislikes_response = await api_client.get("/v1/disliked-recipes", headers=auth_headers)
        assert dislikes_response.status_code == status.HTTP_200_OK
        assert len(dislikes_response.json()) == 1

    async def test_dislike_recipe_ordering_by_creation_time(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipes: list[dict],
    ):
        recipe_ids = []
        for recipe in test_recipes[:3]:
            payload = {"recipe_id": recipe["id"]}
            await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)
            recipe_ids.append(recipe["id"])

        response = await api_client.get("/v1/disliked-recipes", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        returned_ids = [recipe["id"] for recipe in data]
        assert returned_ids == list(reversed(recipe_ids))

    async def test_get_disliked_recipes_pagination_edge_cases(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipes: list[dict],
    ):
        for recipe in test_recipes:
            payload = {"recipe_id": recipe["id"]}
            await api_client.post("/v1/disliked-recipes", json=payload, headers=auth_headers)

        response = await api_client.get(
            f"/v1/disliked-recipes?offset={len(test_recipes)}&limit=10", headers=auth_headers
        )
        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
        assert response.headers.get("X-Total-Count") == str(len(test_recipes))

        response = await api_client.get("/v1/disliked-recipes?offset=0&limit=1", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data) == 1
        assert response.headers.get("X-Total-Count") == str(len(test_recipes))

    async def test_dislike_recipe_with_malformed_json(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.post(
            "/v1/disliked-recipes",
            content="invalid json",
            headers={**auth_headers, "Content-Type": "application/json"}
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
