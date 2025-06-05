from datetime import UTC

import pytest
from dirty_equals import IsNow, IsPositiveInt, IsUrl
from faker import Faker
from fastapi import status
from freezegun import freeze_time
from httpx import AsyncClient

pytestmark = pytest.mark.asyncio(loop_scope="session")

fake = Faker()


class TestUserMeGetIntegration:
    async def test_get_current_user_success(self, api_client: AsyncClient, registered_user: dict):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()

        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}
        response = await api_client.get("/v1/users/me", headers=auth_header)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data == {
            "id": IsPositiveInt(),
            "username": registered_user["username"],
            "email": registered_user["email"],
            "is_active": True,
            "is_superuser": False,
            "profile": {
                "id": IsPositiveInt(),
                "about": None,
                "avatar_url": None,
                "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
                "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
                "user_id": data["id"],
            },
            "last_login": IsNow(iso_string=True, delta=3, tz=UTC),
            "created_at": IsNow(iso_string=True, delta=3, tz=UTC),
            "updated_at": IsNow(iso_string=True, delta=3, tz=UTC),
        }

    async def test_get_current_user_unauthorized(self, api_client: AsyncClient):
        response = await api_client.get("/v1/users/me")

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_get_current_user_invalid_token(self, api_client: AsyncClient):
        auth_header = {"Authorization": "Bearer invalid_token"}
        response = await api_client.get("/v1/users/me", headers=auth_header)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUserMeUpdateIntegration:
    async def test_update_username_success(self, api_client: AsyncClient, registered_user: dict):
        with freeze_time() as frozen_time:
            login_data = {
                "email": registered_user["email"],
                "password": "TestPass123!",
            }
            login_response = await api_client.post("/v1/auth/login", json=login_data)
            tokens = login_response.json()
            auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

            initial_response = await api_client.get("/v1/users/me", headers=auth_header)
            initial_data = initial_response.json()
            initial_updated_at = initial_data["updated_at"]

            frozen_time.tick(delta=60)

            new_username = fake.user_name()
            update_data = {"username": new_username}
            response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["username"] == new_username
            assert data["updated_at"] != initial_updated_at
            assert data["updated_at"] == IsNow(iso_string=True, delta=3, tz=UTC)

    async def test_update_profile_about_success(self, api_client: AsyncClient, registered_user: dict):
        with freeze_time() as frozen_time:
            login_data = {
                "email": registered_user["email"],
                "password": "TestPass123!",
            }
            login_response = await api_client.post("/v1/auth/login", json=login_data)
            tokens = login_response.json()
            auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

            initial_response = await api_client.get("/v1/users/me", headers=auth_header)
            initial_data = initial_response.json()
            initial_profile_updated_at = initial_data["profile"]["updated_at"]

            frozen_time.tick(delta=60)

            new_about = fake.text(max_nb_chars=200)
            update_data = {"profile": {"about": new_about}}
            response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

            assert response.status_code == status.HTTP_200_OK
            data = response.json()
            assert data["profile"]["about"] == new_about
            assert data["profile"]["updated_at"] != initial_profile_updated_at
            assert data["profile"]["updated_at"] == IsNow(iso_string=True, delta=3, tz=UTC)

    async def test_update_username_and_profile_success(self, api_client: AsyncClient, registered_user: dict):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()
        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

        new_username = fake.user_name()
        new_about = fake.text(max_nb_chars=200)
        update_data = {"username": new_username, "profile": {"about": new_about}}
        response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["username"] == new_username
        assert data["profile"]["about"] == new_about

    async def test_update_with_empty_data_success(self, api_client: AsyncClient, registered_user: dict):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()
        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

        initial_response = await api_client.get("/v1/users/me", headers=auth_header)
        initial_data = initial_response.json()

        update_data: dict[str, str] = {}
        response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        assert data["username"] == initial_data["username"]
        assert data["profile"]["about"] == initial_data["profile"]["about"]

    @pytest.mark.parametrize(
        ("field", "value"),
        [
            ("username", 123),
            ("username", []),
            ("username", {}),
            ("profile", "invalid_profile"),
            ("profile", 123),
            ("profile", []),
        ],
        ids=[
            "username_integer",
            "username_list",
            "username_dict",
            "profile_string",
            "profile_integer",
            "profile_list",
        ],
    )
    async def test_update_invalid_field_types(
        self,
        api_client: AsyncClient,
        registered_user: dict,
        field: str,
        value,
    ):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()
        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

        update_data = {field: value}
        response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        "username",
        [
            "ab",
            "a" * 31,
            "test@user",
            "test user",
            "test.user",
            "admin",
            "root",
            "moderator",
        ],
        ids=[
            "username_too_short",
            "username_too_long",
            "username_invalid_at_symbol",
            "username_with_space",
            "username_with_dot",
            "banned_username_admin",
            "banned_username_root",
            "banned_username_moderator",
        ],
    )
    async def test_update_username_validation_errors(
        self,
        api_client: AsyncClient,
        registered_user: dict,
        username: str,
    ):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()
        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

        update_data = {"username": username}
        response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    async def test_update_duplicate_username(self, api_client: AsyncClient, registered_user: dict):
        another_user_data = {
            "username": fake.user_name(),
            "email": fake.email(),
            "password": "TestPass123!",
        }
        await api_client.post("/v1/auth/register", json=another_user_data)

        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()
        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

        update_data = {"username": another_user_data["username"]}
        response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

        assert response.status_code == status.HTTP_409_CONFLICT
        data = response.json()
        assert data["error_key"] == "user_nickname_already_exists"
        assert "Username already taken" in data["detail"]

    async def test_update_unauthorized(self, api_client: AsyncClient):
        update_data = {"username": "newusername"}
        response = await api_client.patch("/v1/users/me", json=update_data)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_update_invalid_token(self, api_client: AsyncClient):
        auth_header = {"Authorization": "Bearer invalid_token"}
        update_data = {"username": "newusername"}
        response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED


class TestUserAvatarUpdateIntegration:
    async def test_update_avatar_success(self, api_client: AsyncClient, registered_user: dict):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()
        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

        image_content = b"fake_image_content"
        files = {"image": ("test.jpg", image_content, "image/jpeg")}

        response = await api_client.patch("/v1/users/me/avatar", files=files, headers=auth_header)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "avatar_url" in data
        assert data["avatar_url"] == IsUrl()

    async def test_update_avatar_unauthorized(self, api_client: AsyncClient):
        image_content = b"fake_image_content"
        files = {"image": ("test.jpg", image_content, "image/jpeg")}

        response = await api_client.patch("/v1/users/me/avatar", files=files)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_update_avatar_invalid_token(self, api_client: AsyncClient):
        auth_header = {"Authorization": "Bearer invalid_token"}
        image_content = b"fake_image_content"
        files = {"image": ("test.jpg", image_content, "image/jpeg")}

        response = await api_client.patch("/v1/users/me/avatar", files=files, headers=auth_header)

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    async def test_update_avatar_missing_file(self, api_client: AsyncClient, registered_user: dict):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()
        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

        response = await api_client.patch("/v1/users/me/avatar", headers=auth_header)

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @pytest.mark.parametrize(
        ("filename", "content_type"),
        [
            ("test.txt", "text/plain"),
            ("test.pdf", "application/pdf"),
            ("test.doc", "application/msword"),
        ],
        ids=[
            "text_file",
            "pdf_file",
            "doc_file",
        ],
    )
    async def test_update_avatar_wrong_format(
        self,
        api_client: AsyncClient,
        registered_user: dict,
        filename: str,
        content_type: str,
    ):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()
        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

        image_content = b"fake_content"
        files = {"image": (filename, image_content, content_type)}

        response = await api_client.patch("/v1/users/me/avatar", files=files, headers=auth_header)

        assert response.status_code == status.HTTP_415_UNSUPPORTED_MEDIA_TYPE

    async def test_update_avatar_too_large(self, api_client: AsyncClient, registered_user: dict):
        login_data = {
            "email": registered_user["email"],
            "password": "TestPass123!",
        }
        login_response = await api_client.post("/v1/auth/login", json=login_data)
        tokens = login_response.json()
        auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

        large_image_content = b"x" * (10 * 1024 * 1024)  # 10MB
        files = {"image": ("large_test.jpg", large_image_content, "image/jpeg")}

        response = await api_client.patch("/v1/users/me/avatar", files=files, headers=auth_header)

        assert response.status_code == status.HTTP_413_REQUEST_ENTITY_TOO_LARGE


class TestUserUpdateTimestampIntegration:
    async def test_updated_at_changes_only_on_real_updates(self, api_client: AsyncClient, registered_user: dict):
        with freeze_time() as frozen_time:
            login_data = {
                "email": registered_user["email"],
                "password": "TestPass123!",
            }
            login_response = await api_client.post("/v1/auth/login", json=login_data)
            tokens = login_response.json()
            auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

            initial_response = await api_client.get("/v1/users/me", headers=auth_header)
            initial_data = initial_response.json()
            initial_updated_at = initial_data["updated_at"]
            initial_username = initial_data["username"]

            frozen_time.tick(delta=60)

            update_data = {"username": initial_username}
            response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

            assert response.status_code == status.HTTP_200_OK
            data = response.json()

            frozen_time.tick(delta=60)

            new_username = fake.user_name()
            update_data = {"username": new_username}
            response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

            assert response.status_code == status.HTTP_200_OK
            data = response.json()

            assert data["updated_at"] != initial_updated_at
            assert data["updated_at"] == IsNow(iso_string=True, delta=3, tz=UTC)

    async def test_profile_updated_at_changes_on_any_update(self, api_client: AsyncClient, registered_user: dict):
        with freeze_time() as frozen_time:
            login_data = {
                "email": registered_user["email"],
                "password": "TestPass123!",
            }
            login_response = await api_client.post("/v1/auth/login", json=login_data)
            tokens = login_response.json()
            auth_header = {"Authorization": f"Bearer {tokens['access_token']}"}

            initial_about = fake.text(max_nb_chars=100)
            update_data = {"profile": {"about": initial_about}}
            await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

            initial_response = await api_client.get("/v1/users/me", headers=auth_header)
            initial_data = initial_response.json()
            initial_profile_updated_at = initial_data["profile"]["updated_at"]

            frozen_time.tick(delta=60)

            update_data = {"profile": {"about": initial_about}}
            response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

            assert response.status_code == status.HTTP_200_OK
            data = response.json()

            assert data["profile"]["updated_at"] != initial_profile_updated_at
            assert data["profile"]["updated_at"] == IsNow(iso_string=True, delta=3, tz=UTC)

            second_profile_updated_at = data["profile"]["updated_at"]

            frozen_time.tick(delta=60)

            new_about = fake.text(max_nb_chars=100)
            update_data = {"profile": {"about": new_about}}
            response = await api_client.patch("/v1/users/me", json=update_data, headers=auth_header)

            assert response.status_code == status.HTTP_200_OK
            data = response.json()

            assert data["profile"]["about"] == new_about
            assert data["profile"]["updated_at"] != second_profile_updated_at
            assert data["profile"]["updated_at"] == IsNow(iso_string=True, delta=3, tz=UTC)
