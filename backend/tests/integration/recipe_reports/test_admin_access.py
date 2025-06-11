import pytest
from fastapi import status
from httpx import AsyncClient

from src.enums.report_reason import ReportReasonEnum
from src.enums.report_status import ReportStatusEnum
from tests.fixtures.recipes import RecipeFabricProtocol

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeReportAdminAccess:
    async def test_get_all_reports_admin_success(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/recipe-reports", headers=admin_auth_headers)

        assert response.status_code == status.HTTP_200_OK
        assert "X-Total-Count" in response.headers

    async def test_get_all_reports_with_status_filter(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
    ):
        response = await api_client.get(
            "/v1/recipe-reports",
            params={"status": ReportStatusEnum.PENDING.value},
            headers=admin_auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        assert "X-Total-Count" in response.headers

    async def test_get_all_reports_pagination(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
    ):
        response = await api_client.get(
            "/v1/recipe-reports",
            params={"limit": 5, "offset": 0},
            headers=admin_auth_headers,
        )

        assert response.status_code == status.HTTP_200_OK
        assert "X-Total-Count" in response.headers

    async def test_get_all_reports_regular_user_forbidden(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/recipe-reports", headers=auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    async def test_get_all_reports_unauthenticated(self, api_client: AsyncClient):
        response = await api_client.get("/v1/recipe-reports")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_get_report_by_id_admin_success(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        # Create another user's recipe to report
        other_user_data = {"username": "reporteduser", "email": "reported@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)

        other_login_data = {"email": "reported@example.com", "password": "TestPass123!"}
        other_login_response = await api_client.post("/v1/auth/login", json=other_login_data)
        other_auth_headers = {"Authorization": f"Bearer {other_login_response.json()['access_token']}"}

        # Create and publish recipe by other user
        recipe = await recipe_fabric(other_auth_headers, "Recipe for Admin Test", "Recipe for admin access test")

        # Create report
        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.INAPPROPRIATE_CONTENT.value,
            "description": "Admin test report",
        }
        report_response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)
        report = report_response.json()

        response = await api_client.get(f"/v1/recipe-reports/{report['id']}", headers=admin_auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == report["id"]
        assert data["recipe"]["id"] == recipe["id"]
        assert data["recipe"]["slug"] == recipe["slug"]
        assert data["reason"] == ReportReasonEnum.INAPPROPRIATE_CONTENT.value
        assert data["description"] == "Admin test report"
        assert data["status"] == ReportStatusEnum.PENDING.value

    async def test_get_report_by_id_nonexistent(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/recipe-reports/99999", headers=admin_auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "recipe_report_not_found"

    async def test_get_report_by_id_regular_user_forbidden(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/recipe-reports/1", headers=auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    async def test_get_reports_stats_admin_success(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/recipe-reports/stats", headers=admin_auth_headers)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "total_reports" in data
        assert "pending_reports" in data
        assert "reviewed_reports" in data
        assert "resolved_reports" in data
        assert "dismissed_reports" in data
        assert "reports_by_reason" in data

    async def test_get_reports_stats_regular_user_forbidden(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.get("/v1/recipe-reports/stats", headers=auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN
