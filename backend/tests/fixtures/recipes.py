from io import BytesIO
from pathlib import Path
from typing import Protocol

import aiofiles
import pytest_asyncio
from fastapi import status
from httpx import AsyncClient

from src.core.config import Settings


@pytest_asyncio.fixture
async def test_recipe(
    api_client: AsyncClient,
    auth_headers: dict[str, str],
    tmp_path: Path,
    test_settings: Settings,
    http_client: AsyncClient,
) -> dict:
    return await _create_and_publish_recipe(
        api_client=api_client,
        auth_headers=auth_headers,
        title="Test Recipe 0",
        short_description="Test recipe description 0",
        difficulty="EASY",
        cook_time_minutes=30,
        tmp_path=tmp_path,
        test_settings=test_settings,
        http_client=http_client,
    )


@pytest_asyncio.fixture
async def test_recipes(
    api_client: AsyncClient,
    auth_headers: dict[str, str],
    tmp_path: Path,
    test_settings: Settings,
    http_client: AsyncClient,
) -> list[dict]:
    recipes = []
    for i in range(5):
        recipe = await _create_and_publish_recipe(
            api_client=api_client,
            auth_headers=auth_headers,
            title=f"Test Recipe {i}",
            short_description=f"Test recipe description {i}",
            difficulty="EASY",
            cook_time_minutes=30 + i * 5,
            tmp_path=tmp_path,
            test_settings=test_settings,
            http_client=http_client,
        )
        recipes.append(recipe)
    return recipes


class RecipeFabricProtocol(Protocol):
    async def __call__(
        self,
        auth_headers: dict[str, str],
        title: str,
        short_description: str = "Test recipe description",
        difficulty: str = "EASY",
        cook_time_minutes: int = 30,
        ingredients: list[dict[str, str]] | None = None,
        tags: list[dict[str, str]] | None = None,
        instructions: list[dict[str, str | int]] | None = None,
    ) -> dict: ...


async def _create_and_publish_recipe(
    api_client: AsyncClient,
    tmp_path: Path,
    test_settings: Settings,
    http_client: AsyncClient,
    auth_headers: dict[str, str],
    title: str,
    short_description: str = "Test recipe description",
    difficulty: str = "EASY",
    cook_time_minutes: int = 30,
    ingredients: list[dict[str, str]] | None = None,
    tags: list[dict[str, str]] | None = None,
    instructions: list[dict[str, str | int]] | None = None,
) -> dict:
    if ingredients is None:
        ingredients = [{"name": "Test Ingredient", "quantity": "1 piece"}]
    if tags is None:
        tags = [{"name": "test"}]
    if instructions is None:
        instructions = [{"step_number": 1, "description": "Test instruction"}]

    recipe_data = {
        "title": title,
        "short_description": short_description,
        "difficulty": difficulty,
        "cook_time_minutes": cook_time_minutes,
        "ingredients": ingredients,
        "tags": tags,
        "instructions": instructions,
    }

    create_response = await api_client.post("/v1/recipes/", json=recipe_data, headers=auth_headers)
    assert create_response.status_code == status.HTTP_201_CREATED
    recipe = create_response.json()
    recipe_id = recipe["id"]

    dummy_image_path = tmp_path / f"recipe_image_{recipe_id}.jpg"
    async with aiofiles.open(dummy_image_path, "wb") as f:
        await f.write(f"dummy image content for recipe {recipe_id}".encode())

    upload_url_response = await api_client.post(f"/v1/recipes/{recipe_id}/image/upload-url", headers=auth_headers)
    assert upload_url_response.status_code == status.HTTP_200_OK
    upload_info = upload_url_response.json()
    presigned_url = upload_info["url"].replace(
        f"{test_settings.server.url}/static",
        f"{test_settings.s3_storage.host}:{test_settings.s3_storage.port}",
    )
    upload_fields = upload_info.get("fields", {})
    image_path = upload_info["fields"]["key"]
    upload_fields["Content-Type"] = "image/jpg"
    async with aiofiles.open(dummy_image_path, "rb") as f:
        file_content = await f.read()

    with BytesIO(file_content) as f:
        files = {"file": (dummy_image_path.name, f, "image/jpg")}
        upload_file_response = await http_client.post(presigned_url, data=upload_fields, files=files)
    assert upload_file_response.status_code in (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT)

    update_payload = {
        "image_path": image_path,
        "is_published": True,
    }

    update_response = await api_client.patch(f"/v1/recipes/{recipe_id}", json=update_payload, headers=auth_headers)
    assert update_response.status_code in (status.HTTP_200_OK, status.HTTP_204_NO_CONTENT)

    get_response = await api_client.get(f"/v1/recipes/{recipe_id}", headers=auth_headers)
    assert get_response.status_code == status.HTTP_200_OK

    return get_response.json()


@pytest_asyncio.fixture
async def recipe_fabric(
    api_client: AsyncClient,
    tmp_path: Path,
    test_settings: Settings,
    http_client: AsyncClient,
) -> RecipeFabricProtocol:
    class RecipeFabric(RecipeFabricProtocol):
        async def __call__(
            self,
            auth_headers: dict[str, str],
            title: str,
            short_description: str = "Test recipe description",
            difficulty: str = "EASY",
            cook_time_minutes: int = 30,
            ingredients: list[dict[str, str]] | None = None,
            tags: list[dict[str, str]] | None = None,
            instructions: list[dict[str, str | int]] | None = None,
        ) -> dict:
            return await _create_and_publish_recipe(
                api_client=api_client,
                auth_headers=auth_headers,
                title=title,
                short_description=short_description,
                difficulty=difficulty,
                cook_time_minutes=cook_time_minutes,
                ingredients=ingredients,
                tags=tags,
                instructions=instructions,
                tmp_path=tmp_path,
                test_settings=test_settings,
                http_client=http_client,
            )

    return RecipeFabric()
