import pytest
from dirty_equals import IsDatetime, IsPositiveInt
from fastapi import status
from httpx import AsyncClient

from src.enums.report_reason import ReportReasonEnum
from src.enums.report_status import ReportStatusEnum
from tests.fixtures.recipes import RecipeFabricProtocol

pytestmark = pytest.mark.asyncio(loop_scope="session")


class TestRecipeReportCreation:
    async def test_create_recipe_report_success(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        current_user_response = await api_client.get("/v1/users/me", headers=auth_headers)
        current_user = current_user_response.json()

        other_user_data = {"username": "recipeowner", "email": "owner@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)
        other_login_data = {"email": "owner@example.com", "password": "TestPass123!"}
        other_login_response = await api_client.post("/v1/auth/login", json=other_login_data)
        other_auth_headers = {"Authorization": f"Bearer {other_login_response.json()['access_token']}"}

        recipe = await recipe_fabric(other_auth_headers, "Recipe to Report", "Recipe that will be reported")

        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.SPAM.value,
            "description": "This recipe contains spam content",
        }

        response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)

        expected_response = {
            "id": IsPositiveInt,
            "recipe": {"id": recipe["id"], "slug": recipe["slug"]},
            "reporter_user_id": IsPositiveInt,
            "reason": ReportReasonEnum.SPAM.value,
            "description": "This recipe contains spam content",
            "status": ReportStatusEnum.PENDING.value,
            "reviewed_by_user_id": None,
            "admin_notes": None,
            "reporter_user": {
                "id": current_user["id"],
                "username": current_user["username"],
                "profile": {"avatar_url": current_user["profile"]["avatar_url"]},
            },
            "reviewed_by_user": None,
            "created_at": IsDatetime(iso_string=True, delta=3),
            "updated_at": IsDatetime(iso_string=True, delta=3),
        }
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json() == expected_response

    async def test_create_recipe_report_minimal_data(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        current_user_response = await api_client.get("/v1/users/me", headers=auth_headers)
        current_user = current_user_response.json()

        other_user_data = {"username": "minimalowner", "email": "minimal@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)
        other_login_data = {"email": "minimal@example.com", "password": "TestPass123!"}
        other_login_response = await api_client.post("/v1/auth/login", json=other_login_data)
        other_auth_headers = {"Authorization": f"Bearer {other_login_response.json()['access_token']}"}

        recipe = await recipe_fabric(other_auth_headers, "Minimal Recipe", "Recipe for minimal test")

        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.INAPPROPRIATE_CONTENT.value,
        }

        response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)

        expected_response = {
            "id": IsPositiveInt,
            "recipe": {"id": recipe["id"], "slug": recipe["slug"]},
            "reporter_user_id": IsPositiveInt,
            "reason": ReportReasonEnum.INAPPROPRIATE_CONTENT.value,
            "description": None,
            "status": ReportStatusEnum.PENDING.value,
            "reviewed_by_user_id": None,
            "admin_notes": None,
            "reporter_user": {
                "id": current_user["id"],
                "username": current_user["username"],
                "profile": {"avatar_url": current_user["profile"]["avatar_url"]},
            },
            "reviewed_by_user": None,
            "created_at": IsDatetime(iso_string=True, delta=3),
            "updated_at": IsDatetime(iso_string=True, delta=3),
        }
        assert response.status_code == status.HTTP_201_CREATED
        assert response.json() == expected_response

    async def test_create_recipe_report_nonexistent_recipe(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
    ):
        report_data = {
            "recipe_id": 99999,
            "reason": ReportReasonEnum.SPAM.value,
            "description": "Test report",
        }

        response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.json()["error_key"] == "recipe_not_found"

    async def test_create_recipe_report_own_recipe(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        test_recipe: dict,
    ):
        report_data = {
            "recipe_id": test_recipe["id"],
            "reason": ReportReasonEnum.SPAM.value,
            "description": "Trying to report my own recipe",
        }

        response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)

        assert response.status_code == status.HTTP_409_CONFLICT
        assert response.json()["error_key"] == "cannot_report_own_recipe"

    async def test_create_duplicate_recipe_report(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        recipe_fabric: RecipeFabricProtocol,
    ):
        # Create another user's recipe to report
        other_user_data = {"username": "otheruser", "email": "other@example.com", "password": "TestPass123!"}
        await api_client.post("/v1/auth/register", json=other_user_data)

        other_login_data = {"email": "other@example.com", "password": "TestPass123!"}
        other_login_response = await api_client.post("/v1/auth/login", json=other_login_data)
        other_auth_headers = {"Authorization": f"Bearer {other_login_response.json()['access_token']}"}

        # Create and publish recipe by other user
        recipe = await recipe_fabric(other_auth_headers, "Other User Recipe", "Recipe by another user")

        report_data = {
            "recipe_id": recipe["id"],
            "reason": ReportReasonEnum.SPAM.value,
            "description": "First report",
        }

        # First report should succeed
        first_response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)
        assert first_response.status_code == status.HTTP_201_CREATED

        # Second report should fail
        second_response = await api_client.post("/v1/recipe-reports", json=report_data, headers=auth_headers)
        assert second_response.status_code == status.HTTP_409_CONFLICT
        assert second_response.json()["error_key"] == "recipe_report_already_exists"

    async def test_create_recipe_report_unauthenticated(
        self,
        api_client: AsyncClient,
    ):
        report_data = {
            "recipe_id": 1,
            "reason": ReportReasonEnum.SPAM.value,
        }

        response = await api_client.post("/v1/recipe-reports", json=report_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @pytest.mark.parametrize(
        ("invalid_data", "expected_status"),
        [
            ({"reason": ReportReasonEnum.SPAM.value}, status.HTTP_422_UNPROCESSABLE_ENTITY),  # Missing recipe_id
            ({"recipe_id": "invalid"}, status.HTTP_422_UNPROCESSABLE_ENTITY),  # Invalid recipe_id type
            ({"recipe_id": 1, "reason": "invalid_reason"}, status.HTTP_422_UNPROCESSABLE_ENTITY),  # Invalid reason
            (
                {"recipe_id": 1, "reason": ReportReasonEnum.SPAM.value, "description": "x" * 501},
                status.HTTP_422_UNPROCESSABLE_ENTITY,
            ),  # Description too long
        ],
        ids=[
            "missing_recipe_id",
            "invalid_recipe_id_type",
            "invalid_reason",
            "description_too_long",
        ],
    )
    async def test_create_recipe_report_validation_errors(
        self,
        api_client: AsyncClient,
        auth_headers: dict[str, str],
        invalid_data: dict,
        expected_status: int,
    ):
        response = await api_client.post("/v1/recipe-reports", json=invalid_data, headers=auth_headers)
        assert response.status_code == expected_status
