import pytest
from dirty_equals import IsUUID
from faker import Faker
from fastapi import status
from httpx import AsyncClient

fake = Faker()

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestSearchHistory:
    async def test_get_search_history_authenticated_user_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str]
    ):
        search_queries = ["pasta", "chicken", "vegetarian"]

        for query in search_queries:
            search_response = await api_client.get(f"/v1/recipes/search?query={query}", headers=auth_headers)
            assert search_response.status_code == status.HTTP_200_OK

        response = await api_client.get("/v1/recipes/search/history", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        history = response.json()
        assert isinstance(history, list)
        assert len(history) >= len(search_queries)

    async def test_get_search_history_with_pagination_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str]
    ):
        search_queries = [f"query_{i}" for i in range(5)]

        for query in search_queries:
            search_response = await api_client.get(f"/v1/recipes/search?query={query}", headers=auth_headers)
            assert search_response.status_code == status.HTTP_200_OK

        limit = 2
        offset = 1
        response = await api_client.get(
            f"/v1/recipes/search/history?limit={limit}&offset={offset}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        history = response.json()
        assert isinstance(history, list)
        assert len(history) <= limit

    async def test_get_search_history_anonymous_user_success(self, api_client: AsyncClient):
        consent_data = {"is_analytics_allowed": True}
        consent_response = await api_client.post("/v1/consent", json=consent_data)
        assert consent_response.status_code == status.HTTP_201_CREATED

        assert api_client.cookies["anonymous_id"] == IsUUID()
        assert api_client.cookies["analytics_allowed"] == "True"

        search_queries = ["anonymous_search_1", "anonymous_search_2"]

        for query in search_queries:
            search_response = await api_client.get(f"/v1/recipes/search?query={query}")
            assert search_response.status_code == status.HTTP_200_OK

        response = await api_client.get("/v1/recipes/search/history")

        assert response.status_code == status.HTTP_200_OK
        history = response.json()
        assert isinstance(history, list)
        assert len(history) >= len(search_queries)

    async def test_get_search_history_no_user_identity_error(self, api_client: AsyncClient):
        response = await api_client.get("/v1/recipes/search/history")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        error_data = response.json()
        assert error_data["error_key"] == "user_id_or_anonymous_user_id_not_provided"

    @pytest.mark.parametrize(
        ("limit", "offset"),
        [
            (0, 0),
            (51, 0),
            (10, -1),
        ],
        ids=[
            "zero_limit",
            "limit_too_high",
            "negative_offset",
        ],
    )
    async def test_get_search_history_validation_errors(
        self, api_client: AsyncClient, auth_headers: dict[str, str], limit: int, offset: int
    ):
        response = await api_client.get(
            f"/v1/recipes/search/history?limit={limit}&offset={offset}", headers=auth_headers
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    async def test_save_search_query_authenticated_user_success(
        self, api_client: AsyncClient, auth_headers: dict[str, str]
    ):
        query_data = {"query": fake.word()}

        response = await api_client.post("/v1/recipes/search/history", json=query_data, headers=auth_headers)

        assert response.status_code == status.HTTP_201_CREATED
        saved_query = response.json()
        assert saved_query["query"] == query_data["query"]

    async def test_save_search_query_anonymous_user_success(self, api_client: AsyncClient):
        consent_data = {"is_analytics_allowed": True}
        consent_response = await api_client.post("/v1/consent", json=consent_data)
        assert consent_response.status_code == status.HTTP_201_CREATED

        assert api_client.cookies["anonymous_id"] == IsUUID()
        assert api_client.cookies["analytics_allowed"] == "True"

        query_data = {"query": fake.word()}
        response = await api_client.post("/v1/recipes/search/history", json=query_data)

        assert response.status_code == status.HTTP_201_CREATED
        saved_query = response.json()
        assert saved_query["query"] == query_data["query"]

    async def test_save_search_query_no_user_identity_error(self, api_client: AsyncClient):
        query_data = {"query": fake.word()}
        response = await api_client.post("/v1/recipes/search/history", json=query_data)

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        error_data = response.json()
        assert error_data["error_key"] == "user_id_or_anonymous_user_id_not_provided"

    @pytest.mark.parametrize(
        "query_text",
        [
            "",
            "a" * 501,
        ],
        ids=[
            "empty_query",
            "query_too_long",
        ],
    )
    async def test_save_search_query_validation_errors(
        self, api_client: AsyncClient, auth_headers: dict[str, str], query_text: str
    ):
        query_data = {"query": query_text}

        response = await api_client.post("/v1/recipes/search/history", json=query_data, headers=auth_headers)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        assert response.json()["error_key"] == "validation_error"

    async def test_save_search_query_duplicate_handling(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        query_data = {"query": "duplicate_test_query"}

        first_response = await api_client.post("/v1/recipes/search/history", json=query_data, headers=auth_headers)
        assert first_response.status_code == status.HTTP_201_CREATED

        second_response = await api_client.post("/v1/recipes/search/history", json=query_data, headers=auth_headers)

        assert second_response.status_code == status.HTTP_201_CREATED

    async def test_search_history_ordering(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        search_queries = ["first_query", "second_query", "third_query"]

        for query in search_queries:
            query_data = {"query": query}
            response = await api_client.post("/v1/recipes/search/history", json=query_data, headers=auth_headers)
            assert response.status_code == status.HTTP_201_CREATED

        response = await api_client.get("/v1/recipes/search/history", headers=auth_headers)
        assert response.status_code == status.HTTP_200_OK

        history = response.json()
        assert len(history) >= len(search_queries)
        assert history[0]["query"] == search_queries[-1]

    async def test_search_history_isolation_between_users(self, api_client: AsyncClient, auth_headers: dict[str, str]):
        query_data_1 = {"query": "user1_unique_query"}
        response_1 = await api_client.post("/v1/recipes/search/history", json=query_data_1, headers=auth_headers)
        assert response_1.status_code == status.HTTP_201_CREATED

        user_data_2 = {"username": fake.user_name(), "email": fake.email(), "password": "TestPass123!"}
        register_response = await api_client.post("/v1/auth/register", json=user_data_2)
        assert register_response.status_code == status.HTTP_201_CREATED

        login_data_2 = {"email": user_data_2["email"], "password": "TestPass123!"}
        login_response = await api_client.post("/v1/auth/login", json=login_data_2)
        assert login_response.status_code == status.HTTP_200_OK
        auth_token_2 = login_response.json()["access_token"]
        auth_headers_2 = {"Authorization": f"Bearer {auth_token_2}"}

        query_data_2 = {"query": "user2_unique_query"}
        response_2 = await api_client.post("/v1/recipes/search/history", json=query_data_2, headers=auth_headers_2)
        assert response_2.status_code == status.HTTP_201_CREATED

        history_1_response = await api_client.get("/v1/recipes/search/history", headers=auth_headers)
        assert history_1_response.status_code == status.HTTP_200_OK
        history_1 = history_1_response.json()

        history_2_response = await api_client.get("/v1/recipes/search/history", headers=auth_headers_2)
        assert history_2_response.status_code == status.HTTP_200_OK
        history_2 = history_2_response.json()

        user1_queries = [item["query"] for item in history_1]
        user2_queries = [item["query"] for item in history_2]

        assert "user1_unique_query" in user1_queries
        assert "user1_unique_query" not in user2_queries
        assert "user2_unique_query" in user2_queries
        assert "user2_unique_query" not in user1_queries
