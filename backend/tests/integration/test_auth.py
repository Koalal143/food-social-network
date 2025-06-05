from datetime import UTC

import pytest
from dirty_equals import IsNow, IsPositiveInt
from faker import Faker
from fastapi import status
from freezegun import freeze_time
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")

fake = Faker()


class TestAuthRegisterIntegration:
    async def test_register_success(self, api_client: AsyncClient):
        user_data = {
            "username": fake.user_name(),
            "email": fake.email(),
            "password": "TestPass123!",
        }

        response = await api_client.post("/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_201_CREATED
        data = response.json()
        assert data == {
            "id": IsPositiveInt(),
            "username": user_data["username"],
            "email": user_data["email"],
            "is_active": True,
            "is_superuser": False,
            "profile": {
                "id": IsPositiveInt,
                "about": None,
                "avatar_url": None,
                "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
                "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
                "user_id": data["id"],
            },
            "last_login": None,
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }

    @pytest.mark.parametrize(
        ("payload", "expected_error_fragment"),
        [
            ({}, "Field required"),
            ({"email": "test@example.com", "password": "TestPass123!"}, "Field required"),
            ({"username": "test", "password": "TestPass123!"}, "Field required"),
            ({"username": "test", "email": "test@example.com"}, "Field required"),
        ],
        ids=[
            "empty_payload",
            "missing_username",
            "missing_email",
            "missing_password",
        ],
    )
    async def test_register_missing_required_fields(
        self,
        api_client: AsyncClient,
        payload: dict,
        expected_error_fragment: str,
    ):
        response = await api_client.post("/v1/auth/register", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert expected_error_fragment in str(data["detail"])

    @pytest.mark.parametrize(
        "username",
        [123, None, -1, [], {"username": "username"}],
        ids=[
            "username_integer",
            "username_none",
            "username_negative",
            "username_list",
            "username_dict",
        ],
    )
    async def test_register_invalid_username_type(self, api_client: AsyncClient, username):
        payload = {"username": username, "email": "test@example.com", "password": "TestPass123!"}
        response = await api_client.post("/v1/auth/register", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "email",
        [
            123,
            None,
            -1,
            {"email": "email@mail.com"},
            [],
        ],
        ids=[
            "email_integer",
            "email_none",
            "email_negative",
            "email_dict",
            "email_list",
        ],
    )
    async def test_register_invalid_email_type(self, api_client: AsyncClient, email):
        payload = {"username": "testuser", "email": email, "password": "TestPass123!"}
        response = await api_client.post("/v1/auth/register", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "password",
        [
            123,
            -1,
            None,
            [],
        ],
        ids=[
            "password_integer",
            "password_negative",
            "password_none",
            "password_list",
        ],
    )
    async def test_register_invalid_password_type(self, api_client: AsyncClient, password):
        payload = {"username": "testuser", "email": "test@example.com", "password": password}
        response = await api_client.post("/v1/auth/register", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "username",
        [
            "ab",  # too short (min 3)
            "a" * 31,  # too long (max 30)
            "test@user",  # invalid characters (only a-zA-Z0-9_- allowed)
            "test user",  # space not allowed
            "test.user",  # dot not allowed
            "admin",  # banned username
            "administrator",  # banned username
            "root",  # banned username
            "moderator",  # banned username
            "support",  # banned username
            "help",  # banned username
            "owner",  # banned username
            "staff",  # banned username
            "avatar",  # banned username
            "me",  # banned username
        ],
        ids=[
            "username_too_short",
            "username_too_long",
            "username_invalid_at_symbol",
            "username_with_space",
            "username_with_dot",
            "banned_username_admin",
            "banned_username_administrator",
            "banned_username_root",
            "banned_username_moderator",
            "banned_username_support",
            "banned_username_help",
            "banned_username_owner",
            "banned_username_staff",
            "banned_username_avatar",
            "banned_username_me",
        ],
    )
    async def test_register_username_validation_errors(self, api_client: AsyncClient, username: str):
        payload = {"username": username, "email": "test@example.com", "password": "TestPass123!"}
        response = await api_client.post("/v1/auth/register", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "email",
        [
            "invalid-email",  # no @ symbol
            "test@",  # no domain
            "@example.com",  # no local part
            "test.example.com",  # no @ symbol
            "",  # empty
        ],
        ids=[
            "email_no_at_symbol",
            "email_no_domain",
            "email_no_local_part",
            "email_no_at_symbol_with_dot",
            "email_empty",
        ],
    )
    async def test_register_email_validation_errors(self, api_client: AsyncClient, email: str):
        payload = {"username": "testuser", "email": email, "password": "TestPass123!"}
        response = await api_client.post("/v1/auth/register", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "password",
        [
            "short",  # too short (min 8)
            "nouppercase123!",  # no uppercase letter
            "NOLOWERCASE123!",  # no lowercase letter
            "NoNumbers!",  # no numbers
            "NoSpecialChars123",  # no special characters
            "Simple1",  # no special characters
            "",  # empty
        ],
        ids=[
            "password_too_short",
            "password_no_uppercase",
            "password_no_lowercase",
            "password_no_numbers",
            "password_no_special_chars_long",
            "password_no_special_chars_short",
            "password_empty",
        ],
    )
    async def test_register_password_validation_errors(self, api_client: AsyncClient, password: str):
        payload = {"username": "testuser", "email": "test@example.com", "password": password}
        response = await api_client.post("/v1/auth/register", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_register_duplicate_username(self, api_client: AsyncClient, registered_user: dict):
        user_data = {
            "username": registered_user["username"],
            "email": fake.email(),
            "password": "TestPass123!",
        }

        response = await api_client.post("/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_409_CONFLICT
        data = response.json()
        assert data["error_key"] == "user_nickname_already_exists"
        assert "Username already taken" in data["detail"]

    async def test_register_duplicate_email(self, api_client: AsyncClient, registered_user: dict):
        user_data = {
            "username": fake.user_name(),
            "email": registered_user["email"],
            "password": "TestPass123!",
        }

        response = await api_client.post("/v1/auth/register", json=user_data)

        assert response.status_code == status.HTTP_409_CONFLICT
        data = response.json()
        assert data["error_key"] == "user_email_already_exists"
        assert "Email already registered" in data["detail"]


class TestAuthLoginIntegration:
    async def test_login_with_email_success(self, api_client: AsyncClient, registered_user: dict):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }

        response = await api_client.post("/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert isinstance(data["access_token"], str)
        assert isinstance(data["refresh_token"], str)

    async def test_login_with_username_success(self, api_client: AsyncClient, registered_user: dict):
        login_data = {
            "username": registered_user["username"],
            "password": "TestPass123!",
        }

        response = await api_client.post("/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "access_token" in data
        assert "refresh_token" in data
        assert isinstance(data["access_token"], str)
        assert isinstance(data["refresh_token"], str)

    @pytest.mark.parametrize(
        ("payload", "expected_error_fragment"),
        [
            ({}, "Field required"),
            ({"email": "test@example.com"}, "Field required"),
            ({"username": "test"}, "Field required"),
            ({"password": "TestPass123!"}, "Either email or username must be provided"),
            (
                {"email": None, "username": None, "password": "TestPass123!"},
                "Either email or username must be provided",
            ),
        ],
        ids=[
            "empty_payload",
            "missing_password_with_email",
            "missing_password_with_username",
            "missing_email_and_username",
            "null_email_and_username",
        ],
    )
    async def test_login_missing_required_fields(
        self,
        api_client: AsyncClient,
        payload: dict,
        expected_error_fragment: str,
    ):
        response = await api_client.post("/v1/auth/login", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert expected_error_fragment in str(data["detail"])

    @pytest.mark.parametrize(
        "email",
        [
            123,
            [],
            {},
        ],
        ids=[
            "email_integer",
            "email_list",
            "email_dict",
        ],
    )
    async def test_login_invalid_email_type(self, api_client: AsyncClient, email):
        payload = {"email": email, "password": "TestPass123!"}
        response = await api_client.post("/v1/auth/login", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "username",
        [
            123,
            [],
            {},
        ],
        ids=[
            "username_integer",
            "username_list",
            "username_dict",
        ],
    )
    async def test_login_invalid_username_type(self, api_client: AsyncClient, username):
        payload = {"username": username, "password": "TestPass123!"}
        response = await api_client.post("/v1/auth/login", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "password",
        [
            123,
            [],
            {},
        ],
        ids=[
            "password_integer",
            "password_list",
            "password_dict",
        ],
    )
    async def test_login_invalid_password_type(self, api_client: AsyncClient, password):
        payload = {"email": "test@example.com", "password": password}
        response = await api_client.post("/v1/auth/login", json=payload)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_login_incorrect_email(self, api_client: AsyncClient):
        login_data = {
            "email": "wrongexample.com",
            "password": "TestPass123!",
        }

        response = await api_client.post("/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert data["error_key"] == "validation_error"

    async def test_login_incorrect_username(self, api_client: AsyncClient):
        login_data = {
            "username": "wronguser@",
            "password": "TestPass123!",
        }

        response = await api_client.post("/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY
        data = response.json()
        assert data["error_key"] == "validation_error"

    async def test_empassword(self, api_client: AsyncClient, registered_user: dict):
        login_data = {
            "email": registered_user["email"],
            "password": "WrongPassword123!",
        }

        response = await api_client.post("/v1/auth/login", json=login_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert data["error_key"] == "username_or_email_or_password_is_incorrect"
        assert "Incorrect email/username or password" in data["detail"]

    async def test_login_updates_last_login_timestamp(self, api_client: AsyncClient, registered_user: dict):
        with freeze_time() as frozen_time:
            login_data = {
                "email": registered_user["email"],
                "password": "TestPass123!",
            }
            first_login_response = await api_client.post("/v1/auth/login", json=login_data)

            assert first_login_response.status_code == status.HTTP_200_OK
            first_tokens = first_login_response.json()
            assert "access_token" in first_tokens
            assert "refresh_token" in first_tokens

            auth_header = {"Authorization": f"Bearer {first_tokens['access_token']}"}
            first_user_response = await api_client.get("/v1/users/me", headers=auth_header)
            assert first_user_response.status_code == status.HTTP_200_OK
            first_user_data = first_user_response.json()

            assert first_user_data["last_login"] == IsNow(iso_string=True, delta=3, tz=UTC)
            first_last_login = first_user_data["last_login"]

            frozen_time.tick(delta=60)

            second_login_response = await api_client.post("/v1/auth/login", json=login_data)

            assert second_login_response.status_code == status.HTTP_200_OK
            second_tokens = second_login_response.json()
            assert "access_token" in second_tokens
            assert "refresh_token" in second_tokens

            auth_header = {"Authorization": f"Bearer {second_tokens['access_token']}"}
            second_user_response = await api_client.get("/v1/users/me", headers=auth_header)
            assert second_user_response.status_code == status.HTTP_200_OK
            second_user_data = second_user_response.json()

            assert second_user_data["last_login"] == IsNow(iso_string=True, delta=3, tz=UTC)
            second_last_login = second_user_data["last_login"]

            assert second_last_login != first_last_login


class TestAuthRefreshIntegration:
    async def test_refresh_token_success(self, api_client: AsyncClient, registered_user: dict):
        with freeze_time() as frozen_time:
            login_data = {
                "email": registered_user["email"],
                "password": "TestPass123!",
            }
            login_response = await api_client.post("/v1/auth/login", json=login_data)
            tokens = login_response.json()

            frozen_time.tick(delta=1)

            response = await api_client.post("/v1/auth/refresh", json={"refresh_token": tokens["refresh_token"]})

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert "access_token" in data
            assert "refresh_token" in data
            assert isinstance(data["access_token"], str)
            assert isinstance(data["refresh_token"], str)
            assert data["access_token"] != tokens["access_token"]
            assert data["refresh_token"] != tokens["refresh_token"]

    async def test_refresh_token_invalid_token(self, api_client: AsyncClient):
        response = await api_client.post("/v1/auth/refresh", json={"refresh_token": "invalid_token"})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
        data = response.json()
        assert data["error_key"] == "invalid_token"
        assert "Invalid refresh token" in data["detail"]

    async def test_refresh_token_missing_token(self, api_client: AsyncClient):
        response = await api_client.post("/v1/auth/refresh", json={})

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "refresh_token",
        [
            "123",
            "",
            "invalid_token_format",
            "short",
            "very_long_invalid_token_that_should_fail_validation",
        ],
        ids=[
            "token_numeric",
            "token_empty",
            "token_invalid_format",
            "token_too_short",
            "token_too_long",
        ],
    )
    async def test_refresh_token_invalid_values(self, api_client: AsyncClient, refresh_token: str):
        response = await api_client.post("/v1/auth/refresh", json={"refresh_token": refresh_token})

        assert response.status_code == status.HTTP_401_UNAUTHORIZED
