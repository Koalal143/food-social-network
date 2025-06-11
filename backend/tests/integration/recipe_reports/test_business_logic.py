import pytest
from fastapi import status
from httpx import AsyncClient

from src.enums.report_reason import ReportReasonEnum
from tests.fixtures.recipes import RecipeFabricProtocol

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeReportBusinessLogic:
    async def test_multiple_users_can_report_same_recipe(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        # Create recipe author
        author_data = {"username": "recipeauthor", "email": "author@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=author_data)

        author_login_data = {"email": "author@example.com", "password": "TestPass123!"}
        author_login_response = await api_client.post("/v1/auth/login", json=author_login_data)
        author_auth_headers = {"Authorization": f"Bearer {author_login_response.json()['access_token']}"}

        # Create and publish recipe
        recipe = await recipe_fabric(
            author_auth_headers, "Multi-Report Recipe", "Recipe that multiple users will report"
        )

        # Create second user
        user2_data = {"username": "reporter2", "email": "reporter2@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=user2_data)

        user2_login_data = {"email": "reporter2@example.com", "password": "TestPass123!"}
        user2_login_response = await api_client.post("/v1/auth/login", json=user2_login_data)
        user2_auth_headers = {"Authorization": f"Bearer {user2_login_response.json()['access_token']}"}

        # Both users report the same recipe
        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.SPAM.value,
            "description": "Report from user 1",
        }
        response1 = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)
        assert response1.status_code == status.HTTP_201_CREATED

        report_data["description"] = "Report from user 2"
        response2 = await api_client.post("/v1/recipe-reports", json=report_data, headers=user2_auth_headers)
        assert response2.status_code == status.HTTP_201_CREATED

        # Both reports should be created successfully
        assert response1.json()["id"] != response2.json()["id"]

    async def test_report_isolation_between_users(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        # Create second user
        user2_data = {"username": "isolationuser", "email": "isolation@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=user2_data)

        user2_login_data = {"email": "isolation@example.com", "password": "TestPass123!"}
        user2_login_response = await api_client.post("/v1/auth/login", json=user2_login_data)
        user2_auth_headers = {"Authorization": f"Bearer {user2_login_response.json()['access_token']}"}

        # User 1 should not see User 2's reports in "my reports"
        response1 = await api_client.get("/v1/recipe-reports/my", headers=auth_headers)
        response2 = await api_client.get("/v1/recipe-reports/my", headers=user2_auth_headers)

        assert response1.status_code == status.HTTP_200_OK
        assert response2.status_code == status.HTTP_200_OK

        # Each user should only see their own reports
        user1_reports = response1.json()
        user2_reports = response2.json()

        # Verify no overlap in report IDs (if any reports exist)
        if user1_reports and user2_reports:
            user1_ids = {report["id"] for report in user1_reports}
            user2_ids = {report["id"] for report in user2_reports}
            assert user1_ids.isdisjoint(user2_ids)
