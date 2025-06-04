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
async def auth_token(api_client: AsyncClient, registered_user: dict) -> str:
    login_data = {"email": registered_user["email"], "password": "TestPass123!"}

    response = await api_client.post("/v1/auth/login", json=login_data)
    assert response.status_code == status.HTTP_200_OK
    token_data = response.json()
    return token_data["access_token"]


@pytest_asyncio.fixture
async def auth_headers(auth_token: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {auth_token}"}
