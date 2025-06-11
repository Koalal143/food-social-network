import pytest
from fastapi import status
from httpx import AsyncClient

from src.enums.report_reason import ReportReasonEnum
from src.enums.report_status import ReportStatusEnum
from tests.fixtures.recipes import RecipeFabricProtocol

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeReportStatusUpdate:
    async def test_update_report_status_admin_success(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        # Create another user's recipe to report
        other_user_data = {"username": "updateuser", "email": "update@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)

        other_login_data = {"email": "update@example.com", "password": "TestPass123!"}
        other_login_response = await api_client.post("/v1/auth/login", json=other_login_data)
        other_auth_headers = {"Authorization": f"Bearer {other_login_response.json()['access_token']}"}

        # Create and publish recipe by other user
        recipe = await recipe_fabric(other_auth_headers, "Recipe for Status Update", "Recipe for status update test")

        # Create report
        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.SPAM.value,
            "description": "Status update test report",
        }
        report_response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)
        report = report_response.json()

        # Update status
        update_data = {
            "status": ReportStatusEnum.REVIEWED.value,
            "admin_notes": "Report has been reviewed and found valid",
        }
        response = await api_client.patch(
            f"/v1/recipe-reports/{report['id']}", json=update_data, headers=admin_auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["id"] == report["id"]
        assert data["status"] == ReportStatusEnum.REVIEWED.value
        assert data["admin_notes"] == "Report has been reviewed and found valid"
        assert data["reviewed_by_user_id"] is not None

    async def test_update_report_status_only(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        # Create another user's recipe to report
        other_user_data = {"username": "statususer", "email": "status@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)

        other_login_data = {"email": "status@example.com", "password": "TestPass123!"}
        other_login_response = await api_client.post("/v1/auth/login", json=other_login_data)
        other_auth_headers = {"Authorization": f"Bearer {other_login_response.json()['access_token']}"}

        # Create and publish recipe by other user
        recipe = await recipe_fabric(other_auth_headers, "Recipe for Status Only", "Recipe for status only test")

        # Create report
        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.FAKE_RECIPE.value,
        }
        report_response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)
        report = report_response.json()

        # Update only status
        update_data = {"status": ReportStatusEnum.DISMISSED.value}
        response = await api_client.patch(
            f"/v1/recipe-reports/{report['id']}", json=update_data, headers=admin_auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == ReportStatusEnum.DISMISSED.value
        assert data["reviewed_by_user_id"] is not None
        assert data["admin_notes"] is None

    async def test_update_report_admin_notes_only(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        # Create another user's recipe to report
        other_user_data = {"username": "notesuser", "email": "notes@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)

        other_login_data = {"email": "notes@example.com", "password": "TestPass123!"}
        other_login_response = await api_client.post("/v1/auth/login", json=other_login_data)
        other_auth_headers = {"Authorization": f"Bearer {other_login_response.json()['access_token']}"}

        # Create and publish recipe by other user
        recipe = await recipe_fabric(other_auth_headers, "Recipe for Notes Only", "Recipe for notes only test")

        # Create report
        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.OTHER.value,
            "description": "Notes only test",
        }
        report_response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)
        report = report_response.json()

        # Update only admin notes
        update_data = {"admin_notes": "Additional notes added by admin"}
        response = await api_client.patch(
            f"/v1/recipe-reports/{report['id']}", json=update_data, headers=admin_auth_headers
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["status"] == ReportStatusEnum.PENDING.value  # Status unchanged
        assert data["admin_notes"] == "Additional notes added by admin"
        assert data["reviewed_by_user_id"] is None  # No reviewer set when only notes updated

    async def test_update_report_nonexistent(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
    ):
        update_data = {"status": ReportStatusEnum.RESOLVED.value}
        response = await api_client.patch("/v1/recipe-reports/99999", json=update_data, headers=admin_auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "recipe_report_not_found"

    async def test_update_report_regular_user_forbidden(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        update_data = {"status": ReportStatusEnum.RESOLVED.value}
        response = await api_client.patch("/v1/recipe-reports/1", json=update_data, headers=auth_headers)
        assert response.status_code == status.HTTP_403_FORBIDDEN

    @pytest.mark.parametrize(
        ("invalid_data", "expected_status"),
        [
            ({"status": "invalid_status"}, status.HTTP_422_UNPROCESSABLE_ENTITY),
            ({"admin_notes": "x" * 1001}, status.HTTP_422_UNPROCESSABLE_ENTITY),  # Notes too long
        ],
        ids=[
            "invalid_status",
            "admin_notes_too_long",
        ],
    )
    async def test_update_report_validation_errors(
        self,
        api_client: AsyncClient,
        admin_auth_headers: dict[str, str],
        invalid_data: dict,
        expected_status: int,
    ):
        response = await api_client.patch("/v1/recipe-reports/1", json=invalid_data, headers=admin_auth_headers)
        assert response.status_code == expected_status
