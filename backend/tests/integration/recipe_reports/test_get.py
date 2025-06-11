import pytest
from fastapi import status
from httpx import AsyncClient

from src.enums.report_reason import ReportReasonEnum
from src.enums.report_status import ReportStatusEnum
from tests.fixtures.recipes import RecipeFabricProtocol

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeReportRetrieval:
    async def test_get_my_reports_empty_list(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/recipe-reports/my", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        assert response.json() == []
        assert response.headers.get("X-Total-Count") == "0"

    async def test_get_my_reports_with_data(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        # Create another user's recipe to report
        other_user_data = {"username": "reportuser", "email": "report@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)

        other_login_data = {"email": "report@example.com", "password": "TestPass123!"}
        other_login_response = await api_client.post("/v1/auth/login", json=other_login_data)
        other_auth_headers = {"Authorization": f"Bearer {other_login_response.json()['access_token']}"}

        # Create and publish recipe by other user
        recipe = await recipe_fabric(other_auth_headers, "Recipe to Report", "Recipe that will be reported")

        # Create report
        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.SPAM.value,
            "description": "Test report description",
        }
        await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)

        response = await api_client.get("/v1/recipe-reports/my", headers=auth_headers)

        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("X-Total-Count") == "1"

        reports = response.json()
        assert len(reports) == 1
        assert reports[0]["recipe"]["id"] == recipe["id"]
        assert reports[0]["recipe"]["slug"] == recipe["slug"]
        assert reports[0]["reason"] == ReportReasonEnum.SPAM.value
        assert reports[0]["description"] == "Test report description"
        assert reports[0]["status"] == ReportStatusEnum.PENDING.value

    async def test_get_my_reports_pagination(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.get(
            "/v1/recipe-reports/my",
            params={"limit": 5, "offset": 0},
            headers=auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        assert "X-Total-Count" in response.headers

    async def test_get_my_reports_unauthenticated(self, api_client: AsyncClient):
        response = await api_client.get("/v1/recipe-reports/my")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
