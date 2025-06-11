import pytest_asyncio
from faker import Faker
from fastapi import status
from httpx import AsyncClient

fake = Faker()


@pytest_asyncio.fixture
async def registered_user(api_client: AsyncClient) -> dict:
    user_data = {"username": fake.user_name(), "email": fake.email(), "password": "TestPass123!"}

    response = await api_client.post("/v1/auth/register", json=user_data)
    assert response.status_code == status.HTTP_201_CREATED
    return response.json()


@pytest_asyncio.fixture
async def admin_user(api_client: AsyncClient, test_session) -> dict:
    """Create a user with ADMIN role."""
    from src.enums.user_role import UserRoleEnum
    from src.models.user import User

    user_data = {"username": fake.user_name(), "email": fake.email(), "password": "TestPass123!"}

    # Register user first
    response = await api_client.post("/v1/auth/register", json=user_data)
    assert response.status_code == status.HTTP_201_CREATED
    user_response = response.json()

    # Update role to ADMIN directly in database
    from sqlalchemy import update

    stmt = update(User).where(User.id == user_response["id"]).values(role=UserRoleEnum.ADMIN)
    await test_session.execute(stmt)
    await test_session.commit()

    return user_response


@pytest_asyncio.fixture
async def superuser(api_client: AsyncClient, test_session) -> dict:
    """Create a user with SUPERUSER role."""
    from src.enums.user_role import UserRoleEnum
    from src.models.user import User

    user_data = {"username": fake.user_name(), "email": fake.email(), "password": "TestPass123!"}

    # Register user first
    response = await api_client.post("/v1/auth/register", json=user_data)
    assert response.status_code == status.HTTP_201_CREATED
    user_response = response.json()

    # Update role to SUPERUSER directly in database
    from sqlalchemy import update

    stmt = update(User).where(User.id == user_response["id"]).values(role=UserRoleEnum.SUPERUSER, is_superuser=True)
    await test_session.execute(stmt)
    await test_session.commit()

    return user_response


@pytest_asyncio.fixture
async def auth_token(api_client: AsyncClient, registered_user: dict) -> str:
    login_data = {"email": registered_user["email"], "password": "TestPass123!"}

    response = await api_client.post("/v1/auth/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK
    token_data = response.json()
    return token_data["access_token"]


@pytest_asyncio.fixture
async def admin_auth_token(api_client: AsyncClient, admin_user: dict) -> str:
    """Get auth token for admin user."""
    login_data = {"email": admin_user["email"], "password": "TestPass123!"}

    response = await api_client.post("/v1/auth/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK
    token_data = response.json()
    return token_data["access_token"]


@pytest_asyncio.fixture
async def superuser_auth_token(api_client: AsyncClient, superuser: dict) -> str:
    """Get auth token for superuser."""
    login_data = {"email": superuser["email"], "password": "TestPass123!"}

    response = await api_client.post("/v1/auth/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK
    token_data = response.json()
    return token_data["access_token"]


@pytest_asyncio.fixture
async def auth_headers(auth_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {auth_token}"}


@pytest_asyncio.fixture
async def admin_auth_headers(admin_auth_token: str) -> dict[str, str]:
    """Auth headers for admin user."""
    return {"Authorization": f"Bearer {admin_auth_token}"}


@pytest_asyncio.fixture
async def superuser_auth_headers(superuser_auth_token: str) -> dict[str, str]:
    """Auth headers for superuser."""
    return {"Authorization": f"Bearer {superuser_auth_token}"}
