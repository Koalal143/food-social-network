import pytest
from fastapi import status
from httpx import AsyncClient

from src.enums.report_reason import ReportReasonEnum
from tests.fixtures.recipes import RecipeFabricProtocol

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeReportDeletion:
    async def test_delete_report_superuser_success(
        self,
        api_client: AsyncClient,
        superuser_auth_headers: dict[str, str],
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        # Create another user's recipe to report
        other_user_data = {"username": "deleteuser", "email": "delete@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)

        other_login_data = {"email": "delete@example.com", "password": "TestPass123!"}
        other_login_response = await api_client.post("/v1/auth/login", json=other_login_data)
        other_auth_headers = {"Authorization": f"Bearer {other_login_response.json()['access_token']}"}

        # Create and publish recipe by other user
        recipe = await recipe_fabric(other_auth_headers, "Recipe for Deletion", "Recipe for deletion test")

        # Create report
        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.COPYRIGHT.value,
            "description": "Deletion test report",
        }
        report_response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)
        report = report_response.json()

        response = await api_client.delete(f"/v1/recipe-reports/{report['id']}", headers=superuser_auth_headers)

        assert response.status_code == status.HTTP_204_NO_CONTENT

        # Verify report is deleted
        get_response = await api_client.get(f"/v1/recipe-reports/{report['id']}", headers=superuser_auth_headers)
        assert get_response.status_code == status.HTTP_404_NOT_FOUND

    async def test_delete_report_nonexistent(
        self,
        api_client: AsyncClient,
        superuser_auth_headers: dict[str, str],
    ):
        response = await api_client.delete("/v1/recipe-reports/99999", headers=superuser_auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "recipe_report_not_found"

    async def test_delete_report_admin_forbidden(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
    ):
        response = await api_client.delete("/v1/recipe-reports/1", headers=admin_auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    async def test_delete_report_regular_user_forbidden(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        response = await api_client.delete("/v1/recipe-reports/1", headers=auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    async def test_delete_report_unauthenticated(self, api_client: AsyncClient):
        response = await api_client.delete("/v1/recipe-reports/1")
        assert response.status_code == status.HTTP_401_UNAUTHORIZED
